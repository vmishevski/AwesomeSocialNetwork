/**
 * Created by Voislav on 11/2/2015.
 */
'use strict';

describe.only('HeaderCtrl', function () {
    var $controller, ctrl, AuthenticationService, UsersService;

    beforeEach(angular.mock.module('awesomeSocialNetworkApp'));
    beforeEach(angular.mock.module('templates'));

    beforeEach(inject(function (_$controller_, $q) {
        $controller = _$controller_;
        AuthenticationService = {
            logout: sinon.stub()
        };
        UsersService = {
            search: sinon.stub().returns($q.resolve())
        };
    }));

    it('should attach search function and search value', function () {
        ctrl = $controller('HeaderCtrl', {UsersService: UsersService, AuthenticationService: AuthenticationService});

        expect(ctrl.search).to.exist;
        expect(angular.isFunction(ctrl.search)).to.be.ok;

        expect(ctrl.searchValue).to.defined;
    });

    it('should attach logout function', function () {
        ctrl = $controller('HeaderCtrl', {UsersService: UsersService, AuthenticationService: AuthenticationService});

        expect(ctrl.logout).to.exist;
        expect(angular.isFunction(ctrl.logout)).to.be.ok;
    });

    it('should call AuthenticationService::logout on logout', function () {
        ctrl = $controller('HeaderCtrl', {UsersService: UsersService, AuthenticationService: AuthenticationService});

        ctrl.logout();

        expect(AuthenticationService.logout).called;
    });

    it('should call UsersService::search on search with search value', function () {
        ctrl = $controller('HeaderCtrl', {UsersService: UsersService, AuthenticationService: AuthenticationService});

        var val = 'value';
        ctrl.searchValue = val;
        ctrl.search();

        expect(UsersService.search).calledWith(val);
    });

    it('should not call UsersService::search multiple times with same value', function () {
        ctrl = $controller('HeaderCtrl', {UsersService: UsersService, AuthenticationService: AuthenticationService});

        var val = 'value';
        ctrl.searchValue = val;
        ctrl.search();
        ctrl.search();
        ctrl.search();
        ctrl.search();

        expect(UsersService.search).calledOnce;
    });
});