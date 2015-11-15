/**
 * Created by voislav.mishevski on 11/13/2015.
 */

'use strict';

var mongoose = require('mongoose');
var User = mongoose.model('User');
var chat = require('../socket/chat');
var util = require('util');

var messageController = {};

messageController.openChatWithUser = function(req, res, next){
    req.checkQuery('userId', '"userId" is required field').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send(util.inspect(errors));
    }

    User.findOne({_id: req.query.userId}, function (err, user) {
        if(err)
            return next(err);

        chat.findRoom(req.user, user, function (err, room) {
            if(err)
                return next(err);

            return res.status(200).send(room);
        });
    });
};

messageController.sendMessage = function (req, res, next) {
    req.checkBody('roomId').notEmpty().isAlphanumeric();
    req.checkBody('message').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send(util.inspect(errors));
    }

    req.sanitizeBody('message').toString();

    chat.sendMessage(req.user, req.body.roomId, req.body.message, function (err, room) {
        if(err)
            return next(err);

        return res.status(200).send(room);
    });
};

module.exports = messageController;