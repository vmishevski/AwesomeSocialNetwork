/**
 * Created by Voislav on 10/31/2015.
 */
'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Timeline = mongoose.model('Timeline'),
    friendRequestStatus = require('../model/friendshipRequestStatus'),
    _ = require('underscore');

var ctrl = {};

ctrl.search = function (req, res, next) {
    if (!req.query.query) {
        return res.status(400).send('must provide something to query');
    }
    User.find({fullName: {'$regex': req.query.query, $options: 'i'}}, function (err, users) {
        if (err) {
            return next(err);
        }

        res.status(200).send(users);
    });
};

ctrl.addFriend = function (req, res, next) {
    if (!req.body.userId) {
        return res.status(400).send('Missing userId filed');
    }

    User.findOne({_id: req.body.userId}, function (err, toAddFriend) {
        if (err)
            return next(err);

        if (!toAddFriend)
            return res.status(404).send('User with id "' + req.body.userId + '" not found');

        Timeline.findOne({userId: req.user.id}, function (err, timeline) {
            if (err) {
                return next(err);
            }

            if (!timeline) {
                timeline = new Timeline({userId: req.user.id, friendshipRequests: []});
            }

            timeline.friendshipRequests = timeline.friendshipRequests || [];
            var alreadyExists = _.find(timeline.friendshipRequests, function (request) {
                return request.userId === toAddFriend._id;
            });

            if(!!alreadyExists){
                return res.status(400).send('Already has friend request with status: ' + alreadyExists.status);
            }

            timeline.friendshipRequests.push({
                userId: toAddFriend._id
            });

            timeline.save(function (err) {
                if(err)
                    return next(err);

                res.status(200).send('Success');
            });
        });
    });
};

module.exports = ctrl;