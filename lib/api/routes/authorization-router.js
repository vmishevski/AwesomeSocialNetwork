var router = require('express').Router();
var passport = require('passport');
var JwtStrategy = require('passport-jwt').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var jwt = require('jwt-simple');
var debug = require('debug')('app:authorization');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var authorizationCtrl = require('../controllers/authorization-controller');
var userCtrl = require('../controllers/user-controller');
var config = require('config');

module.exports = function (app) {
    app.use(passport.initialize());

    passport.use(new JwtStrategy({ secretOrKey: config.tokenSecret }, function (payload, done) {
        User.findOne({_id: payload.id}, function (err, user) {
            if(err){
                return done(err);
            }

            if(!user){
                return done(null, false);
            }
            return done(null, user);
        });
    }));
    
    passport.use(new LocalStrategy({ usernameField: 'email'}, function (username, password, done) {
        User.findOne({ email: username }, function (err, user) {
            if (err) {
                return done(err);
            }
            
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

    router.get('/usernameUnique', passport.authenticate('jwt', {session: false}), authorizationCtrl.usernameUnique);

    router.post('/changePassword', passport.authenticate('jwt', {session: false}), authorizationCtrl.changePassword);

    router.post('/saveProfile', passport.authenticate('jwt', {session: false}), authorizationCtrl.saveProfile);

    router.get('/search', passport.authenticate('jwt', {session:false}), userCtrl.search);

    router.post('/addFriend', passport.authenticate('jwt', {session: false}), userCtrl.addFriend);

    router.post('/respondToFriendRequest', passport.authenticate('jwt', {session:false}), userCtrl.respondToFriendRequest);

    router.get('/profile', passport.authenticate('jwt', {session:false}), userCtrl.profile);

    app.use('/api/user', router);
};