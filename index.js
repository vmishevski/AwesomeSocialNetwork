require('app-module-path').addPath(__dirname);

var debug = require('debug')('app:www');
var control = require('strong-cluster-control');
var cluster = require('cluster');

if(cluster.isWorker){

    var app = require('./lib/api');
    //app.set('port', process.env.PORT || 3000);

    var server = require('lib/httpServer').server;

    server.listen(0, function() {
        debug('Express server listening on port ' + server.address().port);
    });

    process.on('message', function(message, connection) {
        if (message !== 'sticky-session:connection') {
            return;
        }

        // Emulate a connection event on the server by emitting the
        // event with the connection the master sent us.
        server.emit('connection', connection);

        connection.resume();
    });

} else {

    control.start({
        size: 1
    }, function () {
        debug('cluster started');

        // load balance socket requests
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

        require('net').createServer({ pauseOnConnect: true }, function (connection) {
            debugger;
            var status = control.status();
            console.log(status);

            var workerIndex = hash(connection.remoteAddress, status.workers.length);
            var i = workerIndex % status.workers.length;
            debug('hashed ', connection.remoteAddress, 'to worker index', workerIndex, 'i=',i);

            var worker = cluster.workers[status.workers[i].id];
            worker.send('sticky-session:connection', connection);
        }).listen(process.env.PORT || 3000);
    });
}