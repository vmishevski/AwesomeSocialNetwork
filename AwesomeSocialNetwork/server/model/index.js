﻿require('./userModel.js');
var mongoose = require('mongoose'),
    debug = require('debug')('app:db');

mongoose.connect('mongodb://127.0.0.1/AwesomeSocialNetwork', function (err) {
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