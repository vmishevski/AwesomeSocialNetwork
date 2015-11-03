/**
 * Created by Voislav on 11/2/2015.
 */
'use strict';

describe('ctrl:search', function () {
    var authService, UsersService, $rootScope, $controller, events;

    beforeEach(angular.mock.module('awesomeSocialNetworkApp'));
    beforeEach(angular.mock.module('templates'));
    beforeEach(module(function ($provide) {
        authService = {
            autoLogin: sinon.stub(),
            isAuthenticated: sinon.stub(),
            saveProfile: sinon.stub()
        };
        $provide.value('AuthenticationService', authService);

        UsersService = {
            getProfile: sinon.stub(),
            search: sinon.stub()
        };
        $provide.value('UsersService', UsersService);

        $rootScope = {
            $on: sinon.stub()
        };
    }));

    beforeEach(inject(function (_events_, _$controller_) {
        events = _events_;
        $controller = _$controller_;
    }));

    it('should wait for events:searchStart and events:searchFinish on rootScope', function () {
        var ctrl = $controller('SearchCtrl', {$rootScope: $rootScope, UsersService: UsersService});

        expect($rootScope.$on).calledWith(events.searchStart);
        expect($rootScope.$on).calledWith(events.searchFinish);
    });

    it('should searching flag to false on load', function () {
        var ctrl = $controller('SearchCtrl', {$rootScope: $rootScope, UsersService: UsersService});

        expect(ctrl.searching).to.be.false;
    });

    it('should set searching flag on searchStart event', function () {
        $rootScope.$on.callsArg(1);
        var ctrl = $controller('SearchCtrl', {$rootScope: $rootScope, UsersService: UsersService});

        expect(ctrl.searching).to.exist;
        expect(ctrl.searching).to.be.true;
    });

    it('should expose results', function () {
        var ctrl = $controller('SearchCtrl', {$rootScope: $rootScope, UsersService: UsersService});

        expect(ctrl.results).to.exist;
        expect(angular.isArray(ctrl.results)).to.be.true;
        expect(ctrl.results).to.be.empty;
    });

    it('should set results with value provided on searchFinish', function () {
        var res = [{id: 'one'}, {id: 'two'}];
        $rootScope.$on.callsArgWith(1, 'event', res);
        var ctrl = $controller('SearchCtrl', {$rootScope: $rootScope, UsersService: UsersService});

        expect(ctrl.results).to.eql(res);
    });

    it('should clear results on search start', function () {
        var res = [{id: 'one'}, {id: 'two'}];
        var ctrl = $controller('SearchCtrl', {$rootScope: $rootScope, UsersService: UsersService});

        $rootScope.$on.withArgs(events.searchStart).callArg(1);
        $rootScope.$on.withArgs(events.searchFinish).callArg(1, 'event', res);
        $rootScope.$on.withArgs(events.searchStart).callArg(1);
        expect(ctrl.results).to.be.empty;
    });

    it('should call UserService::search when q param provided', function () {
        var stateParams = {q: 'val'};
        var ctrl = $controller('SearchCtrl', {$rootScope: $rootScope, UsersService: UsersService, $stateParams: stateParams});

        expect(UsersService.search).called;
    });
});