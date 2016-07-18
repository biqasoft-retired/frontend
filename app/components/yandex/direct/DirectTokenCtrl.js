'use strict';

angular.module('app.token.new', ['ngRoute', 'LocalStorageModule'])

    .controller('DirectTokenCtrl', ['$scope', '$http', 'localStorageService', 'tokenService', 'configurationService', '$location',
        function($scope, $http, localStorageService, tokenService, configurationService, $location) {
            $scope.token = {};
            $scope.tokenCode = $location.search().code;

            $scope.recievedTokenInfo = tokenService.obtainYandexDirectCode($scope.tokenCode).then(function(a) {
                $scope.recievedTokenInfo = a;
                $scope.token = a.token;
            });
        }])

    .controller('DirectTokenAllCtrl', ['$scope', '$http', 'localStorageService', 'tokenService', 'configurationService', '$location',
        function($scope, $http, localStorageService, tokenService, configurationService, $location) {
            $scope.tokens = [];

            tokenService.getAllYandexTokens().then(function(a) {
                $scope.tokens = a;
            });
        }])

    .controller('DirectTokenCampaignsHistory', ['$scope', '$http', 'localStorageService', 'allDirectCampaignsService', 'configurationService', '$location', '$route',
        function($scope, $http, localStorageService, allDirectCampaignsService, configurationService, $location, $route) {
            $scope.tokenId = $route.current.params.id;
            $scope.historyId = $route.current.params.historyId;

            console.log("ID" + $scope.historyId);

            $scope.allCompaigns = [];
            $scope.clientInfo = [];
            $scope.allBanners = [];

            $scope.toHistoryCampaigns = function() {
                console.log($scope.historyAcc);
            };
            $scope.historyAcc = "";

            $scope.allCompaignsHistory = allDirectCampaignsService.getAllCompaignsHistory($scope.historyId, $scope.tokenId).then(function(a) {
                $scope.allCompaigns = a.yandexCampaignList;
                $scope.allCompaignsWithMetaInfo = a;
            });

            //$scope.recievedTokenInfo = allDirectCampaignsService.allCompaigns($scope.tokenId).then(function (a) {
            //    $scope.allCompaigns = a;
            //});

            //$scope.recievedTokenInfo22 = allDirectCampaignsService.getClientInfo($scope.tokenId).then(function (a) {
            //    $scope.clientInfo = a;
            //});
            //history/campaign/historyId/{historyId}/{tokenId}
            
            $scope.getDayFromTime = function(time) {
                return new Date(time).getDate();
            };

            $scope.getMonthFromTime = function(time) {
                return new Date(time).getMonth() + 1;
            };

            $scope.getYearFromTime = function(time) {
                return new Date(time).getFullYear();
            };

            $scope.getHoursFromTime = function(time) {
                return new Date(time).getHours();
            };

            $scope.getMinutesFromTime = function(time) {
                return new Date(time).getMinutes();
            };

        }])

    .controller('DirectTokenCampaigns', ['$scope', '$http', 'localStorageService', 'allDirectCampaignsService', 'configurationService', '$location', '$route',
        function($scope, $http, localStorageService, allDirectCampaignsService, configurationService, $location, $route) {
            $scope.tokenId = $route.current.params.id;

            $scope.allCompaigns = [];
            $scope.clientInfo = [];
            $scope.allBanners = [];
            $scope.historyAcc = "";
            $scope.tempHistoryIdi = 0;

            $scope.toHistoryCampaigns = function() {
                console.log($scope.historyAcc);
                for (var i = 0; i < $scope.allHistoryCampaigns.length; i++) {
                    if ($scope.allHistoryCampaigns[i].id ===  $scope.historyAcc) {
                        $scope.tempHistoryIdi = i;
                        break;
                    }
                }

                $scope.allCompaigns = $scope.allHistoryCampaigns[$scope.tempHistoryIdi].yandexCampaignList;
            };

            $scope.allHistoryCampaigns = allDirectCampaignsService.getAllHistoryCampaigns($scope.tokenId).then(function(data) {
                $scope.allHistoryCampaigns = data;
            });

            $scope.recievedTokenInfo = allDirectCampaignsService.allCompaigns($scope.tokenId).then(function(a) {
                $scope.allCompaigns = a;
            });
            $scope.recievedTokenInfo22 = allDirectCampaignsService.getClientInfo($scope.tokenId).then(function(a) {
                $scope.clientInfo = a;
            });

            $scope.getDayFromTime = function(time) {
                return new Date(time).getDate();
            };

            $scope.getMonthFromTime = function(time) {
                return new Date(time).getMonth() + 1;
            };

            $scope.getYearFromTime = function(time) {
                return new Date(time).getFullYear();
            };

            $scope.getHoursFromTime = function(time) {
                return new Date(time).getHours();
            };

            $scope.getMinutesFromTime = function(time) {
                return new Date(time).getMinutes();
            };

        }])

;

