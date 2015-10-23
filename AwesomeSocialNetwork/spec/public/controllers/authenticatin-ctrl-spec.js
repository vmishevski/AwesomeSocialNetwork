describe('ctrl:authentication', function () {
    'use strict';

    var ctrl, authService, $controller, scope, $rootScope, $httpBackend;

    beforeEach(module('awesomeSocialNetworkApp'));

    beforeEach(inject(function (_$controller_, _$rootScope_, _$httpBackend_) {
        $controller = _$controller_;
        scope = {loginForm: {$valid: true}};
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;

    }));

    it('should attach login function on scope', function () {
        ctrl = $controller('LoginCtrl', { $scope : scope});

        expect(scope.login).toBeTruthy();
        expect(angular.isFunction(scope.login)).toBeTruthy();
    });

    it('should attach login model to scope', function () {
        ctrl = $controller('LoginCtrl', {$scope: scope});

        expect(angular.isObject(scope.loginModel)).toBeTruthy();
    });

    it('should execute login of auth service on login func', function () {
        inject(function ($q, _$state_, _AuthenticationService_) {
            var authService = _AuthenticationService_;
            var state = _$state_;
            spyOn(authService, 'login').and.callFake(function () {
                var defer = $q.defer();
                defer.resolve();
                return defer.promise;
            });

            spyOn(state, 'go');

            $httpBackend.when('GET', 'views/welcome.html').respond('');
            ctrl = $controller('LoginCtrl', {$scope: scope, AuthenticationService: authService, $state: state});

            scope.login();

            $rootScope.$apply();

            expect(authService.login).toHaveBeenCalled();
            expect(state.go).toHaveBeenCalledWith('home');
        });

    });
});

describe('ctrl:Register', function () {
    var $controller, successPromise, rejectPromise;
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
    }));

    it('should attach register function', function () {
        var ctrl = $controller('RegisterCtrl', {$scope: scope});

        expect(ctrl.register).toBeDefined();
        expect(angular.isFunction(ctrl.register)).toBeTruthy();
    });

    it('should attach user model', function () {
        var ctrl = $controller('RegisterCtrl', {$scope: scope});

        expect(ctrl.user).toBeDefined();
        expect(angular.isObject(ctrl.user)).toBeTruthy();
    });

    it('should call auth:register with user on register', function () {
        spyOn(authService, 'register').and.returnValue(successPromise.promise);

        var ctrl = $controller('RegisterCtrl', {AuthenticationService: authService, $scope: scope});

        ctrl.register();

        expect(authService.register).toHaveBeenCalled();
    });

    it('should call register with user', function () {
        spyOn(authService, 'register').and.returnValue(successPromise.promise);

        var ctrl = $controller('RegisterCtrl', {AuthenticationService: authService, $scope: scope});

        var user = {email: 'test@home.it', password: 123123};
        ctrl.user = user;
        ctrl.register();

        expect(authService.register).toHaveBeenCalledWith(user);
    });

    it('should go to home after register success', function () {

        inject(function ($rootScope) {
            var state = {
                go: function(){}
            };

            spyOn(state, 'go');
            var route = 'home';

            var ctrl = $controller('RegisterCtrl', {$state: state, AuthenticationService: authService, $scope: scope});
            ctrl.register();

            $rootScope.$apply();
            expect(state.go).toHaveBeenCalledWith(route);
        });

    });

});