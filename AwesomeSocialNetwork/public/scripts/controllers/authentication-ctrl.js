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
            AuthenticationService.login($scope.loginModel.email, $scope.loginModel.password)
                .then(function () {
                    $state.go('home');
                })
                .catch(function (response) {

                });
        }
    }])

    .controller('RegisterCtrl', ['$scope', function ($scope) {
        $scope.register = function () {

        }
    }]);