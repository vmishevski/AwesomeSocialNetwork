/**
 * Created by Voislav on 11/3/2015.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

exports.FriendshipRequestSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, required: true},
    dateRequested: {type: Date, default: Date.now},
    status: {type: Number, min: 1, max: 3, default: 1}
});

exports.FriendSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, required: true},
    dateBecomeFriends: {type: Date, default: Date.now}
});

