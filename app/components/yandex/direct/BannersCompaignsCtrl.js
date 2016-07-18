'use strict';

angular.module('app.yandex.banners', ['ngRoute', 'LocalStorageModule'])

    .controller('BannersCompaignsCtrl', ['$scope', '$route', '$http', 'localStorageService', 'configurationService', 'allDirectCampaignsService',
        function($scope, $route, $http, localStorageService, configurationService, allDirectCampaignsService) {
            $scope.allBanners = [];
            $scope.tokenId = $route.current.params.tokenId;
            $scope.minClicksValue = 0;

            $scope.allBanners22 = allDirectCampaignsService.getBannersByCompaigns($scope.tokenId, $route.current.params.id).then(function(a) {
                $scope.allBanners = a;
            });

            $scope.clicksRangeFilter = function(banner) {
                for (var i = 0; i < banner.Phrases.length; i++) {
                    if (banner.Phrases[i].Clicks >= $scope.minClicksValue) return true;
                }

                return false;
            };

        }])

    .controller('BannersCompaignsHistoryCtrl', ['$scope', '$route', '$http', 'localStorageService', 'configurationService', 'allDirectCampaignsService',
        function($scope, $route, $http, localStorageService, configurationService, allDirectCampaignsService) {

            $scope.allBanners = [];

            $scope.tokenId = $route.current.params.tokenId;
            $scope.id = $route.current.params.id;
            $scope.realCampaignId = $route.current.params.realCampaignId;
            $scope.minClicksValue = 0;

            //@RequestMapping(value = "history/banners/campaign/historyId/{historyId}/realCampaignId/{{realCampaignId}}/token/{tokenId}", method = RequestMethod.GET)

            var id = $scope.id;
            var realCampaignId = $scope.realCampaignId;
            var tokenId = $scope.tokenId;

            $scope.ad = allDirectCampaignsService.getBannersByCompaignsHistory(id, realCampaignId, tokenId).then(function(a) {
                $scope.bannersWithMetaInfo = a;
                $scope.allBanners = a.yandexBannerList;
            });

            $scope.clicksRangeFilter = function(banner) {
                for (var i = 0; i < banner.Phrases.length; i++) {
                    if (banner.Phrases[i].Clicks > $scope.minClicksValue) return true;
                }

                return false;
            };
            
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
