var router = require('express').Router();
var passport = require('passport');
var JwtStrategy = require('passport-jwt').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var jwt = require('jwt-simple');
var debug = require('debug')('app:authorization');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var authorizationCtrl = require('../controllers/authorization-controller');

module.exports = function (app) {
    app.use(passport.initialize());

    passport.use(new JwtStrategy({ secretOrKey: 'secret-key' }, function (payload, done) {
        done(null, payload);
    }));
    
    passport.use(new LocalStrategy({ usernameField: 'email'}, function (username, password, done) {
        User.findOne({ email: username }, function (err, user) {
            if (err)
                return done(err);
            
            if (!user) {
                return done(null, false);
            }
            
            var passwordMatch = user.passwordMatch(password);
            
            if (!passwordMatch) {
                return done(null, false);
            }

            return done(null, user);
        });
    }));
    
    router.get('/me', passport.authenticate('jwt', { session: false }), authorizationCtrl.me);
    
    router.post('/login', passport.authenticate('local', { session: false }), authorizationCtrl.login);
    
    router.post('/register', authorizationCtrl.register);

    app.use('/api/user', router);
};