describe('ctrl:authentcation', function () {
    'use strict';

    var ctrl, authService, $controller, scope, $rootScope, $httpBackend;

    beforeEach(module('awesomeSocialNetworkApp'));

    beforeEach(inject(function (_$controller_, _$rootScope_, _$httpBackend_) {
        $controller = _$controller_;
        scope = {};
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
            spyOn(authService, 'login').and.callFake(function (email, pass) {
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