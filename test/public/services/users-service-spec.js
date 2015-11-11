/**
 * Created by Voislav on 11/2/2015.
 */
'use strict';

describe('service:UsersService', function () {
    var $httpBackend, routes, events, UsersService, authService;

    beforeEach(angular.mock.module('awesomeSocialNetworkApp'));
    beforeEach(angular.mock.module('templates'));
    beforeEach(module(function ($provide) {
        authService = {
            autoLogin: sinon.stub(),
            isAuthenticated: sinon.stub(),
            saveProfile: sinon.stub()
        };
        $provide.value('AuthenticationService', authService);
    }));

    beforeEach(inject(function (_$httpBackend_, _routesUser_, _UsersService_, _events_, $state, $q) {
        $httpBackend = _$httpBackend_;
        routes = _routesUser_;
        UsersService = _UsersService_;
        events = _events_;
        sinon.stub($state, 'go').returns($q.resolve());
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

            $rootScope.$apply();
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

    it('addFriend: should expose addFriend function', function () {
        expect(UsersService.addFriend).to.exist;
        expect(angular.isFunction(UsersService.addFriend)).to.be.true;
    });

    it('addFriend: should make http request to routes.addFriend with userId in body', function () {
        var user = {id: 'some-id'};
        $httpBackend.expectPOST(routes.addFriend, {userId: user.id}).respond(200, {});

        UsersService.addFriend(user);

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingExpectation();
    });

    it('addFriend: should not make any http requests if hasPendingRequest of user is set to true', function () {
        var user = {id: 'some-id', hasPendingRequest: true};

        UsersService.addFriend(user);

        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('getProfile: should make request to routes.profile to get the profile by id', function () {
        var user = {id: 'some-id', hasPendingRequest: true};

        $httpBackend.expectGET(routes.profile+'?userId='+user.id).respond(200, {});

        UsersService.getProfile(user.id);

        $httpBackend.flush();
    });

    it('getProfile: should convert birthDay to date', function () {
        var user = {id: 'some-id', birthDay: new Date().toISOString()};

        $httpBackend.expectGET(routes.profile+'?userId='+user.id).respond(200, user);

        expect(UsersService.getProfile(user.id)).to.eventually.be.fulfilled
            .and.then(function (response) {
                expect(response.birthDay).to.be.a('date');
        });

        $httpBackend.flush();
    });

    it('acceptFriendRequest: should make request with userId and answer=true', function () {
        var id = 'some-id';
        $httpBackend.expectPOST(routes.respondFriendRequest, {userId: id, answer: true}).respond(200, {});

        UsersService.acceptFriendRequest(id);

        $httpBackend.flush();
    });

    it('rejectFriendRequest: should make request with userId and answer=false', function () {
        var id = 'some-id';
        $httpBackend.expectPOST(routes.respondFriendRequest, {userId: id, answer: false}).respond(200, {});

        UsersService.rejectFriendRequest(id);

        $httpBackend.flush();
    });

});