/**
 * Created by voislav.mishevski on 11/23/2015.
 */
(function () {
    function ConversationDirective(){
        return {
            restrict: 'E',
            require: 'ngModel',
            scope: {
                sendMessage: '&'
            },
            templateUrl: 'views/conversation.html',
            link: function (scope, element, attributes, ngModel) {

            }
        }
    }

    angular.module('awesomeSocialNetworkApp')
        .directive('conversation', ConversationDirective);
})();