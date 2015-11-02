var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var UserSchema = new Schema( {
    email: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    birthDay: Date,
    profileImage: {
        public_id: String,
        url: String
    },
    salt: { type: String, required: true },
    hashed_password: { type: String, required: true }
});

UserSchema.methods = {
    /**
     * check if hash of provided password match saved has for the user
     * @param {String} plainPassword password to check
     */
    passwordMatch: function (plainPassword) {
        var user = this;
        return bcrypt.compareSync(plainPassword, user.hashed_password);
    },
    hashPassword: function (plainPassword) {
        return bcrypt.hashSync(plainPassword, this.salt);
    }
};

/**
 * When setting password, set salt and hash_password
 */
UserSchema.virtual('password').set(function (password) {
    if (typeof (password) === 'number') {
        password = password.toString();
    }

    this._password = password;
    this.salt = bcrypt.genSaltSync(10);
    this.hashed_password = this.hashPassword(password);
}).get(function () {
    return this._password;
});

/**
 * Make sure that when adding new user, password is valid
 */
UserSchema.pre('save', function (next) {
    if(this.isNew){
        if(!this.password || this.password.length < 6){
            return next(new Error('Invalid password'));
        }
    }

    next();

});

/**
  * adjust toJSON transformation
  */ 
UserSchema.options.toJSON = {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret.password;
        delete ret.hashed_password;
        delete ret.salt;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
};
    
mongoose.model('User', UserSchema);
