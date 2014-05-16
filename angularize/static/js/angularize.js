// angularize.js
var app = angular.module('angularizeApp', ['ngTable', 'ngResource']);

// Lovingly borrowed from http://tagtree.tv/d3-with-rickshaw-and-angular
app.directive('rickshawChart', function () {
  return {
    scope: {
      data: '=',
      renderer: '='
    },
    template: '<div></div>',
    restrict: 'E',
    link: function postLink(scope, element, attrs) {
      scope.$watchCollection('[data, renderer]', function(newVal, oldVal){
        if(!newVal[0]){
          return;
        }
        element[0].innerHTML ='';

        var graph = new Rickshaw.Graph({
          element: element[0],
          width: attrs.width,
          height: attrs.height,
          series: [{data: scope.data, color: attrs.color}],
          renderer: scope.renderer
        });

        graph.render();
      });
    }
  };
});


app.controller('MyCtrl', function($scope, $http, $resource, $timeout, ngTableParams) {
  var Hosts = $resource('/api/v1/hosts/');
  var Data = $resource('/api/v2/data/');
  $scope.columns = [
    { field: 'id', displayName: 'ID', hidden: true },
    { field: 'name', displayName: 'Host' },
    { field: 'ip', displayName: 'IP' },
    { field: 'status', displayName: 'Status' },
    { field: 'state', displayName: 'State' }
  ];

  $scope.name = 'Real Time Status';
  $scope.data = {}
  $scope.data.status_data = [];

  $scope.tableParams = new ngTableParams({
    page: 1,
    count: 10
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

  $scope.showChart = function(event, data, ndx, isActive) {
    var my_elem
    if (!isActive) {
      data.splice(ndx + 1, 1);
      return;
    }
    data.splice(ndx + 1, 0, {dummy: true, id: ndx});

  var getData = function() {
    $http.get('api/v2/data/' + data[ndx].id).success(function(data){
      var new_data = _.map(data.fake, function(data, ndx) {
        data.x = new Date(data.time).getTime();
        data.y = data.value;
        return data;
      });
      $scope.data.status_data[ndx] = new_data;

      data.x = new Date(data.timestamp).getTime();
      data.y = data.value;
      if(_.isArray($scope.data.status_data[ndx])) {
        $scope.data.status_data[ndx].push(data);
      } else {
        $scope.data.status_data[ndx] = [data];
      }
    });
  };

  getData();
  var myIntervalFunction = function() {
    getMoreData = $timeout(function myFunction() {
      // do something
      getData();
      getMoreData = $timeout(myFunction, 10000);
    }, 10000);
  };
  myIntervalFunction();
  }
});
