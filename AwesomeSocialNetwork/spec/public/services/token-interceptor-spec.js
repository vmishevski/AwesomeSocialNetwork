describe('service:token-interceptor', function () {
    "use strict";

    var $httpMock, $http, routesUser, authResponse;

    beforeEach(angular.mock.module('awesomeSocialNetworkApp'));
    beforeEach(angular.mock.module('templates'));

    beforeEach(inject(function($injector){
        $httpMock = $injector.get('$httpBackend');
        $http = $injector.get('$http');
        routesUser = $injector.get('routesUser');

        authResponse = $httpMock.when('POST', function () {
            return true;
        }).respond(200);
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
            $rootScope.currentUser = {token: 'test-token'};
        });

        // expect Authorization header to be set
        $httpMock.whenPOST(routesUser.me, undefined, function (headers) {
            return headers.Authorization === 'JWT test-token';
        }).respond(200);

        $http.post(routesUser.me, {});
        $httpMock.flush();
    });

    it('should not include Authorization header if no user is set', function(){
        $httpMock.whenPOST('test', undefined, function (headers) {
            return typeof (headers.Auhtorization) === 'undefined';
        }).respond(200);

        $http.post('test', {});
        $httpMock.flush();
    });

    //it('should broadcast user unauthorized event on 401 response', function () {
    //
    //    inject(function ($rootScope) {
    //        spyOn($rootScope, '$broadcast');
    //
    //        authResponse.respond(401, '');
    //
    //        $http.post('injTest', {})
    //            .finally(function () {
    //                expect($rootScope.$broadcast).toHaveBeenCalled();
    //            });
    //
    //        $httpMock.flush();
    //    });
    //});
});