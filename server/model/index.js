require('./userModel.js');
var mongoose = require('mongoose'),
    debug = require('debug')('app:db'),
    config = require('config');

console.log(config);

mongoose.connect(config.db, function (err) {
    if(err){
        throw new Error(err);
    }else{
        debug('Connected to mongodb');
    }
});

mongoose.connection.on('error', function () {
    debug('connection error');
});

mongoose.connection.on('connected', function () {
    debug('connected');
});

mongoose.connection.on('disconnected', function () {
    debug('disconnected');
});

mongoose.connection.on('open', function () {
    debug('open');
});

mongoose.connection.on('close', function () {
    debug('close');
});