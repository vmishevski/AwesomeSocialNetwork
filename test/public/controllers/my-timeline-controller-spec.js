/**
 * Created by Voislav on 11/4/2015.
 */
'use strict';

describe('ctrl: myTimeline', function () {
    var $controller, $rootScope, $httpBackend, routes, authService, UsersService, $q;

    beforeEach(module('awesomeSocialNetworkApp', 'templates'));
    beforeEach(module(function ($provide) {
        authService = {
            autoLogin: sinon.stub(),
            isAuthenticated: sinon.stub(),
            saveProfile: sinon.stub()
        };
        $provide.value('AuthenticationService', authService);

        UsersService = {
            getMyTimeline: sinon.stub()
        };
        $provide.value('UsersService', UsersService);
    }));

    beforeEach(inject(function (_$controller_, _$httpBackend_, _routesUser_, _$q_, _$rootScope_) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;
        routes = _routesUser_;
        $q = _$q_;
    }));

    it('should expose friend request list', function () {
        UsersService.getMyTimeline.returns($q.resolve());
        var ctrl = $controller('MyTimelineCtrl', {UsersService: UsersService});

        expect(ctrl.pendingFriendshipRequests).to.exist;
    });

    it('should get pending requests by calling UsersService:getMyTimeline', function () {
        var requests = [{id:'some-user'}, {id: 'another-user'}];
        UsersService.getMyTimeline.returns($q.resolve({pendingFriendshipRequests: requests}));
        var ctrl = $controller('MyTimelineCtrl', {UsersService: UsersService});

        expect(UsersService.getMyTimeline).called;
        $rootScope.$apply();

        expect(ctrl.pendingFriendshipRequests).to.include(requests[0]);
        expect(ctrl.pendingFriendshipRequests).to.include(requests[1]);
        expect(ctrl.pendingFriendshipRequests.length).to.equal(2);
    });

});