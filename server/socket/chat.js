/**
 * Created by voislav.mishevski on 11/13/2015.
 */
var mongoose = require('mongoose'),
    ChatRoom = mongoose.model('ChatRoom'),
    io = require('./worker').io;

var createParticipant = function (user) {
    var obj = user.toObject();
    obj.userId = obj._id;
    return obj;
};

var chat = {};

chat.findRoom = function (currentUser, user, callback) {
    ChatRoom.findOne({
        $and: [
            {'participants.userId': {$eq: user.id}},
            {'participants.userId': {$eq: currentUser.id}}
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

chat.postMessage = function (user, roomId, message, callback) {
    ChatRoom.find({_id: roomId}, function (err, chatRoom) {
        chatRoom.messages.push({
            from: createParticipant(user),
            message: message
        });

        io.emit(chatRoom.id, chatRoom.messages[chatRoom.messages.length]);

        chatRoom.save(function (err) {
            if (err)
                return callback(err);

            return callback();
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

module.exports = chat;