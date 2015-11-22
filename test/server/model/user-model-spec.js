var mongoose = require('mongoose');
require('../../../server/model');

describe('model:user', function (){
    var User = mongoose.model('User');

    it('should save hash of password and salt when saving new user', function (done) {
        var user = new User({ email: 'test@yopmail.com', fullName: 'test', password: '123123'});

        user.save(function (err) {
            expect(err).not.exist;
            expect(user.hashed_password).to.exist;
            expect(user.hashed_password).not.to.equal(user.password);
            expect(user.salt).exist;

            done();
        });
    });

    it('should match password hash', function (done) {
        var pass = '123123';
        var user = new User({ email: 'test@yopmail.com', password: pass });
        user.save(function () {
            var match = user.passwordMatch(pass);

            expect(match).to.be.true;
            done();
        });
    });

    it('should not save without password', function (done) {
        var user = new User({ email: 'test@yopmail.com' });

        user.save(function (err) {
            expect(err).to.be.defined;
            done();
        });
    });

    it('should not save without email', function (done) {
        var user = new User({ password: '123123' });

        user.save(function (err) {
            expect(err).to.be.defined;
            done();
        });
    });
});