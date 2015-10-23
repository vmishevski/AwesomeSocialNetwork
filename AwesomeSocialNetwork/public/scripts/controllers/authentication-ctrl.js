/**
 * Created by Voislav on 10/10/2015.
 */

angular.module('awesomeSocialNetworkApp')
    .controller('LoginCtrl', ['$scope', 'AuthenticationService', '$state', function ($scope, AuthenticationService, $state) {
        'use strict';

        $scope.loginModel = {
            password: angular.noop(),
            email: angular.noop()
        };

        $scope.login = function () {
            if($scope.loginForm.$valid){
                AuthenticationService.login($scope.loginModel.email, $scope.loginModel.password)
                    .then(function () {
                        $state.go('home');
                    })
                    .catch(function (response) {

                    });
            }
        }
    }])

    .controller('RegisterCtrl', ['AuthenticationService', '$state', '$scope', function (AuthenticationService, $state, $scope) {

        this.user = {
            email: '',
            password: ''
        };

        this.register = function () {
            if($scope.registerForm.$valid){
                AuthenticationService.register(this.user)
                    .then(function () {
                        $state.go('home');

                    });
            }
        }
    }]);