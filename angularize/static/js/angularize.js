// angularize.js
var app = angular.module('angularizeApp', ['ngTable', 'ngResource']);

// Lovingly borrowed from http://tagtree.tv/d3-with-rickshaw-and-angular
app.directive('rickshawChart', function () {
  return {
    scope: {
      data: '=',
      renderer: '=',
      interval: '=',
      history: '=',
      index: '='
    },
    template: '<div></div>',
    restrict: 'E',
    link: function postLink(scope, element, attrs) {
      scope.graph = {};
      scope.$watch('data', function() {
        scope.my_data = [{data: scope.data[scope.index - 1], name: attrs.chartName, color: attrs.color}];
        if(!scope.data[scope.index - 1]) {
          return;
        }
        if (_.isEmpty(scope.graph)) {
          element[0].innerHTML ='';
          scope.series = new Rickshaw.Series.FixedDuration([{
              name: attrs.chartName, color: attrs.color 
            }], undefined, {
              timeInterval: scope.interval * 1000,
              maxDataPoints: scope.history,
              // TODO: Pull this from the data
              timeBase: new Date().getTime() / 1000
            });

          scope.graph = new Rickshaw.Graph({
            element: element[0],
            width: attrs.width,
            height: attrs.height,
            series: scope.series,
            renderer: scope.renderer,
            padding: {
              top: 0.1
            }
          });

   	  var detail = new Rickshaw.Graph.HoverDetail({ 
   	    graph: scope.graph,
   	    xFormatter: function(x, y) {
              return '<span class="label label-default">' + new Date(x * 1000).toUTCString() + '</span>';
   	    },
   	    yFormatter: function(y) {
              return parseInt(y, 10);
            }
   	  });
        } else {
          var data = {};
          data[attrs.chartName] = scope.my_data[0].data[scope.my_data[0].data.length - 1].y;
          scope.graph.series.addData(data);
        }
        scope.graph.render();
      }, true);

      scope.$watchCollection('[history]', function() {
        if ('series' in scope) {
          scope.series.maxDataPoints = scope.history;
        }
      });

      scope.$watchCollection('[interval]', function() {
        if ('series' in scope) {
          scope.series.setTimeInterval(scope.interval * 1000);

          // TODO: Pull this from the data
          scope.series.setTimeBase(new Date().getTime() / 1000);
        }
      });

      scope.$watchCollection('[renderer]', function(newVal) {
        if(!newVal[0] || _.isEmpty(scope.graph)){
          return;
        }
        scope.graph.configure({
          renderer: scope.renderer,
          padding: {
            top: 0.1
          }
        });
        scope.graph.render();
      });
    }
  };
});


app.controller('MyCtrl', function($scope, $http, $interval, $resource, $timeout, ngTableParams) {
  var Hosts = $resource('/api/v1/hosts/');
  var Data = $resource('/api/v2/data/');
  $scope.columns = [
    { field: 'id', displayName: 'ID', hidden: true },
    { field: 'name', displayName: 'Host' },
    { field: 'ip', displayName: 'IP' },
    { field: 'status', displayName: 'Status' },
    { field: 'state', displayName: 'State' }
  ];

  $scope.data = {}
  $scope.data.status_data = [];
  $scope.data.chart_data = [];
  $scope.history = 20;
  $scope.interval = 1;
  $scope.chart_type = 'line';

  $scope.tableParams = new ngTableParams({
    page: 1,
    count: 11
  }, {
    counts: [],
    total: 0,
    getData: function($defer, params) {
      var my_params = params.url();
      my_params.limit = my_params.count;
      my_params.offset = my_params.count * (my_params.page - 1);
      delete my_params.count;
      delete my_params.page;
      Hosts.get(my_params, function(data) {
        $timeout(function() {

          // update table params
          params.total(data.meta.total_count);

          // set new data
          $defer.resolve(data.objects);
        }, 500);
      }); 
    }
  }); 

  $scope.getData = function(data, ndx) {
    $http.get('api/v2/data/' + data[ndx].id + '/').success(function(data){
      //var new_data = _.map(data.fake, function(data, ndx) {
      //  data.x = new Date(data.time).getTime();
      //  data.y = data.value;
      //  return data;
      //});
      //$scope.data.status_data[ndx] = new_data;
      data.x = new Date(data.timestamp).getTime();
      data.y = data.value;
      if(_.isArray($scope.data.status_data[ndx])) {
        $scope.data.status_data[ndx].push(data);
        $scope.data.status_data[ndx] = _.last($scope.data.status_data[ndx], $scope.history);
      } else {
        $scope.data.status_data[ndx] = [data];
      }
    });
  };

  $scope.showChart = function(event, data, ndx, notActive) {
    var my_elem
    if (!notActive) {
      data.splice(ndx + 1, 1);
      return;
    }

    data.splice(ndx + 1, 0, {dummy: true, id: ndx});

    $scope.getData(data, ndx);
    $scope.data.chart_data = data;
  };

  $scope.updateCharts = function() {
    return $interval(function() {
      for (var ii = 0; ii < $scope.data.chart_data.length; ii++) {
        if ('dummy' in $scope.data.chart_data[ii]) {
          $scope.getData($scope.data.chart_data, ii - 1);
        }
      }

      }, $scope.interval * 1000);
  };

  $scope.$watch('interval', function() {
    $interval.cancel($scope.updating);
    $scope.updating = $scope.updateCharts();
  });
});
