'use strict';

var routesUser = {
    login: 'api/user/login',
    me: 'api/user/me',
    register: 'api/user/register',
    changePassword: 'api/user/changePassword',
    saveProfile: 'api/user/saveProfile',
    search: 'api/user/search',
    addFriend: 'api/user/addFriend',
    myTimeline: 'api/user/timeline'
};

var events = {
    userUnauthorizedEvent: 'user-unauthorized-event',
    userNotAuthenticatedEvent: 'user-not-authenticated-event',
    userLoginEvent: 'user-login-event',
    userLogoutEvent: 'user-logout-event',
    searchStart: 'search-start',
    searchFinish: 'search-finish'
};

angular.module('awesomeSocialNetworkApp')
    .value('events', events)

    .value('routesUser', routesUser)

    .service('AuthenticationService', ['$http', '$log', 'routesUser', '$rootScope', '$q', '$sessionStorage', function ($http, $log, routesUser, $rootScope, $q, $sessionStorage) {
        var self = this;
        self.login = function (email, password) {
            $log.log('auth-service:login', email, password);

            return $http.post(routesUser.login, {email: email, password: password})
                .then(function (response) {
                    // we now have token. save it
                    $rootScope.token = response.data.token;
                    $sessionStorage.token = response.data.token;
                    return response;
                })
                .then(function () {
                    return self.authenticate();
                });
        };

        self.autoLogin = function () {
            $log.log('auth-service:autoLogin');
            if(!!$rootScope.currentUser){
                $log.log('already authenticated')
                return true;
            }

            if(!!$sessionStorage.currentUser && !!$sessionStorage.token){
                $log.log('restoring current user from session', $sessionStorage.currentUser);
                $rootScope.currentUser = $sessionStorage.currentUser;
                $rootScope.token = $sessionStorage.token;
                self.authenticate();
            }

            return self.isAuthenticated();
        };

        self.register = function (user) {
            $log.log('auth-service:register');

            return $http.post(routesUser.register, user)
                .then(function(){
                    return self.login(user.email, user.password);
                })
                .then(function () {
                    return self.authenticate();
                });
        };

        self.authenticate = function () {
            $log.log('auth-service:authenticate');

            return $http.get(routesUser.me)
                .then(function (response) {
                    $log.log('Authenticated', response.data);
                    $rootScope.currentUser = response.data;
                    $sessionStorage.currentUser = $rootScope.currentUser;
                    return response;
                }, function (response) {
                    delete $rootScope.currentUser;
                    delete $rootScope.token;
                    delete $sessionStorage.currentUser;
                    delete $sessionStorage.token;
                    return $q.reject(response);
                });
        };

        self.isAuthenticated = function () {
            $log.log('auth-service:isAuthenticated', !!$rootScope.currentUser);
            return !!$rootScope.currentUser;
        };

        self.isAuthorized = function (role) {
            return self.isAuthenticated() && ($rootScope.currentUser.roles && $rootScope.currentUser.roles.indexOf(role) > -1);
        };

        self.logout = function () {
            $log.log('auth-service:logout');

            delete $rootScope.currentUser;
            delete $rootScope.token;
            delete $sessionStorage.token;
        };

        self.changePassword = function (changePasswordModel) {
            return $http.post(routesUser.changePassword, changePasswordModel);
        };

        self.saveProfile = function (profileModel) {
            return $http.post(routesUser.saveProfile, profileModel)
                .then(function () {
                    return self.authenticate();
                });
        }
    }])

    .service('tokenInjector', ['$rootScope', 'events', '$q', function ($rootScope, authEvents, $q) {
        return {
            'request': function (config) {
                var token = $rootScope.token;
                if (!!token && !config.file) {
                    config.headers.Authorization = 'JWT ' + token;
                }

                return config;
            },
            'responseError': function (response) {
                if (response.status === 401 || response.status === '401') {
                    $rootScope.$broadcast(authEvents.userUnauthorizedEvent);
                }

                return $q.reject(response);
            }
        };
    }])

    .directive('usernameUnique', ['$q', '$http', function ($q, $http) {
        return{
            require: 'ngModel',
            link: function (scope, element, attributes, ngModelCtrl) {
                ngModelCtrl.$asyncValidators.usernameUnique = function (modelValue, viewValue) {
                    if(ngModelCtrl.$isEmpty(modelValue)){
                        return $q.when();
                    }

                    var defer = $q.defer();
                    $http.get('api/user/usernameUnique',{
                        params: { username: modelValue }
                    })
                        .then(function (response) {
                            if(response.data.unique){
                                defer.resolve();
                            }else{
                                defer.reject();
                            }
                        }, function () {
                            // if some error happened, we cannot know if username is unique
                            // consider validation success and leave unique validation for server side processing
                            defer.resolve();
                        });

                    return defer.promise;
                }
            }
        }
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