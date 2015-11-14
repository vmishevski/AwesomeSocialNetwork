/**
 * Created by voislav.mishevski on 11/13/2015.
 */
var socketIo = require('socket.io'),
    debug = require('debug')('app:socket-index'),
    config = require('config'),
    cluster = require('cluster'),
    express = require('express'),
    net = require('net'),
    ioRedis = require('socket.io-redis');

var io = undefined;

if(!cluster.isMaster){
    debug('socket worker', process.env.NODE_UNIQUE_ID, 'starting');
    var app = express();
    var socketServer = app.listen(0, 'localhost');
    io = socketIo(socketServer);

    io.adapter(ioRedis({ host: config.redisUrl, port: 6379 }));

    // Listen to messages sent from the master. Ignore everything else.
    process.on('message', function(message, connection) {
        if (message !== 'sticky-session:connection') {
            return;
        }

        // Emulate a connection event on the server by emitting the
        // event with the connection the master sent us.
        socketServer.emit('connection', connection);

        connection.resume();
    });
}

exports.io = io;