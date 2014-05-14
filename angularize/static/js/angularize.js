// angularize.js
var app = angular.module('angularizeApp', ['ngGrid']);
app.controller('MyCtrl', function($scope) {
  $scope.myData = [{host: 'host1', ip: 'ip1', status: 'status1', state: 'state1'}, 
                   {host: 'host2', ip: 'ip2', status: 'status2', state: 'state2'}, 
                   {host: 'host3', ip: 'ip3', status: 'status3', state: 'state3'}, 
                   {host: 'host4', ip: 'ip4', status: 'status4', state: 'state4'}, 
                   {host: 'host5', ip: 'ip5', status: 'status5', state: 'state5'}, 
                   {host: 'host6', ip: 'ip6', status: 'status6', state: 'state6'}, 
                   {host: 'host7', ip: 'ip7', status: 'status7', state: 'state7'}, 
                   {host: 'host8', ip: 'ip8', status: 'status8', state: 'state8'}, 
                   {host: 'host9', ip: 'ip9', status: 'status9', state: 'state9'}, 
                   {host: 'host10', ip: 'ip10', status: 'status10', state: 'state10'}, 
                   {host: 'host11', ip: 'ip11', status: 'status11', state: 'state11'}
  ];

  $scope.gridOptions = { data: 'myData',
    columnDefs: [
      { field: 'toggle', displayName: '', cellTemplate: '<button ng-click="delete(row)">Delete</button>' },
      { field: 'host', displayName: 'Host' },
      { field: 'ip', displayName: 'IP' },
      { field: 'status', displayName: 'Status' },
      { field: 'state', displayName: 'State' }
    ]
  };
});
