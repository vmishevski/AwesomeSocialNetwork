/**
 * Created by Voislav on 11/2/2015.
 */
'use strict';

describe('UsersService', function () {
    var $httpBackend, routes, events, UsersService;

    beforeEach(angular.mock.module('awesomeSocialNetworkApp'));
    beforeEach(angular.mock.module('templates'));

    beforeEach(inject(function (_$httpBackend_, _routesUser_, _UsersService_, _events_) {
        $httpBackend = _$httpBackend_;
        routes = _routesUser_;
        UsersService = _UsersService_;
        events = _events_;
    }));

    afterEach(function () {
    });

    it('search: should make get request to routes.search endpoint', function () {
        $httpBackend.expectGET(function (url) {
            return url.indexOf(routes.search) > -1;
        }).respond(200, [{id: 'user 1'}, {id: 'user 2'}]);

        UsersService.search('some value');

        $httpBackend.flush();

        $httpBackend.verifyNoOutstandingExpectation();
    });

    it('search: should broadcast routes.search event on $rootScope with the response data', function () {
        inject(function ($rootScope) {
            var val = 'v v';
            var users = [{id: 'user 1'}, {id: 'user 2'}];
            $httpBackend.expectGET(function (url) {
                return url.indexOf(encodeURIComponent('v%20v')) > -1;
            }).respond(200, users);

            sinon.spy($rootScope, '$broadcast');
            UsersService.search(val);

            expect($rootScope.$broadcast).calledWith(events.searchStart);

            $httpBackend.flush();

            expect($rootScope.$broadcast).calledWith(events.searchFinish, users);
        })
    });

    it('search: should make the request with encoded value', function () {
        var val = 'v v';
        $httpBackend.expectGET(function (url) {
            return url.indexOf(encodeURIComponent('v%20v')) > -1;
        }).respond(200, [{id: 'user 1'}, {id: 'user 2'}]);

        UsersService.search(val);

        $httpBackend.flush();

        $httpBackend.verifyNoOutstandingExpectation();
    });
});