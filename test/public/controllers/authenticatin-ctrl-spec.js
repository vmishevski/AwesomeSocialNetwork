describe('ctrl:authentication', function () {
    'use strict';

    var ctrl, authService, $controller, scope, $rootScope, $httpBackend, sandbox;

    beforeEach(module('awesomeSocialNetworkApp'));
    beforeEach(angular.mock.module('templates'));

    beforeEach(inject(function (_$controller_, _$rootScope_, _$httpBackend_, _AuthenticationService_) {
        $controller = _$controller_;
        authService = _AuthenticationService_;
        scope = {loginForm: {$valid: true}};
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;
        $httpBackend.when('GET', 'api/user/me').respond(200, {email: 'test@yopmail.com'});
        sandbox = sinon.sandbox.create();
    }));

    afterEach(function () {
        sandbox.restore();
    });

    it('should attach login function on scope', function () {
        ctrl = $controller('LoginCtrl', { $scope : scope});

        expect(scope.login).to.exist;
        expect(angular.isFunction(scope.login)).to.be.ok;

    });

    it('should attach login model to scope', function () {
        ctrl = $controller('LoginCtrl', {$scope: scope});

        expect(angular.isObject(scope.loginModel)).to.be.ok;
    });

    it('should execute login of auth service on login func', function () {
        inject(function ($q, _$state_) {
            var state = _$state_;
            sandbox.stub(authService, 'login', function () {
                var defer = $q.defer();
                defer.resolve();
                return $q.when();
            });

            sandbox.spy(state, 'go');

            ctrl = $controller('LoginCtrl', {$scope: scope, AuthenticationService: authService, $state: state});

            scope.login();

            $rootScope.$apply();

            expect(authService.login).called;
            expect(state.go).calledWith('home');
        });
    });

    it('should set validation errors property on fail login with 401 response', function () {
       inject(function ($q, _$state_) {
           var state = _$state_;
           sandbox.stub(authService, 'login', function () {
               return $q.reject({status: 401});
           });
           sandbox.stub(state, 'go');

           ctrl = $controller('LoginCtrl', {$scope: scope, AuthenticationService: authService, $state: state});

           scope.login();

           $rootScope.$apply();

           expect(authService.login).called;
           expect(state.go).not.called;
           expect(scope.validationErrors).to.be.true;
       });
    });
});

describe('ctrl:Register', function () {
    var $controller, successPromise, rejectPromise, sandbox;
    var authService = {},
        scope = {
            registerForm: {$valid: true}
        };

    beforeEach(module('awesomeSocialNetworkApp', 'templates'));
    beforeEach(module(function ($provide) {
        $provide.value('AuthenticationService', {
            autoLogin: sinon.stub(),
            isAuthenticated: sinon.stub()
        });
    }));

    beforeEach(inject(function (_$controller_, $q) {
        $controller = _$controller_;
        successPromise = $q.defer();
        successPromise.resolve();

        rejectPromise = $q.defer();
        rejectPromise.reject();

        authService.register = function () {
            return successPromise.promise;
        };

        sandbox = sinon.sandbox.create();
    }));

    afterEach(function () {
        sandbox.restore();
    });

    it('should attach register function', function () {
        var ctrl = $controller('RegisterCtrl', {$scope: scope});

        expect(ctrl.register).to.exist;
        expect(angular.isFunction(ctrl.register)).to.be.true;
    });

    it('should attach user model', function () {
        var ctrl = $controller('RegisterCtrl', {$scope: scope});

        expect(ctrl.user).to.exist;
        expect(angular.isObject(ctrl.user)).to.be.true;
    });

    it('should call auth:register with user on register', function () {
        sandbox.stub(authService, 'register').returns(successPromise.promise);

        var ctrl = $controller('RegisterCtrl', {AuthenticationService: authService, $scope: scope});

        ctrl.register();

        expect(authService.register).called;
    });

    it('should call register with user', function () {
        sandbox.stub(authService, 'register').returns(successPromise.promise);

        var ctrl = $controller('RegisterCtrl', {AuthenticationService: authService, $scope: scope});

        var user = {email: 'test@home.it', password: 123123};
        ctrl.user = user;
        ctrl.register();

        expect(authService.register).calledWith(user);
    });

    it('should go to home after register success', function () {

        inject(function ($rootScope) {
            var state = {
                go: sandbox.stub()
            };

            var route = 'home';

            var ctrl = $controller('RegisterCtrl', {$state: state, AuthenticationService: authService, $scope: scope});
            ctrl.register();

            $rootScope.$apply();

            expect(state.go).calledWith(route);
        });

    });

});

