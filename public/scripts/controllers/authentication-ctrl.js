/**
 * Created by Voislav on 10/10/2015.
 */
'use strict';

angular.module('awesomeSocialNetworkApp')
    .controller('LoginCtrl', ['$scope', 'AuthenticationService', '$state', function ($scope, AuthenticationService, $state) {
        'use strict';

        $scope.loginModel = {
            password: angular.noop(),
            email: angular.noop()
        };

        $scope.validationErrors = false;

        $scope.login = function () {
            if ($scope.loginForm.$valid) {
                AuthenticationService.login($scope.loginModel.email, $scope.loginModel.password)
                    .then(function () {
                        $state.go('home');
                    })
                    .catch(function (response) {
                        if (response.status === 401) {
                            $scope.validationErrors = true;
                        }
                    });
            }
        };
    }])

    .controller('RegisterCtrl', ['AuthenticationService', '$state', '$scope', function (AuthenticationService, $state, $scope) {
        this.user = {
            email: '',
            password: ''
        };

        this.register = function () {
            if ($scope.registerForm.$valid) {
                AuthenticationService
                    .register(this.user)
                    .then(function () {
                        $state.go('home');
                    });
            }
        };
    }])

    .controller('ProfileCtrl', ['$rootScope', 'AuthenticationService', '$scope', 'Upload', function ($rootScope, AuthenticationService, $scope, Upload) {
        var self = this;
        self.user = angular.copy($rootScope.currentUser);

        self.days = [];
        for (var d = 1; d <= 31; d++) {
            self.days.push(d);
        }
        self.months = [];
        for (var m = 1; m <= 12; m++) {
            self.months.push(m);
        }
        self.years = [];
        for (var y = 2015; y >= 1900; y--) {
            self.years.push(y);
        }


        self.saveProfileError = [];
        self.saveProfileSuccess = false;
        self.file = '';
        self.birthDay = {
            day: undefined,
            month: undefined,
            year: undefined
        };
        if (self.user.birthDay) {
            var date = new Date(self.user.birthDay);
            self.birthDay.day = date.getDay().toString();
            self.birthDay.month = (date.getMonth() + 1).toString();
            self.birthDay.year = (date.getFullYear()).toString();
        }

        self.saveProfile = function () {
            self.saveProfileError = [];

            if ($scope.profileForm.$invalid) {
                return;
            }

            self.user.birthDay = new Date(Date.UTC(self.birthDay.year, parseInt(self.birthDay.month), self.birthDay.day)).toISOString();

            AuthenticationService.saveProfile(self.user)
                .then(function () {
                    self.saveProfileSuccess = true;
                }, function (response) {
                    if (response.status === 400) {
                        self.saveProfileError = [];
                        if (response.data) {
                            angular.forEach(response.data, function (errorMessage) {
                                self.saveProfileError.push(errorMessage);
                            });
                        }
                    }
                });
        };

        self.uploadFile = function (file) {
            Upload.upload({
                url: 'https://api.cloudinary.com/v1_1/' + $.cloudinary.config().cloud_name + '/upload',
                file: file,
                fields: {
                    upload_preset: $.cloudinary.config().upload_preset
                }
            }).progress(function (e) {
                file.progress = Math.round((e.loaded * 100.0) / e.total);
                file.status = "Uploading... " + file.progress + "%";
            }).success(function (data, status, headers, config) {
                self.user.profileImage = data;
            }).error(function (data, status, headers, config) {
                file.result = data;
            });
        };
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

            if (!$scope.changePasswordForm.$valid) {
                return;
            }

            AuthenticationService.changePassword(self.changePasswordModel)
                .then(function () {
                    self.changePasswordSuccess = true;
                    //$state.go('home');
                }, function (response) {

                    if (response.status === 400) {
                        self.saveProfileError = [];
                        if (response.data) {
                            angular.forEach(response.data, function (errorMessage) {
                                self.changePasswordError.push(errorMessage);
                            });
                        }
                    }
                });
        };
    }])
    .controller('HeaderCtrl', ['AuthenticationService', 'UsersService', '$state', function (AuthenticationService, UsersService, $state) {
        var self = this;

        self.logout = function () {
            AuthenticationService.logout();
            $state.go('welcome');
        };

        self.searchValue = '';
        var lastSearchValue = '';
        self.search = function () {
            if(self.searchValue.length > 0 && self.searchValue !== lastSearchValue){
                lastSearchValue = self.searchValue;
                UsersService.search(self.searchValue);
            }
        };
    }]);