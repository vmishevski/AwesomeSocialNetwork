/**
 * Created by voislav.mishevski on 10/30/2015.
 */
describe('Route tests', function () {
    var $rootScope,
        $sessionStorage,
        authService,
        $state;

    beforeEach(module('awesomeSocialNetworkApp', 'templates'));

    beforeEach(module(function($provide){
        authService = {
            isAuthenticated: sinon.stub(),
            autoLogin: sinon.stub(),
            authenticate: sinon.stub()
        };

        $provide.value('AuthenticationService', authService);
    }));

    beforeEach(inject(function (_$rootScope_, _$sessionStorage_, _$state_) {
        $rootScope = _$rootScope_;
        $sessionStorage = _$sessionStorage_;
        $state = _$state_;
    }));

    //it('should check if user authorized on state change', function () {
    //
    //});
});