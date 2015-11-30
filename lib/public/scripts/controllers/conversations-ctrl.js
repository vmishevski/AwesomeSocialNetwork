/**
 * Created by voislav.mishevski on 11/23/2015.
 */
(function () {
    function ConversationsCtrl ($rootScope, events, chatService){
        var self = this;

        self.conversations = [];
        $rootScope.$on(events.openConversation, function (event, friend) {
            chatService.getConversation(friend)
                .then(function (conversation) {
                    if(!_.find(self.conversations, _.matches({id: conversation.id}))){
                        self.conversations.push(conversation);
                    }
                });
        });

        //socketService.on(events.newMessage, function (data) {
        //    $log.debug(data);
        //    if(!!self.conversation && self.conversation.id === data.roomId){
        //        self.conversation.messages.push(data.message);
        //    }
        //});

        //self.sendMessage = function (conversation, messageToSend) {
        //    if(!!self.conversation && self.messageToSend)
        //    {
        //        chatService.sendMessage(self.conversation, self.messageToSend);
        //        self.messageToSend = '';
        //    }
        //};
    }

    angular.module('awesomeSocialNetworkApp')
        .controller('ConversationsCtrl', ConversationsCtrl);
})();