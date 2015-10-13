describe('service:authenticationService', function () {
    'use strict';

    var $httpMock, authService, routesUser, loginResponse, meResponse;

    beforeEach(angular.mock.module('awesomeSocialNetworkApp'));

    beforeEach(inject(function ($httpBackend, _AuthenticationService_, _routesUser_) {
        $httpMock = $httpBackend;
        authService = _AuthenticationService_;
        routesUser = _routesUser_;
    }));

    var failTest = function (err) {
        expect(err).toBeUndefined();
    };

    var meUser = {
        email: 'test@yopmail.com',
        fullName: 'full name'
    };

    beforeEach(function () {
        loginResponse = $httpMock.when('POST', routesUser.login).respond(200, {token: 'token'});
        meResponse = $httpMock.when('GET', routesUser.me).respond(200, meUser);
    });


    it('login: should save user token on login success', function (done) {
        inject(function ($rootScope) {
            authService.login('testEmail@yyy.ccc', '123123')
                .then(function () {
                    expect($rootScope.token).toEqual('token');
                })
                .catch(failTest)
                .finally(done);

            $httpMock.flush();
        });

    });

    it('login: should not save any tokens when login fails', function (done) {
        inject(function ($rootScope) {
            loginResponse.respond(401, {});

            authService.login('t@ttt.com', 123)
                .finally(function () {
                    expect($rootScope.token).toBeUndefined();

                    done();
                });

            $httpMock.flush();
        });
    });

    it('login: should call authenticate after login', function (done) {
        spyOn(authService, 'authenticate').and.callThrough();

        authService.login('t@ttt.t', '123')
            .then(function () {
                expect(authService.authenticate).toHaveBeenCalled();
                done();
            })
            .catch(failTest)
            .finally(done);

        $httpMock.flush();
    });

    it('authenticate: should set current user on root scope on authenticate', function () {
        inject(function ($rootScope) {
            authService.authenticate()
                .then(function () {
                    expect($rootScope.currentUser).toBeDefined();
                    expect($rootScope.currentUser).toEqual(meUser);
                });

            $httpMock.flush();
        });
    });

    it('authenticate: should not set current user on fail authenticate', function () {
        inject(function ($rootScope) {
            meResponse.respond(401);

            authService.authenticate()
                .then(function () {
                    expect($rootScope.currentUser).toBeUndefined();
                });

            $httpMock.flush();
        });
    });

    it('clear: should reset currentUser and token from $rootScope', function () {
        inject(function ($rootScope) {
            $rootScope.currentUser = {email: 'test' };
            $rootScope.token = 'test token';

            authService.clear();

            expect($rootScope.currentUser).toBeUndefined();
            expect($rootScope.token).toBeUndefined();
        });
    });
});