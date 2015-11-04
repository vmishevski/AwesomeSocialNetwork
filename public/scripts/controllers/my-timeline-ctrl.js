/**
 * Created by Voislav on 11/4/2015.
 */
'use strict';

angular.module('awesomeSocialNetworkApp')
.controller('MyTimelineCtrl', ['UsersService', function (UsersService) {
        var self = this;

        self.pendingFriendshipRequests = [];

        UsersService.getMyTimeline()
            .then(function (timeline) {
                self.pendingFriendshipRequests = [];
                angular.forEach(timeline.pendingFriendshipRequests, function (item) {
                    self.pendingFriendshipRequests.push(item);
                });
            });
    }]);