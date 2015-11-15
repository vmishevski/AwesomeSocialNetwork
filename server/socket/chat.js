/**
 * Created by voislav.mishevski on 11/13/2015.
 */
'use strict';

var mongoose = require('mongoose'),
    ChatRoom = mongoose.model('ChatRoom'),
    User = mongoose.
    _ = require('underscore'),
    io = require('./worker').io,
    jwtSocketIo = require('socketio-jwt'),
    debug = require('debug')('app:chat'),
    chatEvents = require('./chatEvents'),
    config = require('config');

var createParticipant = function (user) {
    var obj = user.toObject();
    obj.userId = obj._id;
    return obj;
};

var chat = {};
var users = {};

chat.findRoom = function (currentUser, user, callback) {
    ChatRoom.findOne({
        $and: [
            {'participants.userId': {$eq: user.id}},
            {'participants.userId': {$eq: currentUser.id}},
            {'participants': {$size: 2}}
        ]
    }, function (err, room) {
        if (err)
            return callback(err);

        if (room)
            return callback(null, room);

        var newRoom = new ChatRoom({
            participants: [createParticipant(user), createParticipant(currentUser)],
            creator: createParticipant(user)
        });

        newRoom.save(function (err) {
            if (err)
                return callback(err);

            return callback(null, newRoom);
        });
    });
};

chat.sendMessage = function (user, roomId, message, callback) {
    ChatRoom.findOne({_id: roomId}, function (err, chatRoom) {
        if(err)
            return callback(err);

        if(!chatRoom){
            return callback(new Error('room not found'));
        }

        var messageModel = {
            from: createParticipant(user),
            message: message
        };

        chatRoom.messages.push(messageModel);

        for(var i=0; i< chatRoom.participants.length; i++){
            var participant =chatRoom.participants[i];
            if(!!users[participant.userId]){
                var socket = users[participant.userId];
                socket.emit(chatEvents.newMessage, {
                    roomId: roomId,
                    message: message
                });
            }
        }

        chatRoom.save(function (err) {
            if (err)
                return callback(err);

            return callback(null, chatRoom);
        });
    });
};

chat.createRoom = function (users, callback) {
    if (!Array.isArray(users)) {
        return callback(new Error('users mush be an array'));
    }

    var room = new ChatRoom({});
    for (var i = 0; i < users.length; i++) {
        room.participants.push(createParticipant(users[i]));
    }

    room.save(function (err) {
        return callback(err);
    });
};

chat.addUserToRoom = function (roomId, user, callback) {
    ChatRoom.findOne({_id: roomId}, function (err, room) {
        if(err)
            return callback(err);

        if(!room)
            return callback(new Error('room with id=' + roomId + ' not found'));

        var added = _.find(room.participants, function (item) {
            return item.userId == user.id;
        });

        if(!added){
            room.participants.push(createParticipant(user));
            room.save(function (err) {
                return callback(err, room);
            });
        }

        return callback(undefined, room);
    })
};

io.on('connection', jwtSocketIo.authorize({
    secret: config.tokenSecret,
    timeout: 15000
})).on('authenticated', function (socket) {
    debug('user connected and authenticated', socket.decoded_token);
    users[socket.decoded_token.id] = socket;
}).on('disconnect', function (socket) {
    delete user[socket.decoded_token.id];
});

module.exports = chat;