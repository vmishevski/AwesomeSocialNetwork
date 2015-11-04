/**
 * Created by Voislav on 11/2/2015.
 */
'use strict';

angular.module('awesomeSocialNetworkApp')
    .controller('SearchCtrl', ['UsersService', '$rootScope', 'events', '$stateParams', function (UsersService, $rootScope, events, $stateParams) {
        var self = this;

        self.searching = false;

        $rootScope.$on(events.searchStart, function () {
            self.searching = true;
            self.results = [];
        });

        self.results = [];

        $rootScope.$on(events.searchFinish, function (event, results) {
            angular.forEach(results, function (result) {
                self.results.push(result)
            });
        });

        if($stateParams.q){
            UsersService.search($stateParams.q);
        }
        
        self.addFriend = function (user) {
            UsersService.addFriend(user)
                .then(function () {
                     user.hasPendingRequest = true;
                });
        }
    }]);