/**
 * Created by voislav.mishevski on 11/19/2015.
 */
'use strict';

describe.only('chat-service', function () {
    beforeEach(angular.mock.module('awesomeSocialNetworkApp', 'templates'));

    var service, sandbox, client, $rootScope;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        client = {
            on: sandbox.stub(),
            emit: sandbox.stub()
        };
        window.io =sandbox.stub().returns(client);
        inject(function (_$rootScope_) {
            $rootScope = _$rootScope_;
        });
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should create socket client on provided socket url', function () {
        inject(function (socketService, socketServerUrl) {
            expect(io).calledWith(socketServerUrl);
        });
    });

    it('should wait for newMessage event', function () {
        inject(function (socketService) {
            expect(client.on).calledWith('new-message');
        });
    });

    it('should call authenticate with token after connected', function () {
        client.on.withArgs('connect').callsArg(1);
        $rootScope.token = 'token';
        inject(function (socketService) {
            expect(client.emit).calledWith('authenticate', {token: $rootScope.token});
        });
    });

    it('on: should call $apply after the callback', function () {
        inject(function (socketService) {
            client.on.callsArgWith(1);
            var e = 'event';
            var c = sandbox.spy();
            sandbox.spy($rootScope, '$apply');
            socketService.on(e, c);
            expect(client.on).calledWith(e);
            expect($rootScope.$apply).called;
            expect(c).called;
            expect(c).calledBefore($rootScope.$apply);
        });
    });

    it('emit: should call socket:emit', function () {
        inject(function (socketService) {
            var e = 'event';
            var d = {d:'test'};
            socketService.emit(e,d);
            expect(client.emit).calledWith(e, d);
        });
    });
});