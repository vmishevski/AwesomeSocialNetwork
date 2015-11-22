/**
 * Created by Voislav on 10/31/2015.
 */
'use strict';

process.env.NODE_ENV = 'test';
var mockgoose = require('mockgoose');
var mongoose = require('mongoose');
mockgoose(mongoose);
var ObjectId = mongoose.Schema.Types.ObjectId;
var sinonChai = require('sinon-chai');
var chai = require('chai');
chai.use(sinonChai);

var app = require('../../app');
var request = require('supertest')(app);
var User = mongoose.model('User');
var authHeader = 'Authorization';
var q = require('q');
var config = require('config');
var jwt = require('jwt-simple');
var _ = require('underscore');

global.expect = chai.expect;

var setupResAndRequest = function (base, sandbox) {
    base.req = { body: {}};
    base.res = {
        send: sandbox.stub(),
        status: sandbox.stub(),
        end: sandbox.stub()
    };
    base.res.status.returns(base.res);
    base.next = sandbox.stub();
};

exports.setup = setupResAndRequest;

var getToken = function (user) {
    return jwt.encode(user, config.tokenSecret);
};

var getAuthToken = function (user) {
    return 'JWT ' + getToken(user);
};

exports.getToken = getToken;
exports.getAuthToken = getAuthToken;

request.postAuthenticated = function (url, user) {
    return request.post(url)
        .set(authHeader, getAuthToken(user));
};

request.getAuthenticated = function (url, user) {
    return request.get(url)
        .set(authHeader, getAuthToken(user));
};

exports.request = request;


var getTestUser = function (email, fullName) {
    var p = q.defer();
    var user = new User({email: email || Math.random() + 'test@yopmail.com', fullName: fullName || 'test user', password: '000000'});
    user.save(function (err) {
        if(err)
            p.reject(err);
        p.resolve(user);
    });
    return p.promise;
};

exports.getTestUser = getTestUser;

function UserBuilder(user) {
    if(!!user){
        _.extend(this, user);
    }
    this.friends = [];
    this.friendshipRequests = [];
    this.password = this.password || Math.random().toString();
    return this;
}
UserBuilder.prototype.withEmail = function (email) {
    this.email = email;
    return this;
};
UserBuilder.prototype.withFullName = function (fullName) {
    this.fullName = fullName;
    return this;
};
UserBuilder.prototype.withPassword = function (password) {
    this.password = password;
    return this;
};
UserBuilder.prototype.withRandomProperties = function () {
    return this.withEmail((new ObjectId()) + '@test.com').withPassword((new ObjectId()).toString()).withFullName((new ObjectId()).toString());
};
UserBuilder.prototype.withFriendRequest = function (request) {
    this.friendshipRequests.push(request);
    return this;
};
UserBuilder.prototype.withFriend = function (user) {
    this.friends.push({friend: user.id});
    return this;
};
function FriendRequestBuilder(user) {
    this.userId = !!user && user.id ? user.id : undefined;
    this.fullName = !!user && user.fullName ? user.fullName : undefined;
    this.status = undefined;
    return this;
}
FriendRequestBuilder.prototype.withStatus = function (status) {
    this.status = status;
    return this;
};

UserBuilder.prototype.save = function () {
    var p = q.defer();
    var user = new User(this);
    user.save(function (err) {
        if(err)
            p.reject(err);
        p.resolve(user);
    });
    return p.promise;
};

exports.UserBuilder = UserBuilder;
exports.FriendRequestBuilder = FriendRequestBuilder;