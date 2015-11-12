var debug = require('debug')('app:socket');

module.exports = function (io) {
    io.on('connection', function (socket) {
        debug('user connected');
    });

    io.on('disconnect', function (socket) {
        debug('user disconnected');
    });
};