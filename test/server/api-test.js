/**
 * Created by voislav.mishevski on 11/21/2015.
 */
var helpers = require('./helpers');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var expect = require('chai').expect;
var sinon = require('sinon');
var q = require('q');
var imageHelper = require('../../lib/api/common/images-helper');
var mockgoose = require('mockgoose');

var request = helpers.request;
var friendshipStatus = require('../../lib/models/friendshipRequestStatus');

describe('api/user', function () {
    var sandbox, genericImageId = 'generic-image-id';

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.stub(imageHelper, 'getGenericImage').returns(q.resolve({public_id: genericImageId}));
        sandbox.stub(imageHelper, 'imageExists').returns(q.resolve(true));
        sandbox.stub(imageHelper, 'setImageAsValid').returns(q.resolve());
        mockgoose.reset();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('/register', function () {
        it('should register user with generic image', function (done) {
            var user = {email: 'test@yopmail.com', fullName: 'test user', password: '000000'};
            return request.post('/api/user/register')
                .send(user)
                .expect(200)
                .end(function (err) {
                    if (err)
                        return done(err);
                    User.findOne({email: user.email, fullName: user.fullName}, function (err, u) {
                        if (err)
                            done(err);

                        expect(u.profileImage).exist;
                        expect(u.profileImage.public_id).to.equal(genericImageId);
                        done();
                    });
                })
        });

        it('should validate user email', function () {
            return request.post('/api/user/register')
                .send({fullName: 'test user', password: '000000'})
                .expect(400);
        });

        it('should validate user fullName', function () {
            return request.post('/api/user/register')
                .send({email: 'test@yopmail.com', password: '000000'})
                .expect(400);
        });

        it('should validate user password', function () {
            return request.post('/api/user/register')
                .send({email: 'test@yopmail.com', fullName: 'test user'})
                .expect(400);
        });
    });

    describe('/login', function () {
        var user;

        beforeEach(function (done) {
            helpers.getTestUser().then(function (u) {
                user = u;
                done();
            });
        });

        it('should login successfully', function () {
            return request.post('/api/user/login')
                .send({email: user.email, password: user.password})
                .expect(200);
        });

        it('should return unauthorized when password does not match', function () {
            return request.post('/api/user/login')
                .send({email: user.email, password: 'not the password you are looking for'})
                .expect(401);
        });

        it('should return unauthorized when username does not exist', function () {
            return request.post('/api/user/login')
                .send({email: 'not the email you are looking for', password: '000000'})
                .expect(401);
        });

        it('should validate missing password', function () {
            return request.post('/api/user/login')
                .send({email: 'not the email you are looking for'})
                .expect(400);
        });

        it('should validate missing username', function () {
            return request.post('/api/user/login')
                .send({password: '000000'})
                .expect(400);
        });
    });

    describe('/me', function () {
        it('should return unauthorized when header not set', function () {
            return request.get('/api/user/me')
                .expect(401);
        });

        it('should return logged user', function () {
            return helpers.getTestUser().then(function (user) {
                return request.getAuthenticated('/api/user/me', user)
                    .expect(200, JSON.stringify(user.toJSON()));
            });
        });

        it('should return unauthorized when user does not exist', function () {
            var user = new User({email: Math.random() + 'test@yopmail.com', fullName: 'test user', password: '000000'});

            return request.getAuthenticated('/api/user/me', user)
                .expect(401);
        });

        it('should return list of all friends', function (done) {
            new helpers.UserBuilder().withRandomProperties().save().then(function (friend) {
                new helpers.UserBuilder().withRandomProperties().withFriend(friend).save().then(function (me) {
                    request.getAuthenticated('/api/user/me', me)
                        .expect(200)
                        .end(function (err, res) {
                            if (err)
                                return done(err);
                            expect(res.body.friends).not.empty;
                            expect(res.body.friends[0].friend.id).to.equal(friend.id);
                            done();
                        });
                });
            });
        });
    });

    describe('/usernameUnique', function () {
        var user;
        beforeEach(function () {
            return helpers.getTestUser().then(function (u) {
                user = u;
            })
        });

        it('should return true when username is unique', function () {
            return request.getAuthenticated('/api/user/usernameUnique?username=nonExistingUsername', user)
                .expect(200, {unique: true});
        });

        it('should check that user is authorized', function () {
            return request.get('/api/user/usernameUnique?username=nonExistingUsername')
                .expect(401);
        });

        it('should return false when username exists', function () {
            return request.getAuthenticated('/api/user/usernameUnique?username=' + user.email, user)
                .expect(200, {unique: false});
        });

        it('should validate username in query', function () {
            return request.getAuthenticated('/api/user/usernameUnique', user)
                .expect(400);
        });
    });

    describe('/changePassword', function () {
        var user;

        beforeEach(function () {
            return helpers.getTestUser().then(function (u) {
                user = u;
            })
        });

        it('should change the password and return 200', function (done) {
            return request.postAuthenticated('/api/user/changePassword', user)
                .send({
                    oldPassword: user.password,
                    password: '111111',
                    confirmPassword: '111111'
                })
                .expect(200)
                .end(function (err, res) {
                    if (err)
                        return done(err);
                    User.findOne({_id: user._id}, function (err, u) {
                        expect(u.hashed_password !== user.hashed_password);
                        expect(u.hashed_password).exist;
                        done(err);
                    });
                })
        });

        it('should check user is logged in', function () {
            return request.post('/api/user/changePassword')
                .send({
                    oldPassword: user.password,
                    password: '111111',
                    confirmPassword: '111111'
                })
                .expect(401);
        });

        it('should validate oldPassword required', function (done) {
            return request.postAuthenticated('/api/user/changePassword', user)
                .send({
                    password: '111111',
                    confirmPassword: '111111'
                })
                .expect(400)
                .end(function (err, res) {
                    if (err)
                        return done(err);
                    expect(res.body).to.have.property('oldPassword');
                    done(err);
                });
        });

        it('should validate oldPassword matches logged user password', function (done) {
            return request.postAuthenticated('/api/user/changePassword', user)
                .send({
                    oldPassword: 'bad password',
                    password: '111111',
                    confirmPassword: '111111'
                })
                .expect(400)
                .end(function (err, res) {
                    if (err)
                        return done(err);
                    expect(res.body).to.have.property('oldPassword');
                    done(err);
                });
        });

        it('should validate password required', function (done) {
            request.postAuthenticated('/api/user/changePassword', user)
                .send({
                    oldPassword: user.password,
                    confirmPassword: '111111'
                })
                .expect(400)
                .end(function (err, res) {
                    if (err)
                        return done(err);
                    expect(res.body).to.have.property('password');
                    done(err);
                });
        });

        it('should validate confirmPassword required', function (done) {
            request.postAuthenticated('/api/user/changePassword', user)
                .send({
                    oldPassword: user.password,
                    password: '111111'
                })
                .expect(400)
                .end(function (err, res) {
                    if (err)
                        return done(err);
                    expect(res.body).to.have.property('confirmPassword');
                    done(err);
                });
        });

        it('should validate password match confirmPassword', function (done) {
            request.postAuthenticated('/api/user/changePassword', user)
                .send({
                    oldPassword: user.password,
                    confirmPassword: '111111',
                    password: 'bad confirm'
                })
                .expect(400)
                .end(function (err, res) {
                    if (err)
                        return done(err);
                    expect(res.body).to.have.property('confirmPassword');
                    done(err);
                });
        });
    });

    describe('/saveProfile', function () {
        var user;

        beforeEach(function (done) {
            helpers.getTestUser()
                .then(function (u) {
                    user = u;
                    done();
                });
        });

        it('should save user profile with generic image and return 200', function (done) {
            var toUpdate = {fullName: 'newname', birthDay: new Date().toISOString()};
            request.postAuthenticated('/api/user/saveProfile', user)
                .send(toUpdate)
                .expect(200)
                .end(function (err, res) {
                    if (err)
                        return done(err);

                    User.findOne({_id: user._id}, function (err, u) {
                        expect(u.fullName).to.eql(toUpdate.fullName);
                        expect(u.birthDay).to.eql(new Date(toUpdate.birthDay));
                        expect(u.profileImage).exist;
                        expect(u.profileImage.public_id).to.eql(genericImageId);
                        done();
                    });
                });
        });

        it('should validate fullName required', function (done) {
            var toUpdate = {birthDay: new Date().toISOString()};
            request.postAuthenticated('/api/user/saveProfile', user)
                .send(toUpdate)
                .expect(400)
                .end(function (err, res) {
                    expect(res.body).to.have.property('fullName');
                    done(err);
                });
        });

        it('should set generic image when provided image does not exist', function (done) {
            var toUpdate = {
                fullName: 'newname',
                birthDay: new Date().toISOString(),
                profileImage: {public_id: 'nonExisting'}
            };
            imageHelper.imageExists.returns(q.resolve(false));
            request.postAuthenticated('/api/user/saveProfile', user)
                .send(toUpdate)
                .expect(200)
                .end(function (err) {
                    if (err)
                        return done(err);

                    User.findOne({_id: user._id}, function (err, u) {
                        expect(u.profileImage).exist;
                        expect(u.profileImage.public_id).to.eql(genericImageId);
                        done();
                    });
                });
        });

        it('should set provided image when image exist', function (done) {
            var toUpdate = {
                fullName: 'newname',
                birthDay: new Date().toISOString(),
                profileImage: {public_id: 'existing image id'}
            };
            request.postAuthenticated('/api/user/saveProfile', user)
                .send(toUpdate)
                .expect(200)
                .end(function (err) {
                    if (err)
                        return done(err);

                    User.findOne({_id: user._id}, function (err, u) {
                        expect(u.profileImage).exist;
                        expect(u.profileImage.public_id).to.eql(toUpdate.profileImage.public_id);
                        done();
                    });
                });
        });
    });

    describe('/search', function () {
        it('should return users which emails contain query', function (done) {
            q.all([helpers.getTestUser('tofind1@test.com', 'tofind1'), helpers.getTestUser('tofind2@test.com', 'tofind2'), new helpers.UserBuilder().withRandomProperties().save()])
                .spread(function (user1, user2, me) {
                    request.getAuthenticated('/api/user/search?query=tofind', me)
                        .expect(200)
                        .end(function (err, res) {
                            expect(res.body instanceof Array).to.be.true;
                            expect(res.body.length).to.equal(2);
                            expect(user1._id.equals(res.body[0].id) || user2._id.equals(res.body[0].id)).to.be.true;
                            expect(user1._id.equals(res.body[1].id) || user2._id.equals(res.body[1].id)).to.be.true;
                            done(err);
                        })
                });
        });

        it('should not return users which dont contain query', function (done) {
            q.all([helpers.getTestUser('tofind1@test.com', 'tofind1'), helpers.getTestUser('notwhatyoulookingfor@test.com', 'notwhatyoulookingfor'), new helpers.UserBuilder().withRandomProperties().save()])
                .spread(function (user1, user2, me) {
                    request.getAuthenticated('/api/user/search?query=tofind', me)
                        .expect(200)
                        .end(function (err, res) {
                            expect(res.body.length).to.equal(1);
                            expect(user1._id.equals(res.body[0].id) || user2._id.equals(res.body[0].id)).to.be.true;
                            done(err);
                        });
                });
        });

        it('should validate query', function () {
            return helpers.getTestUser(function (user) {
                return request.getAuthenticated('/api/user/search', user)
                    .expect(400);
            });
        });

        it('should not return current logged user', function (done) {
            q.all([new helpers.UserBuilder().withRandomProperties().withFullName('tofind1@test.com').save(),
                    new helpers.UserBuilder().withRandomProperties().withFullName('tofind2@test.com').save()])
                .spread(function (user1, me) {
                    request.getAuthenticated('/api/user/search?query=tofind', me)
                        .expect(200)
                        .end(function (err, res) {
                            expect(res.body.length).to.equal(1);
                            expect(user1._id.equals(res.body[0].id)).to.be.true;
                            done(err);
                        })
                });
        })
    });

    describe('addFriend', function () {
        var user;
        beforeEach(function () {
            return helpers.getTestUser().then(function (u) {
                user = u;
            });
        });

        it('should validate userId in body', function () {
            request.postAuthenticated('/api/user/addFriend', user)
                .expect(400);
        });

        it('should add friend request to logged user with pending status', function (done) {
            helpers.getTestUser().then(function (toAdd) {
                request.postAuthenticated('/api/user/addFriend', user)
                    .send({userId: toAdd.id})
                    .expect(200, function () {
                        User.findOne({_id: user.id}, function (err, updated) {
                            expect(updated.friendshipRequests).exist;
                            expect(updated.friendshipRequests.length).to.equal(1);
                            expect(updated.friendshipRequests[0].userId).to.eql(toAdd._id);

                            expect(updated.friendshipRequests[0].status).to.eql(friendshipStatus.pending);
                            done();
                        });
                    });
            })
        });

        it('should return 400 when user to add does not exist', function () {
            return request.postAuthenticated('/api/user/addFriend', user)
                .send({userId: new User({}).id})
                .expect(404);
        });

        it('should not add same user twice', function (done) {
            helpers.getTestUser().then(function (toAdd) {
                request.postAuthenticated('/api/user/addFriend', user)
                    .send({userId: toAdd.id})
                    .expect(200)
                    .end(function (err) {
                        if (err)
                            return done(err);
                        request.postAuthenticated('/api/user/addFriend', user)
                            .send({userId: toAdd.id})
                            .expect(400, done);
                    });
            });
        });
    });

    describe('/respondToFriendRequest', function () {
        it('should validate userId in body', function () {
            return helpers.getTestUser()
                .then(function (user) {
                    return request.postAuthenticated('/api/user/respondToFriendRequest', user)
                        .send({answer: true})
                        .expect(400)
                });
        });

        it('should validate answer in body', function () {
            return helpers.getTestUser()
                .then(function (user) {
                    return request.postAuthenticated('/api/user/respondToFriendRequest', user)
                        .send({userId: user.id})
                        .expect(400)
                });
        });

        it('should add user in friends', function (done) {
            new helpers.UserBuilder().withEmail('test1@ttt.com').withFullName('test1').save().then(function (toAccept) {
                new helpers.UserBuilder().withEmail('test2@ttt.com').withFullName('test2').withFriendRequest(new helpers.FriendRequestBuilder(toAccept)).save().then(function (user2) {
                    request.postAuthenticated('/api/user/respondToFriendRequest', user2)
                        .send({userId: toAccept.id, answer: true})
                        .expect(200, function (err, res) {
                            if (err)
                                return done(err);
                            expect(res.body.friends).exist;
                            expect(res.body.friends).not.empty;
                            expect(res.body.friends[0].friend).to.equal(toAccept.id);
                            done();
                        });
                });
            });
        });

        it('should set status as rejected and not add to friends when answer is false', function (done) {
            new helpers.UserBuilder().withEmail('test1@ttt.com').withFullName('test1').save().then(function (toAccept) {
                new helpers.UserBuilder().withEmail('test2@ttt.com').withFullName('test2').withFriendRequest(new helpers.FriendRequestBuilder(toAccept)).save().then(function (user2) {
                    request.postAuthenticated('/api/user/respondToFriendRequest', user2)
                        .send({userId: toAccept.id, answer: false})
                        .expect(200, function (err, res) {
                            if (err)
                                return done(err);
                            expect(res.body.friends).exist;
                            expect(res.body.friends).empty;
                            expect(res.body.friendshipRequests).not.empty;
                            expect(res.body.friendshipRequests[0].status).to.equal(friendshipStatus.rejected);
                            done();
                        });
                });
            });
        });

        it('should respond with 404 when user does not have pending request for that user', function () {
            return q.all([new helpers.UserBuilder().withRandomProperties().save(),
                    new helpers.UserBuilder().withRandomProperties().save()])
                .spread(function (me, toAccept) {
                    return request.postAuthenticated('/api/user/respondToFriendRequest', me)
                        .send({userId: toAccept.id, answer: true})
                        .expect(404);
                });
        });

        it('should check that user is authorized', function () {
            return request.post('/api/user/respondToFriendRequest')
                .send({userId: 'some-id', answer: true})
                .expect(401);
        });

        it('should respond with 404 when user to add does not exist', function () {
            return new helpers.UserBuilder().withRandomProperties().save()
                .then(function (me) {
                    return request.postAuthenticated('/api/user/respondToFriendRequest', me)
                        .send({userId: new User({}).id, answer: true})
                        .expect(404);
                });
        });
    });
});