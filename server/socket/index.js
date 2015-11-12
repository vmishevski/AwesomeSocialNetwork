/**
 * Created by voislav.mishevski on 11/12/2015.
 */

var socketIo = require('socket.io'),
    debug = require('debug')('app:socket-index'),
    config = require('config'),
    cluster = require('cluster'),
    express = require('express'),
    net = require('net'),
    ioRedis = require('socket.io-redis'),
    num_processes = require('os').cpus().length;

if(cluster.isMaster){
    var workers = [];

    for(var i=0; i< num_processes; i++){
        workers[i] = cluster.fork();
    }

    // Helper function for getting a worker index based on IP address.
    // This is a hot path so it should be really fast. The way it works
    // is by converting the IP address to a number by removing the dots,
    // then compressing it to the number of slots we have.
    //
    // Compared against "real" hashing (from the sticky-session code) and
    // "real" IP number conversion, this function is on par in terms of
    // worker index distribution only much faster.
    var worker_index = function(ip, len) {
        var s = '';
        for (var i = 0, _len = ip.length; i < _len; i++) {
            if (ip[i] !== '.') {
                s += ip[i];
            }
        }

        return Number(s) % len;
    };

    var seed = (Math.random() * 0xffffffff) | 0;

    var hash = function (ip) {
        var hash = seed;
        for (var i = 0; i < ip.length; i++) {
            var num = ip[i];

            hash += num;
            hash %= 2147483648;
            hash += (hash << 10);
            hash %= 2147483648;
            hash ^= hash >> 6;
        }

        hash += hash << 3;
        hash %= 2147483648;
        hash ^= hash >> 11;
        hash += hash << 15;
        hash %= 2147483648;

        return hash >>> 0;
    };

    // Create the outside facing server listening on our port.
    var server = net.createServer({ pauseOnConnect: true }, function(connection) {
        // We received a connection and need to pass it to the appropriate
        // worker. Get the worker for this connection's source IP and pass
        // it the connection.
        debug('connection received');
        var workerIndex = hash(connection.remoteAddress, num_processes);
        debug('hashed ', connection.remoteAddress, 'to worker index', workerIndex)

        var worker = workers[workerIndex % workers.length];
        worker.send('sticky-session:connection', connection);
    }).listen(config.socketPort);
}else{
    var app = express();
    var socketServer = app.listen(0, 'localhost');
    var io = socketIo(socketServer);

    io.adapter(ioRedis({ host: config.redisUrl, port: 6379 }))

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

    require('./socket')(io);
}