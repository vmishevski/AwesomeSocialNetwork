'use strict';

angular.service('authenticationService',['$http', '$log', function ($http, $log) {


    return {
        login: function () {
            $log.log('auth-service:login');
        },
        register: function (user) {
            $log.log('auth-service:register');
        },
        authenticate: function (role) {
            $log.log('auth-service:authenticate');
        },
        clear: function () {
            $log.log('auth-service:clear');
        }
    }
}]);