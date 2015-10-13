'use strict';

var routesUser = {
    login: 'api/user/login',
    me: 'api/user/me',
    register: 'api/user/register'
};

var authEvents = {
    userUnauthorizedEvent: 'user-unauthorized-event',
    userNotAuthenticatedEvent: 'user-not-authenticated-event',
    userLoginEvent: 'user-login-event',
    userLogoutEvent: 'user-logout-event'
};

angular.module('awesomeSocialNetworkApp')
    .value('authEvents', authEvents)

    .value('routesUser', routesUser)

    .service('AuthenticationService', ['$http', '$log', 'routesUser', '$rootScope', '$q', function ($http, $log, routesUser, $rootScope, $q) {
        var self = this;
        self.login = function (email, password) {
            $log.log('auth-service:login', email, password);

            return $http.post(routesUser.login, {email: email, password: password})
                .then(function (response) {
                    // we now have token. save it
                    $rootScope.token = response.data.token;
                    return response;
                })
                .then(function () {
                    return self.authenticate();
                });
        };

        self.register = function (user) {
            $log.log('auth-service:register');

            return $http.post(routesUser.register, user)
                .then(function () {
                    return self.authenticate();
                });
        };

        self.authenticate = function () {
            $log.log('auth-service:authenticate');

            return $http.get(routesUser.me)
                .then(function (response) {
                    $rootScope.currentUser = response.data;
                    return response;
                });
        };

        self.isAuthenticated = function () {
            $log.log('auth-service:isAuthenticated');
            return !!$rootScope.currentUser;
        };

        self.clear = function () {
            $log.log('auth-service:clear');

            delete $rootScope.currentUser;
            delete $rootScope.token;
        };

        $rootScope.$on()
    }])

    .service('tokenInjector', ['$rootScope', 'authEvents', '$q', function ($rootScope, authEvents, $q) {
        return {
            'request': function (config) {
                if (!!$rootScope.token) {
                    config.headers.Authorization = 'JWT ' + $rootScope.token;
                }

                return config;
            },
            'responseError': function (response) {
                if (response.status === 401 || response.status === '401') {
                    $rootScope.$broadcast(authEvents.userUnauthorizedEvent);
                    $rootScope.testtest = 100;
                }

                return $q.reject(response);
            }
        };
    }]);


// login -> server OK -> save token
// get user -> server OK -> save user
// auth route -> use saved token -> server OK -> stuff
// auth route -> in memory authenticated -> server 401 Unauthorized -> clear current user -> notify event
// load route -> check current auth ->
//      yes? -> compute authorization -> continue to route ->
//                                                              server OK -> profit ???
//                                                              401 Unauthorized -> clear user -> notify event
//      no? -> notify event