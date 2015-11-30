/**
 * Created by voislav.mishevski on 11/30/2015.
 */

var express = require('express');
var http = require('http');
var socketIo = require('socket.io');
var app = express();
var server = http.createServer(app);
var io = socketIo(server);

module.exports.app = app;
module.exports.server = server;
module.exports.io = io;