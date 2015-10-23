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

ctrl.usernameUnique = function (req, res, next) {
    //debug(req.body);

    if(!req.query.username || req.query.username.length === 0){
        res.status(400);
        res.end('username is required field');
        return;
    }

    var User = mongoose.model('User');
    User.findOne({email: req.query.username}, function (err, user) {
        if(err){
            next(err);
        }

        if(!!user){
            res.status(200).send({unique: false});
        }else{
            res.status(200).send({unique: true});
        }
        res.end();
    });
};

module.exports = ctrl;
