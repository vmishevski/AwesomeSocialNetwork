﻿var mongoose = require('mongoose');
var mockgoose = require('mockgoose');

mockgoose(mongoose);

describe('model:user', function (){
    var User;
    
    beforeEach(function () {
        User = mongoose.model('User');
    });

    it('should save hash of password and salt when saving new user', function (done) {
        var user = new User({ email: 'test@yopmail.com', password: '123123'});

        user.save(function (err) {
            expect(err).not.toBeTruthy();
            expect(user.hash_password).not.toEqual(user.password);
            expect(user.salt).toBeDefined();

            done();
        });
    });

    it('should match password hash', function () {
        var pass = '123123';
        var user = new User({ email: 'test@yopmail.com', password: pass });
        user.save(function () {
            var match = user.passwordMatch(pass);
            
            expect(match).toBeTruthy();
        });
    });

    it('should not save without password', function () {
        var user = new User({ email: 'test@yopmail.com' });
        
        user.save(function (err) {
            expect(err).toBeTruthy();
        });
    });

    it('should not save without email', function () {
        var user = new User({ password: '123123' });
        
        user.save(function (err) {
            expect(err).toBeTruthy();
        });
    });
})