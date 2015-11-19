/**
 * Created by Voislav on 10/31/2015.
 */
var ctrl = require('../../../server/controllers/user-controller');
var status = require('../../../server/model/friendshipRequestStatus');
var mongoose = require('mongoose');
var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
var helpers = require('../helpers');
require('../../../server/model/index');

describe('ctrl:user', function () {
    var sandbox, base, User, err, query;

    beforeEach(function () {
        query = 'name to find';
        sandbox = sinon.sandbox.create();
        base = {};
        helpers.setup(base, sandbox);
        User = mongoose.model('User');
        sandbox.stub(User, 'find');
        sandbox.stub(User, 'findOne');
        err = {};
        base.req.query = { query: query};
        base.req.user = {id: 'logged user id', friends: [], friendshipRequests: []};
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('search: should query for users by provided "query" parameter from url', function () {
        var users = [{email: 'test@t.com'}, {email: 'test2@t.com'}];
        User.find.callsArgWith(1, undefined, users);

        ctrl.search(base.req, base.res, base.next);

        expect(User.find).calledWith(sinon.match.defined);
        expect(base.res.status).calledWith(200);
        expect(base.res.send).calledWith(users);
    });

    it('search: should propagate search error', function () {

        User.find.callsArgWith(1, err);

        ctrl.search(base.req, base.res, base.next);

        expect(base.res.send).not.called;
        expect(base.res.status).not.called;
        expect(base.next).calledWith(err);
    });

    it('search: should return status 400 on query param in url not provided', function () {
        base.req.query.query = undefined;

        ctrl.search(base.req, base.res, base.next);

        expect(base.res.status).calledWith(400);
        expect(base.res.status).calledWith(sinon.match.defined);
    });

    it('addFriend: should validate the request', function () {
        base.req.body.userId = undefined;

        ctrl.addFriend(base.req, base.res, base.next);

        expect(base.res.status).calledWith(400);
    });

    it('addFriend: should load provided userId from db and return error if not found', function () {
        base.req.body.userId = 'some user';
        User.findOne.callsArgWith(1, undefined, undefined);

        ctrl.addFriend(base.req, base.res, base.next);

        expect(base.res.status).calledWith(404);
    });

    it('addFriend: should find timeline for logged user and return error if user is already added', function () {
        base.req.body.userId = mongoose.Types.ObjectId();
        base.req.user.friendshipRequests = [{
            userId: base.req.body.userId
        }];
        User.findOne.callsArgWith(1, undefined, {id: base.req.body.userId});

        ctrl.addFriend(base.req, base.res, base.next);

        expect(base.res.status).calledWith(400);
    });

    it('addFriend: should push new request to timeline, call save and return status 200', function () {
        var toAddId = mongoose.Types.ObjectId();
        base.req.body.userId = toAddId;
        base.req.user.save = sandbox.stub().callsArg(0);
        User.findOne.callsArgWith(1, undefined, {id: toAddId});

        ctrl.addFriend(base.req, base.res, base.next);

        expect(base.req.user.friendshipRequests).not.empty;
        expect(base.req.user.friendshipRequests[0].userId).to.equal(toAddId);
        expect(base.req.user.save).called;
        expect(base.res.status).calledWith(200);
    });

    it('addFriend: should propagate find user error', function () {
        var toAddId = mongoose.Types.ObjectId();
        base.req.body.userId = toAddId;
        User.findOne.callsArgWith(1, err);
        base.req.user.save = sandbox.stub().callsArg(0);
        ctrl.addFriend(base.req, base.res, base.next);

        expect(base.next).calledWith(err);
    });

    it('addFriend: should propagate save error', function () {
        var toAddId = mongoose.Types.ObjectId();
        base.req.body.userId = toAddId;
        base.req.user.save = sandbox.stub().callsArgWith(0, err);
        User.findOne.callsArgWith(1, undefined, {id: toAddId});

        ctrl.addFriend(base.req, base.res, base.next);

        expect(base.next).calledWith(err);
    });

    it('respondToFriendRequest: should validate userId', function () {
        ctrl.respondToFriendRequest(base.req, base.res, base.next);

        expect(base.res.status).calledWith(400);
    });

    it('respondToFriendRequest: should validate answer field as boolean', function () {
        base.req.body.answer = 'notboolean';
        ctrl.respondToFriendRequest(base.req, base.res, base.next);

        expect(base.res.status).calledWith(400);
    });

    it('respondToFriendRequest: should respond with 404 when user with given id was not found', function () {
        base.req.body.userId = 'someid';
        base.req.body.answer = 'true';

        User.findOne.callsArgWith(1, undefined, undefined);
        ctrl.respondToFriendRequest(base.req, base.res, base.next);

        expect(base.res.status).calledWith(404);
    });

    it('respondToFriendRequest: should respond with 404 when no pending request for that user was found', function () {
        var requestUserId = mongoose.Types.ObjectId();
        base.req.body.userId = requestUserId;
        base.req.body.answer = 'true';
        var toAdd = {id: requestUserId};

        User.findOne.callsArgWith(1, undefined, toAdd);
        ctrl.respondToFriendRequest(base.req, base.res, base.next);

        expect(base.res.status).calledWith(404);
    });

    it('respondToFriendRequest: should set accepted on request when answer is true', function () {
        var requestUserId = mongoose.Types.ObjectId();
        base.req.body.userId = requestUserId;
        base.req.body.answer = 'true';
        var toAdd = {id: requestUserId};
        var request = {userId: requestUserId, status: 1};
        base.req.user.friendshipRequests = [request];
        base.req.user.save = sandbox.stub().callsArg(0);
        User.findOne.callsArgWith(1, undefined, toAdd);

        ctrl.respondToFriendRequest(base.req, base.res, base.next);

        expect(base.res.status).calledWith(200);
        expect(request.status).to.equal(status.accepted);
    });

    it('respondToFriendRequest: should add user to friends list when accepting request', function () {
        var requestUserId = mongoose.Types.ObjectId();
        base.req.body.userId = requestUserId;
        base.req.body.answer = 'true';
        var toAdd = {id: requestUserId, _id: requestUserId};
        var request = {userId: requestUserId, status: 1};
        base.req.user.friendshipRequests = [request];
        base.req.user.save = sandbox.stub().callsArg(0);
        User.findOne.callsArgWith(1, undefined, toAdd);

        ctrl.respondToFriendRequest(base.req, base.res, base.next);

        expect(base.res.status).calledWith(200);
        expect(base.req.user.friends).to.include({friend: toAdd.id});
    });

    it('respondToFriendRequest: should set rejected on request when answer is false', function () {
        var requestUserId = mongoose.Types.ObjectId();
        base.req.body.userId = requestUserId;
        base.req.body.answer = 'false';
        var toAdd = {id: requestUserId};
        var request = {userId: requestUserId, status: 1};
        base.req.user.friendshipRequests = [request];
        base.req.user.save = sandbox.stub().callsArg(0);
        User.findOne.callsArgWith(1, undefined, toAdd);

        ctrl.respondToFriendRequest(base.req, base.res, base.next);

        expect(base.res.status).calledWith(200);
        expect(request.status).to.equal(status.rejected);
    });

    it('myProfile: should return current logged user', function () {
        var user = {id: mongoose.Types.ObjectId()};
        base.req.user = user;
        ctrl.myProfile(base.req, base.res, base.next);
        expect(base.res.status).calledWith(200);
        expect(base.res.send).calledWith(user);
    });

    it('profile: should validate body for userId', function () {
        ctrl.profile(base.req, base.res, base.next);
        expect(base.res.status).calledWith(400);
        expect(base.res.send).called;
    });

    it('profile: should propagate find user error', function () {
        base.req.query = {userId: mongoose.Types.ObjectId()};
        User.findOne.callsArgWith(1, err);
        ctrl.profile(base.req, base.res, base.next);
        expect(base.next).calledWith(err);
    });

    it('profile: should find user by userId from body and return the user', function () {
        base.req.query = {userId: mongoose.Types.ObjectId()};
        var user = {id: base.req.body.userId};
        User.findOne.callsArgWith(1, undefined, user);

        ctrl.profile(base.req, base.res, base.next);

        expect(base.res.status).calledWith(200);
        expect(User.findOne).called;
        expect(base.res.send).calledWith(user);
    });
});