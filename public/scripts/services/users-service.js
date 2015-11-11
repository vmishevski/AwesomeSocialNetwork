/**
 * Created by Voislav on 11/2/2015.
 */
'use strict';

angular.module('awesomeSocialNetworkApp')
    .service('UsersService', ['$http', 'routesUser', '$log', '$rootScope', 'events', '$state', '$q', function ($http, routes, $log, $rootScope, events, $state, $q) {
        var self = this;

        self.search = function (valueToSearch) {
            $state.go('home.search', {q: valueToSearch}).then(function () {
                valueToSearch = encodeURIComponent(valueToSearch);
                $log.log('searching with', valueToSearch);

                $rootScope.$broadcast(events.searchStart);

                return $http.get(routes.search, {
                    params: {query: valueToSearch}
                }).then(function (response) {
                    $log.log(response);
                    $rootScope.$broadcast(events.searchFinish, response.data);
                    return response.data;
                });
            });
        };

        self.getProfile = function (id) {
            $log.log('getProfile', id);

            return $http.get(routes.profile, {params: {userId: id}})
                .then(function (response) {
                    var profile = response.data;
                    if(profile.birthDay){
                        profile.birthDay = new Date(profile.birthDay);
                    }
                    return profile;
                });
        };

        self.addFriend = function (user) {
            $log.log('addFriend:', user);
            if(user.hasPendingRequest){
                return $q.resolve();
            }
            return $http.post(routes.addFriend, {userId: user.id});
        };

        self.getMyTimeline = function () {
            $log.log('getMyTimeline');
            return $http.get(routes.myTimeline)
                .then(function (response) {
                    return response.data;
                });
        }
    }]);