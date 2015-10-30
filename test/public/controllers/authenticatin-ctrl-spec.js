describe('ctrl:authentication', function () {
    'use strict';

    var ctrl, authService, $controller, scope, $rootScope, $httpBackend, sandbox;

    beforeEach(module('awesomeSocialNetworkApp'));
    beforeEach(angular.mock.module('templates'));

    beforeEach(inject(function (_$controller_, _$rootScope_, _$httpBackend_) {
        $controller = _$controller_;
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
        inject(function ($q, _$state_, _AuthenticationService_) {
            var authService = _AuthenticationService_;
            var state = _$state_;
            sandbox.stub(authService, 'login', function () {
                var defer = $q.defer();
                defer.resolve();
                return $q.when();
            });

            sandbox.spy(state, 'go');

            $httpBackend.when('GET', 'views/welcome.html').respond('');
            ctrl = $controller('LoginCtrl', {$scope: scope, AuthenticationService: authService, $state: state});

            scope.login();

            $rootScope.$apply();

            expect(authService.login).called;
            expect(state.go).calledWith('home');
        });
    });
});

describe('ctrl:Register', function () {
    var $controller, successPromise, rejectPromise, sandbox;
    var authService = {},
        scope = {
            registerForm: {$valid: true}
        };

    beforeEach(module('awesomeSocialNetworkApp'));

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

    //it('should go to home after register success', function () {
    //
    //    inject(function ($rootScope) {
    //        var state = {
    //            go: function(){}
    //        };
    //
    //        sandbox.stub(state, 'go');
    //        var route = 'home';
    //
    //        var ctrl = $controller('RegisterCtrl', {$state: state, AuthenticationService: authService, $scope: scope});
    //        ctrl.register();
    //
    //        $rootScope.$apply();
    //        expect(state.go).calledWith(route);
    //    });
    //
    //});

});