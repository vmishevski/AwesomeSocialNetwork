/**
 * Created by Voislav on 11/2/2015.
 */
'use strict';

angular.module('awesomeSocialNetworkApp')
.controller('TimelineCtrl', ['$scope', '$state', '$stateParams', 'UsersService', function ($scope, $state, $stateParams, UsersService) {
        var self = this;
        self.openProfile = function (userId) {
            $state.go('home.timeline', {userId: userId});
        };

        self.acceptFriendRequest = function (request) {
            UsersService.acceptFriendRequest(request.userId);
        };

        self.rejectFriendRequest = function (request) {
            UsersService.rejectFriendRequest(request.userId);
        };

        self.user = {};

        UsersService.getProfile($stateParams.userId)
            .then(function (profile) {
                self.user = profile;
            });
    }]);