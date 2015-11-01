var ctrl = require('../../../server/controllers/authorization-controller');
var mongoose = require('mongoose');
var mockgoose = require('mockgoose'),
    sinon = require('sinon'),
    chai = require('chai'),
    expect = chai.expect,
    sinonChai = require('sinon-chai');
require('../../../server/model/index');
mockgoose(mongoose);

chai.use(sinonChai);

describe('ctrl:authorization-controller', function (){
    var req, res, next, User, statusCode, sandbox;

    beforeEach(function () {
       sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    beforeEach(function () {
        req = { body: {}};
        res = {
            send: function (){

            },
            status: function (code){
                statusCode = code;
                return res;
            },
            end: function (){

            }
        };
        next = sinon.stub();
        User = mongoose.model('User');
        statusCode = undefined;
    });

    it('me:should return logged user', function () {

        req.user = { name: 'voislav' };

        sandbox.spy(res, 'send');

        ctrl.me(req, res, next);

        expect(res.send).calledWith(req.user);
    });
    
    it('register:should save user from request body', function (done) {
        req.body = { email: 'test@ttt.com', fullName: 'test', password: '123123' };

        sandbox.spy(User.prototype, 'save');
        sandbox.spy(res, 'send');
        sandbox.stub(res, 'end', function () {
            expect(User.prototype.save).called;
            expect(statusCode).to.equal(200);
            expect(res.end).to.have.been.called;
            done();
        });

        ctrl.register(req, res, next);
    });

    it('register:should handle error on error saving user', function(done){
        req.body = {};
        sandbox.spy(User.prototype, 'save');
        sandbox.spy(res, 'send');

        next = function (err) {
            expect(err).to.exist;
            expect(res.send).not.called;
            done();
        };

        ctrl.register(req, res, next);
    });

    it('login: should serialize current user into token and return that into token property', function () {
        req.user = { email: 'test@yopmail.com' };

        sandbox.spy(res, 'send');
        
        ctrl.login(req, res, next);
        
        expect(res.send).called;
        expect(res.send).calledWith(sinon.match.defined);
        expect(res.send).calledWith(sinon.match({token: sinon.match.defined}));
    });

    it('unique: should respond with status 400 when username not found in query', function () {
        req.query = {};

        sandbox.spy(res, 'status');
        sandbox.spy(res, 'end');

        ctrl.usernameUnique(req, res, next);

        expect(res.status).calledWith(400);
        expect(res.end).called;
    });

    it('unique: should respond with {unique: true} when user not found with that username', function (done) {
        req.query = {username: 'username'};

        sandbox.spy(res, 'status');

        sandbox.stub(User, 'findOne', function (f, cb) {
            cb(undefined, undefined); // return user not found
        });
        sandbox.stub(res, 'send', function () {
            expect(res.status).calledWith(200);
            expect(res.send).calledWith(sinon.match({unique: true}));
            done();
        });



        ctrl.usernameUnique(req, res, next);
    });

    it('unique: should respond with {unique: false} when user found with that username', function (done) {
        req.query = {username: 'username'};

        sandbox.spy(res, 'status');

        sandbox.stub(User, 'findOne', function (f, cb) {
            cb(undefined, {email: 'test@email.com'}); // return some user
        });
        sandbox.stub(res, 'send', function () {
            expect(res.status).calledWith(200);
            expect(res.send).calledWith(sinon.match({unique: false}));
            done();
        });

        ctrl.usernameUnique(req, res, next);
    });

    it('unique: propagete db error', function () {
        var err = {someError: 'desc'};
        req.query = {username: 'username'};
        sandbox.stub(User, 'findOne', function (f, cb) {
            cb(err,undefined); // return some user
        });

        sinon.spy(res, 'send');
        next = sinon.spy();
        ctrl.usernameUnique(req, res, next);

        expect(next).calledWith(err);
        expect(res.send).not.called;
    });

    describe('changePassword', function () {
        var req, sandbox;
        beforeEach(function () {
            sandbox = sinon.sandbox.create();
            req = {body: {}};
            req.body.oldPassword = '123123';
            req.body.password = '123123';
            req.body.confirmPassword = '123123';
            req.user= {id: '123', password: '123123'};
        });

        afterEach(function () {
            sandbox.restore();
        });

        it('changePassword: should respond with 400 on missing old password', function () {

            delete req.body.oldPassword;
            sandbox.stub(res, 'status').returns(res);
            sandbox.stub(res, 'send').returns(res);

            ctrl.changePassword(req, res, next);

            expect(res.status).calledWith(400);
            expect(res.send).calledWith(sinon.match.defined);
        });

        it('changePassword: should respond with 400 on missing new password', function () {
            delete req.body.password;
            sandbox.stub(res, 'status').returns(res);
            sandbox.stub(res, 'send').returns(res);

            ctrl.changePassword(req, res, next);

            expect(res.status).calledWith(400);
            expect(res.send).calledWith(sinon.match.defined);
        });

        it('changePassword: should respond with 400 on missing confirm password', function () {
            delete req.body.confirmPassword;
            sandbox.stub(res, 'status').returns(res);
            sandbox.stub(res, 'send').returns(res);

            ctrl.changePassword(req, res, next);

            expect(res.status).calledWith(400);
            expect(res.send).calledWith(sinon.match.defined);
        });

        it('changePassword: should respond with 400 on not matching provided pass and confirm pass', function () {
            req.body.confirmPassword = 'different';
            sandbox.stub(res, 'status').returns(res);
            sandbox.stub(res, 'send').returns(res);

            ctrl.changePassword(req, res, next);

            expect(res.status).calledWith(400);
            expect(res.send).calledWith(sinon.match.defined);
        });

        it('changePassword: should respond with 400 when provided password doesnt match logged user password', function () {
            sandbox.stub(res, 'status').returns(res);
            sandbox.stub(res, 'send').returns(res);
            var user = {
                passwordMatch: sinon.stub().returns(false)
            };

            sandbox.stub(User, 'findOne').callsArgWith(1, undefined, user);

            ctrl.changePassword(req, res, next);

            expect(res.status).calledWith(400);
            expect(res.send).calledWith(sinon.match.defined);
        });

        it('changePassword: should respond with 200 when provided password matches', function () {
            sandbox.stub(res, 'status').returns(res);
            sandbox.stub(res, 'send').returns(res);
            var user = {
                passwordMatch: sinon.stub().returns(true),
                save: sandbox.stub().callsArgWith(0, undefined)
            };

            sandbox.stub(User, 'findOne').callsArgWith(1, undefined, user);

            ctrl.changePassword(req, res, next);

            expect(res.status).calledWith(200);
            expect(res.send).calledWith(sinon.match.defined);
        });

        it('changePassword: should propagate find user error', function () {
            sandbox.stub(res, 'status').returns(res);
            sandbox.stub(res, 'send').returns(res);
            var err = {};

            sandbox.stub(User, 'findOne').callsArgWith(1,err);

            ctrl.changePassword(req, res, next);
            expect(res.status).not.called;
            expect(next).calledWith(err);
        });

        it('changePassword: should propagate find user error', function () {
            sandbox.stub(res, 'status').returns(res);
            sandbox.stub(res, 'send').returns(res);
            var err = {};
            var user = {
                passwordMatch: sinon.stub().returns(true),
                save: sandbox.stub().callsArgWith(0, err)
            };

            sandbox.stub(User, 'findOne').callsArgWith(1,undefined, user);

            ctrl.changePassword(req, res, next);
            expect(res.status).not.called;
            expect(next).calledWith(err);
        });
    });

    describe('saveProfile', function () {
        var sandbox, err = {}, user = {}, imageHelper, q;

        beforeEach(function () {
            imageHelper = require('../../../server/common/images-helper');
            q = require('q');
            sandbox = sinon.sandbox.create();
            req = {body: {fullName: 'new name', profileImage: {public_id: 'newpic'}}, user: {id: '123123' }};
            req.body.fullName = '123123';

            user.profileImage = {public_id: 'prevpic'};
            user.save = sandbox.stub().callsArgWith(0, undefined);
            sandbox.stub(res, 'status').returns(res);
            sandbox.stub(res, 'send');
            sandbox.stub(User, 'findOne').callsArgWith(1, undefined, user);
            sandbox.stub(imageHelper, 'setImageAsValid');
            sandbox.stub(imageHelper, 'imageExists');
            sandbox.stub(imageHelper, 'getGenericImage');
        });

        afterEach(function () {
            sandbox.restore();
        });

        it('saveProfile: should set full name from body and save', function () {
            imageHelper.imageExists.returns(q.resolve(true));
            imageHelper.setImageAsValid.returns(q.resolve());

            res.send.restore();
            sandbox.stub(res, 'send', function () {
                expect(user.fullName).to.equal(req.body.fullName);
                expect(user.save).called;
                expect(res.status).calledWith(200);
                expect(res.send).calledWith(user);
            });

            ctrl.saveProfile(req, res, next);
        });

        it('saveProfile: should change profile', function (done) {
            imageHelper.imageExists.returns(q.resolve(true));
            imageHelper.setImageAsValid.returns(q.resolve());

            res.send.restore();
            sandbox.stub(res, 'send', function () {
                expect(user.fullName).to.equal(req.body.fullName);
                expect(user.profileImage).exist;
                expect(user.profileImage.public_id).to.equal(req.body.profileImage.public_id);
                expect(user.save).called;
                expect(res.status).calledWith(200);
                expect(res.send).calledWith(user);
                done();
            });

            ctrl.saveProfile(req, res, next);
        });

        it('saveProfile: should set generic image when no profile was set', function (done) {
            var genericImage = {public_id: 'genericImage'};
            imageHelper.getGenericImage.returns(q.resolve(genericImage));
            imageHelper.imageExists.returns(q.resolve(false));

            res.send.restore();
            sandbox.stub(res, 'send', function () {
                expect(user.fullName).to.equal(req.body.fullName);
                expect(user.profileImage).exist;
                expect(user.profileImage).to.equal(genericImage);
                expect(user.save).called;
                expect(res.status).calledWith(200);
                expect(res.send).calledWith(user);
                done();
            });

            ctrl.saveProfile(req, res, next);
        });

        it('saveProfile: should set generic image when image was not found', function (done) {
            req.body.profileImage = undefined;
            var genericImage = {public_id: 'genericImage'};
            imageHelper.getGenericImage.returns(q.resolve(genericImage));


            res.send.restore();
            sandbox.stub(res, 'send', function () {
                expect(user.fullName).to.equal(req.body.fullName);
                expect(user.profileImage).exist;
                expect(user.profileImage).to.equal(genericImage);
                expect(user.save).called;
                expect(res.status).calledWith(200);
                expect(res.send).calledWith(user);
                done();
            });

            ctrl.saveProfile(req, res, next);
        });

        it('saveProfile: should propagate find user error', function () {
            User.findOne.callsArgWith(1, err, undefined);
            ctrl.saveProfile(req, res, next);

            expect(next).calledWith(err);
        });

        it('saveProfile: should not change profileImage when both are same', function (done) {
            req.body.profileImage = {public_id: 'slika'};
            var staraSlika = {public_id: 'slika'};
            user.profileImage = staraSlika;
            var genericImage = {public_id: 'genericImage'};
            imageHelper.imageExists.returns(q.resolve(true));
            imageHelper.setImageAsValid.returns(q.resolve());
            imageHelper.getGenericImage.returns(q.resolve(genericImage));

            res.send.restore();
            sandbox.stub(res, 'send', function () {
                expect(user.fullName).to.equal(req.body.fullName);
                expect(user.profileImage).exist;
                expect(user.profileImage).to.equal(staraSlika);
                expect(user.save).called;
                expect(res.status).calledWith(200);
                expect(res.send).calledWith(user);
                done();
            });

            ctrl.saveProfile(req, res, next);
        });

        it('saveProfile: should propagate save user error', function (done) {
            user.save.callsArgWith(0, err, undefined);
            imageHelper.imageExists.returns(q.resolve(true));
            imageHelper.setImageAsValid.returns(q.resolve());

            //next = sandbox.stub();
            next = function (theError) {
                expect(theError).to.equal(theError);
                done();
            };
            ctrl.saveProfile(req, res, next);
        });
    });

});