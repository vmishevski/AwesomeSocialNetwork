describe('service:authenticationService', function () {
    'use strict';

    var $httpMock, authService, routesUser, loginResponse, meResponse, registerResponse;

    beforeEach(angular.mock.module('awesomeSocialNetworkApp', 'templates'));

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
        registerResponse = $httpMock.whenPOST(routesUser.register, undefined).respond(200, {});
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

    it('logout: should reset currentUser and token from $rootScope', function () {
        inject(function ($rootScope) {
            $rootScope.currentUser = {email: 'test' };
            $rootScope.token = 'test token';

            authService.logout();

            expect($rootScope.currentUser).toBeUndefined();
            expect($rootScope.token).toBeUndefined();
        });
    });

    it('register: should make request for register with user model', function (done) {
        var user = {email: 'test@test.com', fullName: 'testy tester', password: '123123', confirmPassword: '123123'};
        $httpMock.expectPOST(routesUser.register, user)
            .respond(200, {});

        authService.register(user)
            .catch(failTest)
            .finally(done);

        $httpMock.flush();
    });

    it('register: should call authenticate after success register', function (done) {
        //registerResponse.respond(400, '');
        spyOn(authService, 'authenticate');

        authService.register({email:'test@email.com'})
            .then(function () {
                expect(authService.authenticate).toHaveBeenCalled();
            })
            .catch(failTest())
            .finally(done);

        $httpMock.flush();
    });

    it('register: should not call authenticate on failling to register', function (done) {
        inject(function ($q) {
            registerResponse.respond(401, {});

            spyOn(authService, 'authenticate').and.callFake(function () {
                var defer = $q.defer();
                defer.resolve();
                return defer.promise;
            });

            authService.register({})
                .finally(function () {
                    expect(authService.authenticate).not.toHaveBeenCalled();
                    done();
                });

            $httpMock.flush();
        });
    });
});

describe('usernameUnique', function () {
    beforeEach(angular.mock.module('awesomeSocialNetworkApp', 'templates'));

    var $httpMock, scope, elem;

    var compileDirective = function (element) {
        if(!element){
            element = '<form name="form"><input type="text" name="inp" username-unique ng-model="val" /></form>';
        }

        inject(function (_$rootScope_, $compile) {
            scope = _$rootScope_.$new();
            scope.val = '';
            $compile(element)(scope);
            scope.$digest();
        });
    };

    beforeEach(inject(function ($httpBackend) {
        $httpMock = $httpBackend;

        $httpMock.when('GET', 'api\/user\/usernameUnique\?username=available@test.me', undefined).respond(200, {unique: true});
        $httpMock.when('GET', 'api\/user\/usernameUnique\?username=nonavailable@test.me', undefined).respond(200, {unique: false});
        $httpMock.when('GET', 'api\/user\/usernameUnique\?username=error', undefined).respond(400, '');
        $httpMock.when('GET', 'api/user/me').respond(200, {email: 'test@test.com'});
    }));

    it('should reject validation when unique property is false', function () {
        compileDirective();

        scope.val = 'available@test.me';

        $httpMock.flush();

        expect(scope.form).toBeDefined();
        expect(scope.form.$valid).toBeTruthy();
        expect(scope.form.inp.$error.usernameUnique).toBeUndefined();
    });

    it('should resolve success when unique property is true', function () {
        compileDirective();

        scope.val = 'nonavailable@test.me';

        $httpMock.flush();

        expect(scope.form).toBeDefined();
        expect(scope.form.$valid).toBeFalsy();
        expect(scope.form.inp.$error.usernameUnique).toBeDefined();
    });

    it('should resolve success on http error', function () {
        "use strict";
        compileDirective();

        scope.val = 'error';

        $httpMock.flush();

        expect(scope.form).toBeDefined();
        expect(scope.form.$valid).toBeTruthy();
        expect(scope.form.inp.$error.usernameUnique).toBeUndefined();
    });
});