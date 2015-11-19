/**
 * Created by Voislav on 11/15/2015.
 */
(function () {
    'use strict';

    var socketService = function ($rootScope, socketServerUrl, $log) {
        var socket = io(socketServerUrl);

        socket.on('connect', function () {
            $log.debug('socket connected, emiting authenticate:', $rootScope.token);
            socket.emit('authenticate', {token: $rootScope.token});
        });

        socket.on('broadcastNewMessage', function (event) {
            $log.debug('broadcastNewMessage', event);
        });

        return {
            on: function (event, callback) {
                $log.debug('listening for', event);
                socket.on(event, function (data) {
                    $rootScope.$apply(callback(data));
                })
            },
            emit: function (event, data, callback) {
                socket.emit(event, data, function (callbackData) {
                    $rootScope.$apply(callback(callbackData));
                })
            }
        }
    };

    angular.module('awesomeSocialNetworkApp')
        .service('socketService', socketService);
})();