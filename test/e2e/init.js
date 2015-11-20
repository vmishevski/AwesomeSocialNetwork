/**
 * Created by voislav.mishevski on 11/20/2015.
 */
var mongoose = require('mongoose');
var config = require('config');
require('../../server/model/userModel');
require('../../server/model/friendshipModels');
require('../../server/model/chatRoomModel');

before(function (next) {
    console.log('connecting to', config.db);
    mongoose.connect(config.db, function (err) {
        if (err)
            next(err);

        var User = mongoose.model('User');
        User.remove({}, function (err) {
            if(err)
                next(err);
            var user = new User({email: 'johndoe@yopmail.com', fullName: 'John Doe', birthDay: new Date(), password: '123123'});
            var userTwo = new User({email: 'johndoesister@yopmail.com', fullName: 'John Doe Sister', birthDay: new Date(), password: '123123'});
            //user.friends.push({friend: userTwo});
            //userTwo.friends.push({friend: user});
            user.save(function (err) {
                if(err)
                    next(err);

                userTwo.save(function (err) {
                    next(err);
                });
            });
        });
    });
});