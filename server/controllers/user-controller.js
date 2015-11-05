/**
 * Created by Voislav on 10/31/2015.
 */
'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    friendRequestStatus = require('../model/friendshipRequestStatus'),
    _ = require('underscore'),
    validator = require('validator');

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

        var me = req.user;

        var alreadyExists = _.find(me.friendshipRequests, function (request) {
            return request.userId.equals(toAddFriend.id);
        });

        if(!!alreadyExists){
            return res.status(400).send('Already has friend request with status: ' + alreadyExists.status);
        }

        me.friendshipRequests.push({
            userId: toAddFriend.id
        });

        me.save(function (err) {
            if(err)
                return next(err);

            res.status(200).send('Success');
        });
    });
};

ctrl.respondToFriendRequest = function (req, res, next) {
    if(!req.body.userId){
        return res.status(400).send('Missing userId field')
    }

    if(!validator.isBoolean(req.body.answer)){
        return res.status(400).send('Missing answer field');
    }

    req.body.answer = validator.toBoolean(req.body.answer);

    User.findOne({_id: req.body.userId}, function (err, toAccept) {
        if(err)
            return next(err);

        if(!toAccept)
            return res.status(404).send('User with id=' + req.body.userId + ' not found');

        var me = req.user;

        if(err)
            return next(err);

        var friendRequest;

        for(var i =0; i< me.friendshipRequests.length; i++){
            if(me.friendshipRequests[i].userId.equals(toAccept.id)){
                friendRequest = me.friendshipRequests[i];
                break;
            }
        }

        if(!friendRequest){
            return res.status(404).send('No pending requests found');
        }

        if(friendRequest.status === friendRequestStatus.pending){
            if(req.body.answer){
                friendRequest.status = friendRequestStatus.accepted
                me.friends.push({userId: toAccept.id});
            }else {
                friendRequest.status = friendRequestStatus.rejected;
            }
        }

        me.save(function (err) {
            if(err)
                return next(err);

            return res.status(200).send('Success');
        });
    })
};

ctrl.myTimeline = function (req, res, next) {
    Timeline.findOne({userId: req.user.id}, function (err, timeline) {
        if(err)
            return next(err);

        if(!timeline)
        {
            timeline = new Timeline({userId: req.user.id});
        }

        timeline.pendingFriendshipRequests = [];
        timeline.pendingFriendshipRequests = _.find(timeline.friendshipRequests, function (item) {
            return item.status == friendRequestStatus.pending;
        });

        return res.status(200).send(timeline);
    });
};

module.exports = ctrl;