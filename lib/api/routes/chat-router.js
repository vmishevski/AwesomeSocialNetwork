/**
 * Created by voislav.mishevski on 11/16/2015.
 */
var router = require('express').Router();
var passport = require('passport');
var ctrl = require('../controllers/message-controller');

module.exports = function (app) {
    router.get('/getConversation', passport.authenticate('jwt', {session: false}), ctrl.getConversation);

    router.post('/sendMessage', passport.authenticate('jwt', {session: false}), ctrl.sendMessage);

    app.use('/api/chat', router);
};