/**
 * Created by Voislav on 11/2/2015.
 */
'use strict';

angular.module('awesomeSocialNetworkApp')
    .controller('SearchCtrl', ['UsersService', '$rootScope', 'events', function (UsersService, $rootScope, events) {
        var self = this;

        self.searching = false;

        $rootScope.$on(events.searchStart, function () {
            self.searching = true;
            self.results = [];
        });

        self.results = [];

        $rootScope.$on(events.searchFinish, function (results) {
            angular.forEach(results, function (result) {
                self.results.push(result)
            });
        });
    }]);