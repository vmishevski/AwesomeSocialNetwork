/**
 * Created by Voislav on 11/2/2015.
 */
'use strict';

describe('HeaderCtrl', function () {
    var $controller, ctrl, AuthenticationService, $state;

    beforeEach(angular.mock.module('awesomeSocialNetworkApp'));
    beforeEach(angular.mock.module('templates'));

    beforeEach(inject(function (_$controller_, $q) {
        $controller = _$controller_;
        AuthenticationService = {
            logout: sinon.stub()
        };
        $state = {
            go: sinon.stub()
        };
    }));

    it('should attach search function and search value', function () {
        ctrl = $controller('HeaderCtrl', {AuthenticationService: AuthenticationService});

        expect(ctrl.search).to.exist;
        expect(angular.isFunction(ctrl.search)).to.be.ok;

        expect(ctrl.searchValue).to.defined;
    });

    it('should attach logout function', function () {
        ctrl = $controller('HeaderCtrl', {AuthenticationService: AuthenticationService});

        expect(ctrl.logout).to.exist;
        expect(angular.isFunction(ctrl.logout)).to.be.ok;
    });

    it('should call AuthenticationService::logout on logout', function () {
        ctrl = $controller('HeaderCtrl', {AuthenticationService: AuthenticationService});

        ctrl.logout();

        expect(AuthenticationService.logout).called;
    });

    it('should go to home.search state on search with search value', function () {
        ctrl = $controller('HeaderCtrl', {AuthenticationService: AuthenticationService, $state: $state});

        var val = 'value';
        ctrl.searchValue = val;
        ctrl.search();

        expect($state.go).calledWith('home.search', {q: val});
    });
});