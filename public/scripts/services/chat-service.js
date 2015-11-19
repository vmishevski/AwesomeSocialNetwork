/**
 * Created by voislav.mishevski on 11/16/2015.
 */
'use strict';
(function () {
    var chatService = function ($http, $log, routesUser) {
        var self = this;

        self.getConversation = function (friend) {
            $log.debug('getConversation', friend);

            return $http.get(routesUser.getConversation, {params: {userId: friend.id}})
                .then(function (response) {
                    return response.data;
                });
        };

        self.sendMessage = function (conversation, message) {
            return $http.post(routesUser.sendMessage, {roomId: conversation.id, message: message})
                .then(function (response) {
                    return response.data;
                })
        };
    };

    angular.module('awesomeSocialNetworkApp').service('chatService', chatService);
})();