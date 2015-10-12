///<reference path="~/node_modules/jasmine/lib/jasmine.js"/>

var ctrl = require('../../server/controllers/authorization-controller');
var mongoose = require('mongoose');
var mockgoose = require('mockgoose');
require('../../server/model');
mockgoose(mongoose);

describe('ctrl:authorization-controller', function (){
    var req, res, next, User, statusCode;
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
        next = function () {

        };
        User = mongoose.model('User');
        statusCode = undefined;
    });
    it('me:should return logged user', function () {

        req.user = { name: 'voislav' };
        
        spyOn(res, 'send');

        ctrl.me(req, res, next);

        expect(res.send).toHaveBeenCalledWith(req.user);
        expect(res.send.calls.argsFor(0)).toEqual([req.user]);
    });
    
    it('register:should save user from request body', function (done) {
        req.body = { email: 'test@ttt.com', password: '123123' };
        

        spyOn(res, 'send');
        spyOn(res, 'end').and.callFake(function () {
            expect(User.prototype.save).toHaveBeenCalled();
            expect(statusCode).toEqual(200);
            expect(res.end).toHaveBeenCalled();
            done();
        });

        spyOn(User.prototype, 'save').and.callThrough();
        
        ctrl.register(req, res, next);
    });

    it('register:should handle error on error saving user', function(done){
        req.body = {};
        spyOn(User.prototype, 'save').and.callThrough();
        spyOn(res, 'send');

        next = function (err) {
            expect(err).toBeDefined();
            expect(res.send.calls.any()).toEqual(false);

            done();
        }

        ctrl.register(req, res, next);
    });

    it('login: should serialize current user into token and return that into token property', function () {
        req.user = { email: 'test@yopmail.com' };
        
        spyOn(res, 'send');
        
        ctrl.login(req, res, next);
        
        expect(res.send).toHaveBeenCalled();
        expect(res.send.calls.argsFor(0)[0]).toBeDefined();
    });


});