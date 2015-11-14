/**
 * Created by voislav.mishevski on 11/13/2015.
 */

var mongoose = require('mongoose'),
    chat = require('../../../server/socket/chat'),
    ChatRoom = mongoose.model('ChatRoom'),
    sinon = require('sinon'),
    expect = require('chai').expect,
    User = mongoose.model('User'),
    io = require('../../../server/socket/worker').io;

describe.only('chat', function () {
    var sandbox;
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
        chat.findRoom(user1, user2, function (err, room) {
            expect(err).not.defined;
            expect(room).defined;
            expect(ChatRoom.prototype.save).called;
            expect(ChatRoom.prototype.save).calledOn(sinon.match.instanceOf(ChatRoom)
                .and(sinon.match(function (val) {
                    return val.participants.length == 2;
                })));
            done();
        });
    });

    it('postMessage: should push the message in messages of the room specified by id', function () {
        var room = new ChatRoom({});
        sandbox.spy(room.messages, 'push');
        var user = new User({fullName: 'voislav'});
        ChatRoom.findOne.callsArgWith(1, room);
        var message = 'my test message';

        chat.postMessage(user, room.id, message, function (err) {
            expect(err).not.defined;
            expect(room.messages.push).calledWith(sinon.match({
                from:{userId: user.id, fullName: user.fullName},
                message: message
            }));
        });
    });


});
