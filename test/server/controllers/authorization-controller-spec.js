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
        req = {};
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
        next = function (err) {
            if(err) {
                throw new Error(err);
            }
        };
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
        //expect(res.send.calls.argsFor(0)[0]).toBeDefined();
    });

});