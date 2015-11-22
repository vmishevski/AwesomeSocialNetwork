/**
 * Created by voislav.mishevski on 11/13/2015.
 */
'use strict';

var helper = require('../helpers');
var mongoose = require('mongoose');
var chat = require('../../../server/socket/chat');
var ChatRoom = mongoose.model('ChatRoom');
var sinon = require('sinon');
var expect = require('chai').expect;
var User = mongoose.model('User');
var io = require('../../../server/socket/worker').io;
var ioClient = require('socket.io-client');
var chatEvents = require('../../../server/socket/chatEvents');

describe('chat', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        io.close();
        io.attach(12000);

        sandbox.spy(io, 'emit');
        sandbox.spy(ChatRoom.prototype, 'save');
        sandbox.stub(ChatRoom, 'findOne');
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('findRoom: when current user opens chat with another user, should create the room if it doesn\'t exist', function (done) {

        var user1 = new User({fullName: 'voislav'});
        var user2 = new User({fullName: 'ivica'});
        ChatRoom.findOne.callsArg(1);
        chat.findRoom(user1, user2, function (err, room) {
            expect(err).not.defined;
            expect(room).defined;
            expect(ChatRoom.prototype.save).called;
            // should create new instance of ChatRoom add the two users as participants
            expect(ChatRoom.prototype.save).calledOn(sinon.match.instanceOf(ChatRoom));
            expect(ChatRoom.prototype.save).calledOn(room);
            expect(room.participants).exist;
            expect(room.participants.length).to.equal(2);
            done();
        });
    });

    it('sendMessage: should push the message in messages of the room specified by id', function (done) {
        var room = new ChatRoom({});
        sandbox.spy(room.messages, 'push');
        var user = new User({fullName: 'voislav'});
        ChatRoom.findOne.callsArgWith(1, undefined, room);
        var message = 'my test message';

        chat.sendMessage(user, room.id, message, function (err) {
            expect(err).not.defined;
            expect(room.messages.push).calledWith(sinon.match({
                from: sinon.match({userId: user._id, fullName: user.fullName}),
                message: message
            }));

            done();
        });
    });

    it('socket-connect: send auth token on connect', function (done) {
        var user = new User({fullName: 'voislav'});

        var socket = ioClient('http://localhost:12000/', {forceNew: true});

        socket.on('connect', function () {
            var token = helper.getToken(user);
            socket.on('authenticated', function () {
                done();
            });
            socket.emit('authenticate', {token: token});
        });
    });

    it('sendMessage: after user connects he should receive message on rooms he participates', function (done) {
        var fromUser = new User({fullName: 'voislav'});
        var toUser = new User({fullName: 'test user'});
        var message = 'some test message';
        var room = new ChatRoom({participants:[{userId: fromUser.id }, {userId: toUser.id}]});
        ChatRoom.findOne.callsArgWith(1, undefined, room);

        var socket = ioClient('http://localhost:12000/', {forceNew: true});

        // login toUser
        socket.emit('authenticate',{token: helper.getToken(toUser)});
        socket.on(chatEvents.newMessage, function (data) {
            expect(data.message.message).to.equal(message);
            expect(data.message.from.userId).to.equal(fromUser.id);
            expect(data.roomId).to.equal(room.id);

            done();
        }).on('authenticated', function () {
            chat.sendMessage(fromUser, room.id, message, function (err) {
            });
        });
    });
});
