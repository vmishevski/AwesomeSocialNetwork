/**
 * Created by voislav.mishevski on 11/12/2015.
 */
var io = require('socket.io-client'),
    config = require('config');

describe.only('socket', function () {
    it('should connect to socket server', function (done) {
        var socket = io('http://localhost:' + config.socketPort);

        socket.on('connect', function () {
            done();
        });
    });
});