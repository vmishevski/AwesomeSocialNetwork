/**
 * Created by Voislav on 10/31/2015.
 */
var ctrl = require('../../../server/controllers/user-controller');
var status = require('../../../server/model/friendshipRequestStatus');
var mongoose = require('mongoose');
var mockgoose = require('mockgoose'),
    sinon = require('sinon'),
    chai = require('chai'),
    expect = chai.expect,
    sinonChai = require('sinon-chai'),
    helpers = require('../helpers');
require('../../../server/model/index');
mockgoose(mongoose);

chai.use(sinonChai);

describe('ctrl:user', function () {
    var sandbox, base, User, err, query, Timeline;

    beforeEach(function () {
        query = 'name to find';
        sandbox = sinon.sandbox.create();
        base = {};
        helpers.setup(base, sandbox);
        User = mongoose.model('User');
        Timeline = mongoose.model('Timeline');
        sandbox.stub(User, 'find');
        sandbox.stub(User, 'findOne');
        sandbox.stub(Timeline, 'findOne');
        err = {};
        base.req.query = { query: query};
        base.req.user = {id: 'logged user id'};
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
        base.req.body.userId = 'some user';
        var timeline = {friendshipRequests: [{
            userId: 'some user'
        }]};
        User.findOne.callsArgWith(1, undefined, {_id: 'some user'});
        Timeline.findOne.callsArgWith(1, undefined, timeline);

        ctrl.addFriend(base.req, base.res, base.next);

        expect(base.res.status).calledWith(400);
    });

    it('addFriend: should push new request to timeline, call save and return status 200', function () {
        base.req.body.userId = 'some user';
        var timeline = {friendshipRequests: []};
        timeline.save = sinon.stub().callsArg(0);
        User.findOne.callsArgWith(1, undefined, {_id: 'some user'});
        Timeline.findOne.callsArgWith(1, undefined, timeline);

        ctrl.addFriend(base.req, base.res, base.next);

        expect(timeline.friendshipRequests).not.empty;
        expect(timeline.friendshipRequests[0].userId).to.equal('some user');
        expect(timeline.save).called;
        expect(base.res.status).calledWith(200);
    });

    it('addFriend: should propagate find user error', function () {
        base.req.body.userId = 'some user';
        User.findOne.callsArgWith(1, err);

        ctrl.addFriend(base.req, base.res, base.next);

        expect(base.next).calledWith(err);
    });

    it('addFriend: should push new request to timeline, call save and return status 200', function () {
        base.req.body.userId = 'some user';
        User.findOne.callsArgWith(1, undefined, {_id: 'some user'});
        Timeline.findOne.callsArgWith(1, err);

        ctrl.addFriend(base.req, base.res, base.next);

        expect(base.next).calledWith(err);
    });

    it('addFriend: should propagate save error', function () {
        base.req.body.userId = 'some user';
        var timeline = {friendshipRequests: []};
        timeline.save = sinon.stub().callsArgWith(0, err);
        User.findOne.callsArgWith(1, undefined, {_id: 'some user'});
        Timeline.findOne.callsArgWith(1, undefined, timeline);

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
        base.req.body.userId = 'someid';
        base.req.body.answer = 'true';
        var toAdd = {_id: 'someid'};

        User.findOne.callsArgWith(1, undefined, toAdd);
        Timeline.findOne.callsArgWith(1);
        ctrl.respondToFriendRequest(base.req, base.res, base.next);

        expect(base.res.status).calledWith(404);
    });

    it('respondToFriendRequest: should set accepted on request when answer is true', function () {
        base.req.body.userId = 'someid';
        base.req.body.answer = 'true';
        var toAdd = {_id: 'someid'};
        var request = {userId:'someid', status: 1};
        var timeline = {save:sandbox.stub().callsArg(0), friends:[], friendshipRequests:[request]};

        User.findOne.callsArgWith(1, undefined, toAdd);
        Timeline.findOne.callsArgWith(1, undefined, timeline);
        ctrl.respondToFriendRequest(base.req, base.res, base.next);

        expect(base.res.status).calledWith(200);
        expect(request.status).to.equal(status.accepted);
    });

    it('respondToFriendRequest: should add user to friends list when accepting request', function () {
        base.req.body.userId = 'someid';
        base.req.body.answer = 'true';
        var toAdd = {_id: 'someid'};
        var request = {userId:'someid', status: 1};
        var timeline = {save:sandbox.stub().callsArg(0), friends:[], friendshipRequests:[request]};

        User.findOne.callsArgWith(1, undefined, toAdd);
        Timeline.findOne.callsArgWith(1, undefined, timeline);
        ctrl.respondToFriendRequest(base.req, base.res, base.next);

        expect(base.res.status).calledWith(200);
        expect(timeline.friends).to.include({userId:toAdd._id});
    });

    it('respondToFriendRequest: should set rejected on request when answer is false', function () {
        base.req.body.userId = 'someid';
        base.req.body.answer = 'false';
        var toAdd = {_id: 'someid'};
        var request = {userId:'someid', status: 1};
        var timeline = {save:sandbox.stub().callsArg(0), friends:[], friendshipRequests:[request]};

        User.findOne.callsArgWith(1, undefined, toAdd);
        Timeline.findOne.callsArgWith(1, undefined, timeline);
        ctrl.respondToFriendRequest(base.req, base.res, base.next);

        expect(base.res.status).calledWith(200);
        expect(request.status).to.equal(status.rejected);
    });
});