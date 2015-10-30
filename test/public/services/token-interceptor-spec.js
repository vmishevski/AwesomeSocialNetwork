describe('service:token-interceptor', function () {
    "use strict";

    var $httpMock, $http, routesUser, authResponse, sandbox;

    beforeEach(angular.mock.module('awesomeSocialNetworkApp'));
    beforeEach(angular.mock.module('templates'));
    beforeEach(function () {
        module('awesomeSocialNetworkApp', function ($provide) {
            $provide.value('AuthenticationService', {
                autoLogin: sinon.stub(),
                isAuthenticated: sinon.stub()
            });
        });
    });

    beforeEach(inject(function($injector){
        $httpMock = $injector.get('$httpBackend');
        $http = $injector.get('$http');
        routesUser = $injector.get('routesUser');

        authResponse = $httpMock.when('POST', function () {
            return true;
        }).respond(200);

        sandbox = sinon.sandbox.create();
    }));

    afterEach(function () {
        $httpMock.verifyNoOutstandingExpectation();
        $httpMock.verifyNoOutstandingRequest();
    });

    it('should inject token as authorization header', function () {
        var $rootScope;
        inject(function ($injector) {
            // setup current user
            $rootScope = $injector.get('$rootScope');
            $rootScope.token = 'test-token';
        });

        // expect Authorization header to be set
        $httpMock.expectPOST(routesUser.me, undefined, function (headers) {
            return headers.Authorization === 'JWT test-token';
        }).respond(200);

        $http.post(routesUser.me, undefined);
        $httpMock.flush();

    });

    it('should not include Authorization header if no user is set', function(){
        $httpMock.whenPOST('test', undefined, function (headers) {
            return typeof (headers.Auhtorization) === 'undefined';
        }).respond(200);

        $http.post('test', {});
        $httpMock.flush();
    });

    it('should broadcast user unauthorized event on 401 response', function (done) {
        inject(function ($rootScope) {
            sandbox.spy($rootScope, '$broadcast');

            authResponse.respond(401, '');

            $http.post('injTest', {})
                .finally(function () {
                    expect($rootScope.$broadcast).called;
                    done();
                });

            $httpMock.flush();
        });
    });
});