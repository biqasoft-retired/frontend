'use strict';
angular.module('app.desks', ['ngRoute', 'LocalStorageModule'])

    .controller('MotivationDeskCtrl', ['$scope', '$rootScope', 'PaymentsService',
        function ($scope, $rootScope, PaymentsService) {

            $scope.paymentBuilder = {};

            $scope.filterPanelShow = false;
            $scope.paymentBuilder.sortByDealsAmount = true;
            $scope.allManagersStats = [];
            $scope.autoUpdate = true;
            $scope.autoUpdateSecs = 6;
            $scope.secondStart = 0;

            $scope.updateMotivationDeskFunction = function () {
                $scope.allManagersStatsPromise = PaymentsService.getAllManagerStatsFromBuilder($scope.paymentBuilder).then(function (e) {
                    $scope.allManagersStats = e;
                });
            };
            $scope.updateMotivationDeskFunction();

            $scope.everySecondMotivationSellerDeskLoop = function () {
                $scope.secondStart++;

                if ($scope.secondStart >= $scope.autoUpdateSecs && $scope.autoUpdate) {
                    $scope.secondStart = 0;
                    $scope.updateMotivationDeskFunction();
                }
            };

            $scope.refresherEverySecondMotivationSellerDeskLoop = setInterval($scope.everySecondMotivationSellerDeskLoop, 1000);

            $rootScope.$on("$locationChangeStart", function () {
                console.log("leave page");
                clearInterval($scope.refresherEverySecondMotivationSellerDeskLoop);
            });

            $scope.percentToUpdate = function () {
                return $scope.secondStart / $scope.autoUpdateSecs;

            }

        }]);

