'use strict';

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
        'ui.router'
    ])
    .config(function ($stateProvider, $urlRouterProvider) {
        //
        // For any unmatched url, redirect to /state1
        $urlRouterProvider.otherwise("welcome");
        //
        // Now set up the states
        $stateProvider.state('welcome',{
            url: '/welcome',
            templateUrl: 'views/welcome.html'
        });
    })
    .config(function ($httpProvider) {
        $httpProvider.interceptors.push('tokenInjector');
    })
    .run(function ($rootScope) {
        $rootScope.$on('$stateChangeError', function (event) {
            console.log('change error', event);
        });
    });