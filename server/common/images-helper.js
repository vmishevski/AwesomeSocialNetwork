/**
 * Created by Voislav on 11/1/2015.
 */

var cloudinary = require('cloudinary');

module.exports = {
    getGenericUserImageUrl: function () {
        return cloudinary.url('generic-user.png');
    },
    isValidImage: function (publicId) {
        return true;
        //try{
        //    var r = cloudinary.url(publicId);
        //    return true;
        //}catch(err){
        //    return false;
        //}
    }
};