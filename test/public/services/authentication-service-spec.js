describe('service:authenticationService', function () {
    'use strict';

    var $httpMock, authService, routesUser, loginResponse, meResponse, registerResponse, sandbox;

    beforeEach(function () {
        module(function ($provide) {

        });
    });

    beforeEach(angular.mock.module('awesomeSocialNetworkApp', 'templates'));

    beforeEach(inject(function ($httpBackend, _AuthenticationService_, _routesUser_) {
        $httpMock = $httpBackend;
        authService = _AuthenticationService_;
        routesUser = _routesUser_;
        sandbox = sinon.sandbox.create();
        sandbox.stub(authService, 'autoLogin');
    }));

    afterEach(function () {
        sandbox.restore();
    });

    var failTest = function (err) {
        expect(err).not.exist;
    };

    var meUser = {
        email: 'test@yopmail.com-ccccccccc',
        fullName: 'full name'
    };

    beforeEach(function () {
        loginResponse = $httpMock.when('POST', routesUser.login).respond(200, {token: 'token'});
        meResponse = $httpMock.when('GET', routesUser.me).respond(200, meUser);
        registerResponse = $httpMock.whenPOST(routesUser.register, undefined).respond(200, {});
    });

    it('login: should save user token on login success', function (done) {
        inject(function ($rootScope) {
            expect(authService.login('testEmail@yyy.ccc', '123123'))
                .to.eventually.be.fulfilled
                .then(function () {
                    expect($rootScope.token).to.equal('token');
                })
                .should.notify(done);

            $httpMock.flush();
        });

    });

    it('login: should not save any tokens when login fails', function (done) {
        inject(function ($rootScope) {
            loginResponse.respond(401, {});

            expect(authService.login('t@ttt.com', 123))
                .to.eventually.be.rejected
                .then(function () {
                    //expect($rootScope.token).not.exist;
                }).should.notify(done);

            $httpMock.flush();
        });
    });

    it('login: should call authenticate after login', function (done) {
        sandbox.spy(authService, 'authenticate');

        authService.login('t@ttt.t', '123')
            .then(function () {
                expect(authService.authenticate).called;
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
                    expect($rootScope.currentUser).to.exist;
                    expect($rootScope.currentUser).to.eql(meUser);
                });

            $httpMock.flush();
        });
    });

    it('authenticate: should not set current user on fail authenticate', function (done) {
        inject(function ($rootScope) {
            meResponse.respond(401);

            expect(authService.authenticate())
                .to.eventually.be.rejected
                .then(function () {
                    expect($rootScope.currentUser).not.exist;
                }).should.notify(done);

            $httpMock.flush();
        });
    });

    it('logout: should reset currentUser and token from $rootScope', function () {
        inject(function ($rootScope) {
            $rootScope.currentUser = {email: 'test' };
            $rootScope.token = 'test token';

            authService.logout();

            expect($rootScope.currentUser).not.exist;
            expect($rootScope.token).not.exist;
        });
    });

    it('register: should make request for register with user model', function (done) {
        var user = {email: 'test@test.com', fullName: 'testy tester', password: '123123', confirmPassword: '123123'};
        $httpMock.expectPOST(routesUser.register, user)
            .respond(200, {});

        expect(authService.register(user)).to.eventually.be.fulfilled.and.notify(done);

        $httpMock.flush();
    });

    it('register: should call authenticate after success register', function (done) {
        //registerResponse.respond(400, '');
        sandbox.stub(authService, 'authenticate');

        expect(authService.register({email:'test@email.com'}))
            .to.eventually.be.fulfilled
            .then(function () {
                return expect(authService.authenticate).called;
            }).should.notify(done);

        $httpMock.flush();
    });

    it('register: should not call authenticate on failling to register', function (done) {
        inject(function ($q) {
            registerResponse.respond(401, {});

            sandbox.stub(authService, 'authenticate', function () {
                return $.when();
            });

            var res = authService.register({});
            expect(res).to.be.rejected.and.then(function () {
                return expect(authService.authenticate).not.called;
            }).should.notify(done);

            $httpMock.flush();
        });
    });

    it('autoLogin: should return true when currentUser on $rootScope is set', function () {
        inject(function ($rootScope) {
            $rootScope.currentUser = {email: 'test@test.com'};
            authService.autoLogin.restore(); // restore the stub

            expect(authService.autoLogin()).to.be.true;
        })
    });

    it('autoLogin: should authenticate with session credentials when rootScope is not set', function () {
        inject(function ($rootScope, $sessionStorage) {
            $rootScope.currentUser = undefined;
            $sessionStorage.currentUser = {email: 'test@test.com'};
            $sessionStorage.token = 'token';

            authService.autoLogin.restore();
            expect(authService.autoLogin()).to.be.true;
        });
    });

    it('changePassword: should make post request with provided argument', function () {
        var model = {password: '111', confirmPassword: '111'};
        $httpMock.expectPOST(routesUser.changePassword, model).respond(200, {});

        authService.changePassword(model);

        $httpMock.flush();
    });

    it('saveProfile: should make post with provided argument and call authenticate to retrieve latest profile data', function () {
        var model = {email: 'test@test.com', fullName: 'test name'};
        $httpMock.expectPOST(routesUser.saveProfile, model).respond(200, {});

        sandbox.stub(authService, 'authenticate');
        authService.saveProfile(model);

        $httpMock.flush();

        expect(authService.authenticate).called;
    });
});

describe('directive:usernameUnique', function () {
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

        expect(scope.form).exist;
        expect(scope.form.$valid).to.be.true;
        expect(scope.form.inp.$error.usernameUnique).undefined;
    });

    it('should resolve success when unique property is true', function () {
        compileDirective();

        scope.val = 'nonavailable@test.me';

        $httpMock.flush();

        expect(scope.form).exist;
        expect(scope.form.$valid).to.be.false;
        expect(scope.form.inp.$error.usernameUnique).exist;
    });

    it('should resolve success on http error', function () {
        "use strict";
        compileDirective();

        scope.val = 'error';

        $httpMock.flush();

        expect(scope.form).exist;
        expect(scope.form.$valid).to.be.true;
        expect(scope.form.inp.$error.usernameUnique).to.be.undefined;
    });

    it('should not pass', function (done) {
        inject(function ($q, $rootScope) {
            var defer = $q.defer();
            var a = defer.promise.then(function () {
                return 100;
            });

            expect(a).to.eventually.equal(100).notify(done);

            defer.resolve();

            $rootScope.$apply();

            return a;

        });
    });
});