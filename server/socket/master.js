/**
 * Created by voislav.mishevski on 11/13/2015.
 */

var debug = require('debug')('app:socket-index'),
    config = require('config'),
    cluster = require('cluster'),
    express = require('express'),
    net = require('net'),
    num_processes = require('os').cpus().length;

var Master = function (workers) {
    if(cluster.isMaster){
        debug('starting socket server on port', config.socketPort);
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
        net.createServer({ pauseOnConnect: true }, function(connection) {
            // We received a connection and need to pass it to the appropriate
            // worker. Get the worker for this connection's source IP and pass
            // it the connection.
            debug('connection received');
            var workerIndex = hash(connection.remoteAddress, num_processes);
            debug('hashed ', connection.remoteAddress, 'to worker index', workerIndex)

            var worker = workers[workerIndex % workers.length];
            worker.send('sticky-session:connection', connection);
        }).listen(config.socketPort);
    }
};

module.exports = Master;