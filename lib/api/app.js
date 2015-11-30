/**
 * Created by voislav.mishevski on 11/25/2015.
 */

var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var favicon = require('serve-favicon');
//var logger = require('morgan');
var debug = require('debug')('app');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');

var app = require('lib/httpServer/index').app;


app.use(favicon(__dirname + '/../public/favicon.ico'));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(expressValidator());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(__dirname + '/../public/'));

require('../models');
require('./routes/authorization-router.js')(app);
require('./routes/chat-router')(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

app.use(function (err, req, res, next) {
    if(err instanceof mongoose.Error.ValidationError){
        res.status(400).send(err);
    }else{
        next(err);
    }
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.send({
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.send('error', {
        message: err.message,
        error: {}
    });
});


module.exports = exports = app;