/**
 * Created by Voislav on 11/15/2015.
 */
'use strict';
var messageController = require('../../../server/controllers/message-controller');
var expect = require('chai').expect;
var sinon = require('sinon');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var ChatRoom = mongoose.model('ChatRoom');
var validator = require('express-validator');
var helpers = require('../helpers');
var chat = require('../../../server/socket/chat');

describe('messageController', function () {
    var base, sandbox;

    beforeEach(function () {
        base = {};
        sandbox = sinon.sandbox.create();
        helpers.setup(base, sandbox);
        validator()(base.req, base.res, base.next);
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('sendMessage', function () {
        it('should validate roomId in body', function () {
            base.req.body.message = 'test message';
            messageController.sendMessage(base.req, base.res, base.next);
            expect(base.res.status).calledWith(400);
        });

        it('should validate message in body', function () {
            base.req.body.roomId = new mongoose.Schema.Types.ObjectId().toString();
            messageController.sendMessage(base.req, base.res, base.next);
            expect(base.res.status).calledWith(400);
        });

        it('should call chat:sendMessage', function () {
            base.req.body.message = 'test message';
            base.req.body.roomId = 'randomroomid';

            sandbox.stub(chat, 'sendMessage');
            chat.sendMessage.callsArgWith(3, undefined, new ChatRoom({}));

            messageController.sendMessage(base.req, base.res, base.next);

            expect(base.res.status).calledWith(200);
        });

    });

    describe('getConversation', function () {
        it('should validate userId from query', function () {
            messageController.getConversation(base.req, base.res, base.next);
            expect(base.res.status).calledWith(400);
        });

        it('should find user by userId from query and call chat:findRoom', function () {
            var toUser = new User({});
            sandbox.stub(User, 'findOne').callsArgWith(1,undefined, toUser);
            var room = new ChatRoom({});
            sandbox.stub(chat, 'findRoom').callsArgWith(2, undefined, room);
            base.req.query = {};
            base.req.query.userId = 'testuserid';
            base.req.user = new User({});

            messageController.getConversation(base.req, base.res, base.next);

            expect(chat.findRoom).calledWith(base.req.user, toUser);
            expect(base.res.status).calledWith(200);
            expect(base.res.send).calledWith(room);
        })
    })
});