var debug = require('debug')('app:ctrl:auth')
var jwt = require('jwt-simple');
var mongoose = require('mongoose');
var imageHelper = require('../common/images-helper');
require('../model');
var User = mongoose.model('User');
var q = require('q');

var ctrl = {};

var serializeUser = function (user) {
    return jwt.encode(user, 'secret-key');
};

ctrl.login = function (req, res) {
    var token = serializeUser(req.user);
    res.status(200).send({token: token});
};
ctrl.register = function (req, res, next) {
    debug(req.body);
    var newUser = new User(req.body);
    imageHelper.getGenericImage()
        .then(function (genericImage) {
            newUser.profileImage = genericImage;

            newUser.save(function (err) {
                if (err) {
                    return next(err);
                }
                debug('user saved');

                res.status(200);
                res.end();
            });
        });

};
ctrl.me = function (req, res) {
    res.status(200).send(req.user);
};

ctrl.usernameUnique = function (req, res, next) {
    if (!req.query.username || req.query.username.length === 0) {
        res.status(400);
        res.end('username is required field');
        return;
    }

    User.findOne({email: req.query.username}, function (err, user) {
        if (err) {
            return next(err);
        }

        if (!!user) {
            return res.status(200).send({unique: false});
        } else {
            return res.status(200).send({unique: true});
        }
    });
};

ctrl.changePassword = function (req, res, next) {
    if(!req.body.oldPassword){
        return res.status(400).send({'oldPassword': 'Old password is required field'});
    }

    if(!req.body.password){
        return res.status(400).send({'password': 'Password is required field'});
    }

    if(!req.body.confirmPassword){
        return res.status(400).send({'confirmPassword': 'ConfirmPassword is required field'});
    }

    if(req.body.password !== req.body.confirmPassword){
        return res.status(400).send({'confirmPassword': 'Password do not match'});
    }

    User.findOne({_id: req.user.id}, function (err, user) {
        if (err) {
            return next(err);
        }

        if (!user.passwordMatch(req.body.oldPassword)) {
            //return next(new Error())
            return res.status(400).send({oldPassword: 'Old password incorect'});
        }

        if (req.body.password !== req.body.confirmPassword) {
            return res.status(400).send({confirmPassword: 'Passwords do not match'});
        }

        user.password = req.body.password;
        user.save(function (err) {
            if (err) {
                return next(err);
            }

            return res.status(200).send('');
        });
    });
};

ctrl.saveProfile = function (req, res, next) {
    User.findOne({_id: req.user.id}, function (err, user) {
        if(err){
            return next(err);
        }

        var profile = req.body;
        user.fullName = profile.fullName;
        user.birthDay = new Date(profile.birthDay);
        var setProfileImage = q.defer();

        var setGenericImage = function () {
            imageHelper.getGenericImage()
                .then(function (genericImage) {
                    user.profileImage = genericImage;
                    setProfileImage.resolve();
                });
        };

        var imageHelper = require('../common/images-helper');
        if(!!profile.profileImage && !!profile.profileImage.public_id){
            if(profile.profileImage.public_id === user.profileImage.public_id){
                setProfileImage.resolve();
            }else{
                imageHelper.imageExists(profile.profileImage.public_id)
                    .then(function (exists) {
                        if (exists) {
                            user.profileImage = profile.profileImage;
                            return imageHelper.setImageAsValid(profile.profileImage.public_id);
                        }else{
                            return setGenericImage()
                        }
                    })
                    .then(function () {
                        setProfileImage.resolve();
                    })
            }
        } else {
            setGenericImage();
        }

        setProfileImage.promise.then(function () {
            user.save(function (err) {
                if(err){
                    return next(err);
                }

                return res.status(200).send(user);
            });
        }).done();
    });
};

module.exports = ctrl;
