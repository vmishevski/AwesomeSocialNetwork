/**
 * @ngdoc overview
 * @name awesomeSocialNetworkApp
 * @description
 * # awesomeSocialNetworkApp
 *
 * Main module of the application.
 */
angular
    .module('awesomeSocialNetworkApp', [
        'ngAnimate',
        'ngAria',
        'ngCookies',
        'ngMessages',
        'ngResource',
        'ngSanitize',
        'ui.router',
        'ngStorage',
        'ngFileUpload',
        'cloudinary',
        'awesomeSocialNetworkApp.config'
    ])
    .config(function ($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('welcome');

        $stateProvider.state('welcome', {
            url: '/welcome',
            templateUrl: 'views/welcome.html'
        }).state('home', {
            url: '/home',
            views: {
                '': {
                    templateUrl: 'views/home.html'
                },
                'chat@home': {
                    templateUrl: 'views/chat.html',
                    controller: 'ChatCtrl as vm'
                },
                'conversations@home': {
                    templateUrl: 'views/conversations.html',
                    controller: 'ConversationsCtrl as vm'
                }
            }
        }).state('home.settings', {
            url: '/settings',
            templateUrl: 'views/settings.html'
        }).state('home.settings.profile', {
            url: '/profile',
            templateUrl: 'views/profile.html',
            controller: 'ProfileCtrl as vm'
        }).state('home.settings.changePassword', {
            url: '/changePassword',
            templateUrl: 'views/changePassword.html',
            controller: 'ChangePasswordCtrl as vm'
        }).state('home.search', {
            url: '/search?q',
            templateUrl: 'views/search.html',
            controller: 'SearchCtrl as vm'
        }).state('home.timeline', {
            url: '/:userId',
            templateUrl: 'views/timeline.html',
            controller: 'TimelineCtrl as vm'
        });

        //$stateProvider.state('base', {
        //    abstract: true,
        //    template: '<div ui-view="A"></div><div ui-view="B"></div>'
        //});
        //$stateProvider.state('base.index', {
        //    url: '/index',
        //    views: {
        //        'A': {
        //            template: '<h1>Hello from A</h1>'
        //        },
        //        'B': {
        //            template: '<h1>Hello from B</h1>'
        //        }
        //    }
        //});
    })
    .config(function ($httpProvider, $localStorageProvider) {
        $httpProvider.interceptors.push('tokenInjector');
        $localStorageProvider.setKeyPrefix('awesomeSocialNetworkApp');
    })
    .run(function ($rootScope, $log, AuthenticationService, $state) {
        AuthenticationService.autoLogin();

        $rootScope.$on('$stateChangeError', function (event) {
            $log.log('change error', event);
        });

        $rootScope.$on('$stateNotFound', function (event, unfoundState) {
            console.log(unfoundState.to);
            console.log(unfoundState.toParams);
            console.log(unfoundState.options);
        });

        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            var authorizedRotes = ['home', 'profile'];
            $log.log('state change from', fromState.name, 'to', toState.name);

            if (!toState) {
                return;
            }

            if (!AuthenticationService.isAuthenticated()) {
                $log.log('user not authenticated');
                if (!AuthenticationService.autoLogin()) {
                    if (authorizedRotes.indexOf(toState.name) > -1) {
                        event.preventDefault();
                        $state.go('welcome');
                        return;
                    }

                    var split = toState.name.split('.');
                    for (var i = 0; i < split.length; i++) {
                        if (authorizedRotes.indexOf(split[i]) > -1) {
                            event.preventDefault();
                            $state.go('welcome');
                            return;
                        }
                    }
                }
            }
        });
    });