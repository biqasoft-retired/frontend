'use strict';

angular.module('app.domain.system', ['ngRoute', 'LocalStorageModule'])

    .controller('DomainCtrl', ['$scope', '$rootScope', 'logger', 'domainService',
        function ($rootScope, $scope, logger, domainService) {

            $scope.domainSettings = {};
            $scope.updateCurrentAdditionalFields = true;

            $scope.timeZoneOffset = [
                {name: "UTC 0", value: 0},
                {name: "UTC +0:30", value: 30},
                {name: "UTC +1", value: +60},
                {name: "UTC +1:30", value: +90},
                {name: "UTC +2", value: +120},
                {name: "UTC +2:30", value: +150},
                {name: "UTC +3", value: +180},
                {name: "UTC +3:30", value: +210},
                {name: "UTC +4", value: +240},
                {name: "UTC +4:30", value: +270},
                {name: "UTC +5", value: +300},
                {name: "UTC +5:30", value: +330},
                {name: "UTC +6", value: +360},
                {name: "UTC +6:30", value: +390},
                {name: "UTC +7", value: +420},
                {name: "UTC +7:30", value: +450},
                {name: "UTC +8", value: +480},
                {name: "UTC +8:30", value: +510},
                {name: "UTC +9", value: +540},
                {name: "UTC +9:30", value: +570},
                {name: "UTC +10", value: +600},
                {name: "UTC +10:30", value: +630},
                {name: "UTC +11", value: +660},
                {name: "UTC +11:30", value: +690},
                {name: "UTC +12", value: +720},
                {name: "UTC +12:30", value: +750},
                {name: "UTC +13", value: +780},
                {name: "UTC +13:30", value: +810},
                {name: "UTC +14", value: +840},

                {name: "UTC 0", value: 0},
                {name: "UTC -0:30", value: 30},
                {name: "UTC -1", value: -60},
                {name: "UTC -1:30", value: -90},
                {name: "UTC -2", value: -120},
                {name: "UTC -2:30", value: -150},
                {name: "UTC -3", value: -180},
                {name: "UTC -3:30", value: -210},
                {name: "UTC -4", value: -240},
                {name: "UTC -4:30", value: -270},
                {name: "UTC -5", value: -300},
                {name: "UTC -5:30", value: -330},
                {name: "UTC -6", value: -360},
                {name: "UTC -6:30", value: -390},
                {name: "UTC -7", value: -420},
                {name: "UTC -7:30", value: -450},
                {name: "UTC -8", value: -480},
                {name: "UTC -8:30", value: -510},
                {name: "UTC -9", value: -540},
                {name: "UTC -9:30", value: -570},
                {name: "UTC -10", value: -600},
                {name: "UTC -10:30", value: -630},
                {name: "UTC -11", value: -660},
                {name: "UTC -11:30", value: -690},
                {name: "UTC -12", value: -720}
            ];

            domainService.getMyDomainSettings().then(function (e) {
                $scope.domainSettings = e;
            });

            $scope.changeDomainTextLogo = function () {
                $rootScope.domainSettings.logoText = $scope.domainSettings.logoText;
            };

            $scope.updateDomainSettings = function () {
                $scope.objectToRequest = {};
                $scope.objectToRequest.updateCurrentAdditionalFields = $scope.updateCurrentAdditionalFields;
                $scope.objectToRequest.domainSettings = $scope.domainSettings;

                domainService.updateDomainSettings($scope.objectToRequest).then(function (data) {
                    $scope.domainSettings = data;
                });
                logger.logSuccess("Домен обновлен!");
            };

        }])

    .controller('DomainCustomFieldsCtrl', ['$scope', '$rootScope', 'logger', 'domainService', '$translate',
        function ($rootScope, $scope, logger, domainService, $translate) {

            var self = this;

            // custom field types to ignore in UI
            self.ignoreCustomFields = ['ANALYTICRECORD', 'OAUTH2APPLICATION'];

            $scope.domainSettings = {};
            $scope.updateCurrentAdditionalFields = true;

            domainService.getMyDomainSettings().then(function (e) {
                $scope.domainSettings = e;
            });

            $scope.changeDomainTextLogo = function () {
                $rootScope.domainSettings.logoText = $scope.domainSettings.logoText;
            };

            $scope.updateDomainSettings = function () {
                $scope.objectToRequest = {};
                $scope.objectToRequest.updateCurrentAdditionalFields = $scope.updateCurrentAdditionalFields;
                $scope.objectToRequest.domainSettings = $scope.domainSettings;

                domainService.updateDomainSettings($scope.objectToRequest).then(function (data) {
                    $scope.domainSettings = data;
                });
                logger.logSuccess("Домен обновлен!");
            };

            $scope.translateBiqa = function (name) {
                return $translate.instant("OBJECT.BIQA." + name);
            };

            $scope.isHidden = function (name) {
                return self.ignoreCustomFields.indexOf(name) > -1;
            };

        }])
;

