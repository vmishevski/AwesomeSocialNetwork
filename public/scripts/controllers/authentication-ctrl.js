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

        $scope.validationErrors = false;

        $scope.login = function () {
            if($scope.loginForm.$valid){
                AuthenticationService.login($scope.loginModel.email, $scope.loginModel.password)
                    .then(function () {
                        $state.go('home');
                    })
                    .catch(function (response) {
                        if(response.status === 401){
                            $scope.validationErrors = true;
                        }
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
                AuthenticationService
                    .register(this.user)
                    .then(function () {
                        $state.go('home');
                    });
            }
        }
    }])

.controller('ProfileCtrl', ['$rootScope', 'AuthenticationService', '$scope', '$state', function ($rootScope, AuthenticationService, $scope, $state) {
        var self = this;
        self.user = angular.copy($rootScope.currentUser);

        self.saveProfileError = [];
        self.saveProfileSuccess = false;

        self.saveProfile = function () {
            self.saveProfileError = [];

            if($scope.profileForm.$invalid){
                return;
            }

            AuthenticationService.saveProfile(self.user)
                .then(function () {
                    self.saveProfileSuccess = true;
                }, function (response) {
                    if(response.status === 400){
                        self.saveProfileError = [];
                        if(response.data){
                            angular.forEach(response.data, function (errorMessage, errorProperty) {
                                self.saveProfileError.push(errorMessage);
                            });
                        }
                    }
                })
        }
    }])
.controller('ChangePasswordCtrl', ['$rootScope', 'AuthenticationService', '$scope', '$state', function ($rootScope, AuthenticationService, $scope, $state) {
        var self = this;

        self.changePasswordModel = {
            password: '',
            confirmPassword: ''
        };
        self.changePasswordError = [];
        self.changePasswordSuccess = false;

        self.changePassword = function () {
            self.changePasswordError = [];

            if(!$scope.changePasswordForm.$valid){
                return;
            }

            AuthenticationService.changePassword(self.changePasswordModel)
                .then(function (response) {
                    self.changePasswordSuccess = true;
                    //$state.go('home');
                }, function (response) {

                    if(response.status === 400){
                        self.saveProfileError = [];
                        if(response.data){
                            angular.forEach(response.data, function (errorMessage, errorProperty) {
                                self.changePasswordError.push(errorMessage);
                            });
                        }
                    }
                });
        };
    }]);