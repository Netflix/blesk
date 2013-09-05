var app = angular.module('blesk',[]); 

function AdminCntrl($scope, $http) {
  
  // loading all notifications
  var loadNotifications = function() {
    $http.get('/getAllNotifications')
      .then(function(res){ 
        $scope.notifications = [];
        for (var i in res.data) {
          console.log(res.data);
          res.data[i][1].expire = decodeURI(res.data[i][1].expire); 
          $scope.notifications.push(res.data[i][1]);
        }
      });
  }

  loadNotifications();

  $scope.save = function() {

    $http({
      method: 'POST',
      url: '/storeNewNotification',
      data: 'message='+encodeURI($scope.notText)+'&alertType='+encodeURI($scope.notType)+'&appId='+encodeURI($scope.notAppId)+'&expire='+encodeURI($scope.notExpireDate)
    }).
    success(function(response) {
        loadNotifications();
        $scope.notText = '';
        $scope.notType = '';
        $scope.notExpireDate = '';
        $scope.notAppId = '';
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