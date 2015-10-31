/**
 * Created by Voislav on 10/31/2015.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User');

var ctrl = {

};

ctrl.search = function (req, res, next) {
    if(!req.query.query){
        return res.status(400).send('must provide something to query');
    }
    User.find({fullName: { '$regex': req.query.query, $options: 'i' }}, function (err, users) {
        if(err){
            return next(err);
        }

        res.status(200).send(users);
    });
};

module.exports = ctrl;
