/**
 * Created by voislav.mishevski on 11/13/2015.
 */
'use strict';

var mongoose = require('mongoose'),
    chat = require('../../../server/socket/chat'),
    ChatRoom = mongoose.model('ChatRoom'),
    sinon = require('sinon'),
    expect = require('chai').expect,
    config = require('config'),
    User = mongoose.model('User'),
    jwt = require('jwt-simple'),
    io = require('../../../server/socket/worker').io,
    ioClient = require('socket.io-client'),
    chatEvents = require('../../../server/socket/chatEvents');

describe('chat', function () {
    var sandbox;
    io.attach(12000);
    beforeEach(function () {
        sandbox = sinon.sandbox.create();

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
            expect(ChatRoom.prototype.save).calledOn(sinon.match.instanceOf(ChatRoom)
                .and(sinon.match(function (val) {
                    return val.participants.length == 2;
                })));
            done();
        });
    });

    it('postMessage: should push the message in messages of the room specified by id', function (done) {
        var room = new ChatRoom({});
        sandbox.spy(room.messages, 'push');
        var user = new User({fullName: 'voislav'});
        ChatRoom.findOne.callsArgWith(1, undefined, room);
        var message = 'my test message';

        chat.postMessage(user, room.id, message, function (err) {
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

        io.on('authenticated', function (socket) {
            expect(socket.decoded_token.id).to.equal(user.id);
        });

        var socket = ioClient('http://localhost:12000/', {forceNew: true});

        socket.on('connect', function () {
            var token = jwt.encode(user, config.tokenSecret);
            socket.on('authenticated', function () {
                done();
            });
            socket.emit('authenticate', {token: token});
        });
    });

    it('postMessage: after user connects he should receive message on rooms he participates', function () {
        var fromUser = new User({fullName: 'voislav'});
        var toUser = new User({fullName: 'test user'});
        var message = 'some test message';
        var room = new ChatRoom({participants:[{userId: fromUser.id }, {userId: toUser.id}]});
        ChatRoom.findOne.callsArgWith(1, undefined, room);

        var socket = ioClient('http://localhost:12000/', {forceNew: true});

        // login toUser
        socket.emit('authenticate',{token: jwt.encode(toUser, config.tokenSecret)});
        socket.on(chatEvents.newMessage, function (data) {
            expect(data.message.message).to.equal(message);
            expect(data.message.from.userId).to.equal(fromUser.id);
            expect(data.roomId).to.equal(room.id);

            done();
        }).on('authenticated', function () {
            chat.postMessage(fromUser, room.id, message, function (err) {
            });
        });
    });
});
