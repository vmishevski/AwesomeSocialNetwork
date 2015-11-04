/**
 * Created by Voislav on 11/2/2015.
 */
'use strict';

angular.module('awesomeSocialNetworkApp')
    .service('UsersService', ['$http', 'routesUser', '$log', '$rootScope', 'events', '$state', '$q', function ($http, routesUser, $log, $rootScope, events, $state, $q) {
        var self = this;

        self.search = function (valueToSearch) {
            $state.go('home.search', {q: valueToSearch}).then(function () {
                valueToSearch = encodeURIComponent(valueToSearch);
                $log.log('searching with', valueToSearch);

                $rootScope.$broadcast(events.searchStart);

                return $http.get(routesUser.search, {
                    params: {query: valueToSearch}
                }).then(function (response) {
                    $log.log(response);
                    $rootScope.$broadcast(events.searchFinish, response.data);
                    return response.data;
                });
            });
        };

        self.getProfile = function (userId) {

        };

        self.addFriend = function (user) {
            $log.log('addFriend:', user);
            if(user.hasPendingRequest){
                return $q.resolve();
            }
            return $http.post(routesUser.addFriend, {userId: user.id});
        }
    }]);