/**
 * Created by Voislav on 11/15/2015.
 */
(function () {
    'use strict';

    var ChatCtrl = function ($rootScope, chatService, socketService, events, $log) {
        var self = this;

        self.friends = $rootScope.currentUser.friends;
        self.conversation = undefined;
        self.messageToSend = '';
        self.openConversation = function (friend) {
            chatService.getConversation(friend)
                .then(function (conversation) {
                    self.conversation = conversation;
                });
        };

        self.sendMessage = function () {
            if(!!self.conversation && self.messageToSend)
            {
                chatService.sendMessage(self.conversation, self.messageToSend);
                self.messageToSend = '';
            }
        };

        socketService.on(events.newMessage, function (data) {
            $log.debug(data);
            if(!!self.conversation && self.conversation.id === data.roomId){
                self.conversation.messages.push(data.message);
            }
        });
    };

    angular.module('awesomeSocialNetworkApp').controller('ChatCtrl', ChatCtrl);
})();