/**
 * Created by Voislav on 11/1/2015.
 */
'use strict';

var cloudinary = require('cloudinary'),
    debug = require('debug')('app:image-helper');

module.exports = {
    getGenericImage: function () {
        return cloudinary.api.resources_by_ids('generic-user.png')
            .then(function (response) {
                return response.resources[0]
            })
            .catch(function (response) {
                debug(response);
                return undefined;
            });
    },
    imageExists: function (imageId) {
        debug('imageExists', imageId);
        return cloudinary.api.resources_by_ids(imageId)
            .then(function (response) {
                var res = typeof(response.resources) !== 'undefined' && response.resources.length > 0;
                debug('image', imageId, res ? 'exists' : 'doesn\'t exist');
                return res;
            })
            .catch(function (response) {
                debug(response);
                return false;
            });
    },
    setImageAsValid: function (imageId) {
        debug('setImageAsValid', imageId);
        return cloudinary.api.update(imageId, undefined, {tags: 'valid'});
    }
};