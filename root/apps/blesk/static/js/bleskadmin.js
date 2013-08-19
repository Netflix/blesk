var app = angular.module('blesk',[]); 

function AdminCntrl($scope, $http) {
  
  // loading all notifications
  var loadNotifications = function() {
    $http.get('/getAllNotifications')
      .then(function(res){ 
        $scope.notifications = [];
        for (var i in res.data) {
          $scope.notifications.push(res.data[i][1]);
        }
      });
  }

  loadNotifications();

  $scope.save = function() {
    var formData = {
      'message' : $scope.notText,
      'alertType' : $scope.notType,
      'appId' : $scope.notAppId,
      'expire' : $scope.notExpireDate
    };
    $http({
      method: 'POST',
      url: '/storeNewNotification/'+encodeURIComponent($scope.notText)+'/'+encodeURIComponent($scope.notType)+'/'+encodeURIComponent($scope.notExpireDate)+'/'+encodeURIComponent($scope.notAppId)
    }).
    success(function(response) {
        loadNotifications();
    }).
    error(function(response) {
        alert('Could not add a new notification :(');
    });
  }

  $scope.delete = function(key) {
    $http({
      method: 'POST',
      url: '/removeNotification/'+key,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).
    success(function(response) {
        loadNotifications();
    }).
    error(function(response) {
        alert('Could not delete');
    });
  }

}