describe('ctrl:Profile', function () {
    var $controller;
    var authService = {},
        scope = {
            profileForm: {
                $valid: true,
                $invalid: false
            }
        };

    beforeEach(module('awesomeSocialNetworkApp', 'templates'));

    beforeEach(module(function ($provide) {
        authService = {
            autoLogin: sinon.stub(),
            isAuthenticated: sinon.stub(),
            saveProfile: sinon.stub()
        };
        $provide.value('AuthenticationService', authService);
    }));

    beforeEach(function () {
        inject(function (_$controller_) {
            $controller = _$controller_;
        });
    });

    it('should attach saveProfile func on scope', function () {
        var ctrl = $controller('ProfileCtrl', {$scope: scope, AuthenticationService: authService});

        expect(ctrl.saveProfile).to.be.defined;
        expect(angular.isFunction(ctrl.saveProfile)).to.be.true;
    });

    it('should attach clone of current user from $rootScope to scope', function () {
        var rootScope = {currentUser: {email: 'test@youpmail.com', fullName: 'test name'}};
        var ctrl = $controller('ProfileCtrl', {$scope: scope, $rootScope: rootScope, AuthenticationService: authService});

        expect(ctrl.user).to.eql(rootScope.currentUser);
        expect(ctrl.user).not.to.equal(rootScope.currentUser);
    });

    it('should not call service when form is invalid', function () {
        inject(function ($q) {
            scope.profileForm.$valid = false;
            scope.profileForm.$invalid = true;
            authService.saveProfile.returns($q.when());
            var ctrl = $controller('ProfileCtrl', {$scope: scope, AuthenticationService: authService});

            ctrl.saveProfile();

            expect(authService.saveProfile).not.called;
        });
    });

    it('should set success when authenticate resolves', function () {
        inject(function ($q, $rootScope) {
            scope.profileForm.$valid = true;
            scope.profileForm.$invalid = false;
            authService.saveProfile.returns($q.when());
            var ctrl = $controller('ProfileCtrl', {$scope: scope, AuthenticationService: authService});

            ctrl.saveProfile();

            $rootScope.$apply();

            expect(authService.saveProfile).called;
            expect(ctrl.saveProfileSuccess).to.be.true;
        });
    });

    it('should set error messages when authenticate rejects', function () {
        inject(function ($q, $rootScope) {
            scope.profileForm.$valid = true;
            scope.profileForm.$invalid = false;
            var errorResponse = {status: 400, data: ['error mesage']};
            authService.saveProfile.returns($q.reject(errorResponse));
            var ctrl = $controller('ProfileCtrl', {$scope: scope, AuthenticationService: authService});

            ctrl.saveProfile();

            $rootScope.$apply();

            expect(authService.saveProfile).called;
            expect(ctrl.saveProfileSuccess).to.be.false;
            expect(ctrl.saveProfileError).not.to.be.empty;
            expect(ctrl.saveProfileError).to.eql(errorResponse.data);
        });
    });
});

describe('ctrl:ChangePassword', function () {
    var $controller;
    var authService = {}, $q, $rootScope,
        scope = {
            changePasswordForm: {
                $valid: true,
                $invalid: false
            }
        };

    beforeEach(module('awesomeSocialNetworkApp', 'templates'));

    beforeEach(module(function ($provide) {
        authService = {
            autoLogin: sinon.stub(),
            isAuthenticated: sinon.stub(),
            changePassword: sinon.stub()
        };
        $provide.value('AuthenticationService', authService);
    }));

    beforeEach(inject(function (_$controller_, _$q_, _$rootScope_) {
        $controller = _$controller_;
        $q= _$q_;
        $rootScope = _$rootScope_;
    }));

    it('should attach changePasswordModel property for view', function () {
        var ctrl = $controller('ChangePasswordCtrl', {$scope: scope, AuthenticationService: authService});

        expect(ctrl.changePasswordModel).to.exist;
    });

    it('should not call service when form is not valid', function () {
        scope.changePasswordForm.$invalid = true;
        scope.changePasswordForm.$valid = false;

        var ctrl = $controller('ChangePasswordCtrl', {$scope: scope, AuthenticationService: authService});

        ctrl.changePassword();

        expect(authService.changePassword).not.called;
    });

    it('should call service when form is valid with changePasswordModel property', function () {
        authService.changePassword.returns($q.when());
        scope.changePasswordForm.$invalid = false;
        scope.changePasswordForm.$valid = true;

        var ctrl = $controller('ChangePasswordCtrl', {$scope: scope, AuthenticationService: authService});

        ctrl.changePasswordModel.password = '123';
        ctrl.changePasswordModel.confirmPassword = '123';

        ctrl.changePassword();

        $rootScope.$apply();

        expect(authService.changePassword).calledWith(ctrl.changePasswordModel);
    });

    it('should set succes on service call resolve', function () {
        authService.changePassword.returns($q.when());
        scope.changePasswordForm.$invalid = false;
        scope.changePasswordForm.$valid = true;

        var ctrl = $controller('ChangePasswordCtrl', {$scope: scope, AuthenticationService: authService});

        expect(ctrl.changePasswordSuccess).to.be.false;

        ctrl.changePassword();

        $rootScope.$apply();

        expect(ctrl.changePasswordSuccess).to.be.true;
        expect(ctrl.changePasswordError).to.be.empty;
    });

    it('should set error messages on service call reject', function () {
        var errorResponse = {status: 400, data: ['error msg']};
        authService.changePassword.returns($q.reject(errorResponse));
        scope.changePasswordForm.$invalid = false;
        scope.changePasswordForm.$valid = true;

        var ctrl = $controller('ChangePasswordCtrl', {$scope: scope, AuthenticationService: authService});

        expect(ctrl.changePasswordSuccess).to.be.false;

        ctrl.changePassword();

        $rootScope.$apply();

        expect(ctrl.changePasswordSuccess).to.be.false;
        expect(ctrl.changePasswordError).not.to.be.empty;
        expect(ctrl.changePasswordError).to.be.eql(errorResponse.data);
    });
});