'use strict';

angular.module('app.notifications', ['ngRoute', 'LocalStorageModule'])

    .controller('NotificationsSettingsCtrl', ['$scope', 'timeService', 'logger', 'NotificationsService',
        function($scope, timeService, logger, NotificationsService) {

            $scope.currentNotificationTemplate = "test";
            $scope.androidTestMessage = {};
            $scope.androidTestMessage.shortText = "Это пример Push уведомления!";

            $scope.androidNotifications = NotificationsService.getAllNotificationsAccess().then(function(data) {
                $scope.androidNotifications = data;
            });

            $scope.testMessageToAndroid = function(id) {
                NotificationsService.testAndroidPush(id, $scope.androidTestMessage);
                logger.logSuccess("  Уведомление отправлено  ");

            };
        }])
;
