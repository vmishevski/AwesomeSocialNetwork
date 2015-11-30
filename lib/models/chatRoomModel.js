var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var participant = {
    fullName: {type: String, required: true},
    userId: {type: Schema.Types.ObjectId, required: true}
};
var ParticipantSchema = new Schema(participant);

var MessageSchema = new Schema({
    from: participant,
    message: String,
    postedOn: {type: Date, default: Date.now}
});

var ChatRoomSchema = new Schema({
    creator: participant,
    name: String,
    participants: [ParticipantSchema],
    messages: [MessageSchema]
});

ChatRoomSchema.options.toJSON = {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
    }
};

mongoose.model('ChatRoom', ChatRoomSchema);