'use strict';

angular.module('app.analytics', ['ngRoute', 'LocalStorageModule'])

    .controller('WebAnalyticsCtrl', ['$scope', '$rootScope', 'analyticsService', 'hotkeys', '$translate',
        function ($scope, $rootScope, analyticsService, hotkeys, $translate) {

            $rootScope.title = $translate.instant('ANALYTICS.WEB.COUNTERS.TITLE');

            $scope.allWebCounters = analyticsService.getAllWebCounters().then(function (data) {
                $scope.allWebCounters = data;
            });

            $scope.addNewWebCounter = function () {
                analyticsService.addNewWebCounter().then(function (account) {
                    $scope.allWebCounters.push(account);
                });
            };

            hotkeys.add({
                combo: 'shit+N',
                description: '',
                callback: function () {
                    $scope.addNewWebCounter();
                }
            });

        }])

    .controller('AllRecordsByCounterId', ['$scope', '$rootScope', 'analyticsService', function ($scope, $rootScope, analyticsService) {

        $rootScope.title = $translate.instant('ANALYTICS.WEB.COUNTERS.RECORDS_ALL.TITLE');

        $scope.currentCounterId = $route.current.params.id;
        $scope.allRecordsByCounterId = [];

        $scope.reloadData = function () {
            analyticsService.getAllAnalyticRecordsByCounterId($scope.currentCounterId).then(function (data) {
                $scope.allRecordsByCounterId = data;
            });
        };

        $scope.reloadData();
    }])

    .controller('WebCounterDetails', ['$scope', '$rootScope', '$route', 'logger', 'analyticsService', function ($scope, $rootScope, $route, logger, analyticsService) {

        $scope.currentCounterId = $route.current.params.id;

        $scope.webCounterPromise = analyticsService.getWebCounterById($scope.currentCounterId);
        $scope.webCounterPromise.then(function (data) {
            $scope.webCounter = data;
            $rootScope.title = data.name || '';
        });

        $scope.updateCounter = function () {

            analyticsService.updateWebCounter($scope.webCounter).then(function (data) {
                logger.logSuccess($translate.instant('APP.SAVED'));
            });
        }

    }]);

