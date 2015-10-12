require('./userModel.js');

require('mongoose').connect('mongodb://127.0.0.1/AwesomeSocialNetwork', function (db) {
    require('debug')('app:model')('Connected to mongodb');
});