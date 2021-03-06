/**
 * Created by Voislav on 11/4/2015.
 */
'use strict';

describe('ctrl: myTimeline', function () {
    var $controller, $rootScope, $httpBackend, routes, authService, UsersService, $q, scope;

    beforeEach(module('awesomeSocialNetworkApp', 'templates'));
    beforeEach(module(function ($provide) {
        authService = {
            autoLogin: sinon.stub(),
            isAuthenticated: sinon.stub(),
            saveProfile: sinon.stub()
        };
        $provide.value('AuthenticationService', authService);

        UsersService = {
            getMyTimeline: sinon.stub(),
            getProfile: sinon.stub(),
            acceptFriendRequest: sinon.stub(),
            rejectFriendRequest: sinon.stub()
        };
        $provide.value('UsersService', UsersService);
    }));

    beforeEach(inject(function (_$controller_, _$httpBackend_, _routesUser_, _$q_, _$rootScope_) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;
        routes = _routesUser_;
        $q = _$q_;
        scope = {};
    }));

    it('should expose user param', function () {
        UsersService.getProfile.returns($q.resolve());
        var ctrl = $controller('TimelineCtrl', {UsersService: UsersService, $scope: scope});

        expect(ctrl.user).to.exist;
    });

    it('should get user by calling UserService:getProfile', function () {
        var requests = [{id:'some-user'}, {id: 'another-user'}];
        UsersService.getProfile.returns($q.resolve({pendingFriendshipRequests: requests}));
        var ctrl = $controller('TimelineCtrl', {UsersService: UsersService, $scope: scope});

        expect(UsersService.getProfile).called;
        $rootScope.$apply();

        expect(ctrl.user.pendingFriendshipRequests).to.include(requests[0]);
        expect(ctrl.user.pendingFriendshipRequests).to.include(requests[1]);
        expect(ctrl.user.pendingFriendshipRequests.length).to.equal(2);
    });

    it('shold expose accept and reject friend request functions', function () {
        UsersService.getProfile.returns($q.resolve());
        var ctrl = $controller('TimelineCtrl', {UsersService: UsersService, $scope: scope});

        expect(ctrl.acceptFriendRequest).exist;
        expect(angular.isFunction(ctrl.acceptFriendRequest)).to.be.true;
    });

    it('should call UserService:acceptFriendRequest', function () {
        var request = {userId: 'some-id'};
        UsersService.getProfile.returns($q.resolve());
        var ctrl = $controller('TimelineCtrl', {UsersService: UsersService, $scope: scope});

        ctrl.acceptFriendRequest(request);

        expect(UsersService.acceptFriendRequest).calledWith(request.userId);
    });

    it('should call UserService:rejectFriendRequest', function () {
        var request = {userId: 'some-id'};
        UsersService.getProfile.returns($q.resolve());
        var ctrl = $controller('TimelineCtrl', {UsersService: UsersService, $scope: scope});

        ctrl.rejectFriendRequest(request);

        expect(UsersService.rejectFriendRequest).calledWith(request.userId);
    });


});