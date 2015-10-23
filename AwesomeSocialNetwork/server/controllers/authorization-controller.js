var debug = require('debug')('app:ctrl:auth')
var jwt = require('jwt-simple');
var mongoose = require('mongoose');
var passport = require('passport');
require('../model');

var ctrl = {};

var serializeUser = function (user){
    return jwt.encode(user, 'secret-key');
};

ctrl.login = function (req, res) {
    var token = serializeUser(req.user);
    res.send({ token: token });
};
ctrl.register = function (req, res, next) {
    debug(req.body);
    var User = mongoose.model('User');
    var newUser = new User(req.body);
    newUser.save(function (err) {
        if (err) {
            return next(err);
        }
        debug('user saved');
        
        res.status(200);
        res.end();
    });
};
ctrl.me = function (req, res) {
    res.send(req.user);
};

module.exports = ctrl;
