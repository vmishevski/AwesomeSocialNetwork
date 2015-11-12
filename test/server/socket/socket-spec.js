/**
 * Created by voislav.mishevski on 11/12/2015.
 */
var io = require('socket.io-client'),
    config = require('config');

describe('socket', function () {
    xit('should connect to socket server', function (done) {
        var socket = io('http://localhost:' + config.socketPort);

        socket.on('connect', function () {
            done();
        });
    });
});