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
            $rootScope.$broadcast(events.openConversation, friend);
        };
    };

    angular.module('awesomeSocialNetworkApp').controller('ChatCtrl', ChatCtrl);
})();