'use strict';

angular.module('app.segments', ['ngRoute', 'LocalStorageModule'])
    .controller('AllStaticSegments', ['$scope', 'logger', 'customerService', 'hotkeys', function ($scope, logger, customerService, hotkeys) {

        $scope.allSegmentsCustomers = [];
        $scope.allSegmentsStats = [];
        $scope.newStaticSegment = {};

        $scope.allSegments = [];
        customerService.getAllStaticSegments().then(function (data) {
            $scope.allSegments = data;
        });

        $scope.addNewStaticSegment = function () {
            customerService.addStaticSegment($scope.newStaticSegment).then(function (data) {
                $scope.allSegments.push(data);
            });
            $scope.newStaticSegment = {};
            logger.logSuccess("Новый статический сегмент")
        };

        hotkeys.add({
            combo: 'shit+N',
            description: '',
            callback: function () {
                $scope.addNewStaticSegment();
            }
        });

        $scope.getCustomersByStaticSegment = function (segmentID) {
            if (!$scope.allSegmentsCustomers[segmentID]) {
                $scope.allSegmentsCustomers[segmentID] = {};
                customerService.getCustomersByStaticSegment(segmentID).then(function (data) {
                    $scope.allSegmentsCustomers[segmentID] = data;
                })
            } else {
                return $scope.allSegmentsCustomers[segmentID];
            }
        };

        $scope.getAllSegmentsStats = function (segmentID) {
            if (!$scope.allSegmentsStats[segmentID]) {
                $scope.allSegmentsStats[segmentID] = {};
                customerService.getStatsByStaticSegment(segmentID).then(function (data) {
                    $scope.allSegmentsStats[segmentID] = data;
                })
            } else {
                return $scope.allSegmentsStats[segmentID];
            }
        }

    }])

    .controller('AllDynamicSegments', ['$scope', 'logger', 'customerService', function ($scope, logger, customerService) {

        $scope.allSegmentsCustomers = [];
        $scope.allSegmentsStats = [];

        $scope.allSegments = [];
        customerService.getAllDynamicSegments().then(function (data) {
            $scope.allSegments = data;
        });

        $scope.addNewStaticSegment = function () {
            customerService.addStaticSegment($scope.newStaticSegment).then(function (data) {
                $scope.allSegments.push(data);
            });
            $scope.newStaticSegment = {};
            logger.logSuccess("Новый статический сегмент")
        };

        $scope.getAllSegmentsStats = function (segmentID) {
            if (!$scope.allSegmentsStats[segmentID]) {
                $scope.allSegmentsStats[segmentID] = {};
                customerService.getStatsByDynamicSegment(segmentID).then(function (data) {
                    $scope.allSegmentsStats[segmentID] = data;
                })
            } else {
                return $scope.allSegmentsStats[segmentID];
            }
        };

        $scope.getCustomersByDynamicSegment = function (segmentID) {
            if (!$scope.allSegmentsCustomers[segmentID]) {
                $scope.allSegmentsCustomers[segmentID] = {};
                customerService.getCustomersByStaticSegment(segmentID).then(function (data) {
                    $scope.allSegmentsCustomers[segmentID] = data;
                })
            } else {
                return $scope.allSegmentsCustomers[segmentID];
            }
        };

    }])

    .controller('StaticSegmentDetailsCtrl', ['$scope', '$rootScope', '$route', 'logger', 'customerService', function ($scope, $rootScope, $route, logger, customerService) {

        $scope.currentSegmentID = $route.current.params.id;

        $scope.segmentDetails = {};
        customerService.getStaticSegmentById($scope.currentSegmentID).then(function (data) {
            $scope.segmentDetails = data;
            $rootScope.title = data.name;
        });

        $scope.updateStaticSegment = function () {
            customerService.updateStaticSegment($scope.segmentDetails);
            logger.logSuccess("Сегмент обновлен!");
        }
    }])

    .controller('DynamicSegmentDetailsCtrl', ['$scope', '$rootScope', '$route', 'logger', 'customerService', function ($scope, $rootScope, $route, logger, customerService) {

        $scope.currentSegmentID = $route.current.params.id;

        $scope.segmentDetails = {};
        customerService.getDynamicSegmentById($scope.currentSegmentID).then(function (data) {
            $scope.segmentDetails = data;
            $rootScope.title = data.name;
        });

        $scope.updateStaticSegment = function () {
            customerService.updateDynamicSegment($scope.segmentDetails);
            logger.logSuccess("Сегмент обновлен!");
        }

    }])
