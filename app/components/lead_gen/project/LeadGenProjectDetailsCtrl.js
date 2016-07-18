'use strict';

angular.module('app.leadGenMethod.projectById', ['ngRoute', 'LocalStorageModule'])

    .controller('LeadGenProjectByIdCtrl', ['$scope', '$rootScope', 'logger', 'LeadGenService', '$route', 'PaymentsService', 'tokenService', 'allDirectCampaignsService', '$mdDialog', '$interval',
        function($scope, $rootScope, logger, LeadGenService, $route, PaymentsService, tokenService, allDirectCampaignsService, $mdDialog, $interval) {

            $scope.currentLeadGenProjectId = $route.current.params.id;

            $scope.newUTM = {};
            $scope.newTelephone = "";
            $scope.newPromoCodes = "";
            $scope.newCost = {};

            $scope.currentLeadGenProject = {};
            $scope.kpiLeadGenMethodFromProject = {};

            $scope.currentLeadGenProjectPromise = LeadGenService.getLeadGenProjectById($scope.currentLeadGenProjectId).then(function(e) {
                $scope.currentLeadGenProject = e;
                $scope.kpiLeadGenMethod = e.cachedKPIsData;
                $rootScope.title = e.name;

                if (!isUndefinedOrNull($scope.currentLeadGenProject.leadGenMethodId)){
                    LeadGenService.getAllLeadGenMethodById($scope.currentLeadGenProject.leadGenMethodId).then(function(ef) {
                        $scope.kpiLeadGenMethodFromProject = ef.cachedKPIsData;
                    });
                }

                if ($scope.currentLeadGenProject.yandexDirectCompaignsIds.length > 0) {
                    $scope.getYandexTokens();
                }
            });

            $scope.addNewUTM = function() {
                $scope.currentLeadGenProject.utm_metrics.push($scope.newUTM);
                $scope.newUTM = {};
            };

            $scope.addNewTelephone = function() {
                $scope.currentLeadGenProject.telephones.push($scope.newTelephone);
                $scope.newTelephone = "";
            };

            $scope.addNewPromoCodes = function() {
                $scope.currentLeadGenProject.promoCodes.push($scope.newPromoCodes);
                $scope.newPromoCodes = "";
            };

            $scope.updateProject = function() {
                LeadGenService.updateLeadGenProject($scope.currentLeadGenProject);
                logger.logSuccess("Информация о проекте успешно обновлена !");

            };

            $scope.newCostFunction = function() {
                $scope.newCost.leadGenProjectId = $scope.currentLeadGenProjectId;
                PaymentsService.addCompanyCost($scope.newCost).then(function(e) {
                    $scope.currentLeadGenProject.costs.push(e);
                    LeadGenService.updateLeadGenProject($scope.currentLeadGenProject);

                    $scope.newCost = {};
                    logger.logSuccess("Добавлен еще один расход ! ");
                });
            };

            ///////////////////////// YANDEX DIRECT ////////////////////////
            $scope.yandexTokens = [];

            $scope.getYandexTokens = function() {
                tokenService.getAllYandexTokens().then(function(a) {
                    $scope.yandexTokens = a;
                });
            };

            $scope.yandexStep = 0;

            $scope.selectYandexDirectToken = function(token) {
                allDirectCampaignsService.allCompaigns(token.id).then(function(a) {
                    $scope.allYandexCompaigns = a;
                    $scope.yandexStep++;
                });
            };

            $scope.isCampaignAlreadyUsed = function(campid) {
                for (var i = 0; i < $scope.currentLeadGenProject.yandexDirectCompaignsIds.length; i++) {
                    if ($scope.currentLeadGenProject.yandexDirectCompaignsIds[i] ===  campid) return true;
                }

                return false;
            };

            $scope.selectYandexDirectCampaign = function(campaign) {
                console.log(campaign);
                $scope.currentLeadGenProject.yandexDirectCompaignsIds.push(campaign.CampaignID);
                $scope.updateProject();
            };

            $scope.deleteYandxeDirectCampaign = function(index) {
                $scope.currentLeadGenProject.yandexDirectCompaignsIds.splice(index, 1);
            };

            $scope.currentUtm = {};
            $scope.utm_address = "http://moy_sayt.ru/moya_stranica.php?";
            $scope.utm_address_full = "";

            $scope.updateUtm = function() {
                $scope.utm_address_full = $scope.utm_address + "utm_source=" + $scope.currentUtm.utm_source + "&utm_medium=" + $scope.currentUtm.utm_medium  + "&utm_campaign=" + $scope.currentUtm.utm_campaign;
            };

            var a = $interval ($scope.updateUtm, 200);

            $scope.showUtm = function(ev, manager) {
                $scope.currentUtm = manager;

                $mdDialog.show({
                        scope: $scope,
                        preserveScope: true,
                        templateUrl: 'templates/modal/utm.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose:true
                    })
                    .then(function(answer) {

                    }, function() {
                        $scope.status = 'You cancelled the dialog.';
                    });
            };

            ///////////////////////////////////////////////////////////////
            $scope.generateRandomUTM = function() {
                $scope.newUTM.utm_source = "".generateRandomString(3);
                $scope.newUTM.utm_medium = "".generateRandomString(5);
                $scope.newUTM.utm_campaign = "".generateRandomString(5);
            };

            $scope.allCosts = function() {
                if (typeof $scope.currentLeadGenProject ===  "undefined" || typeof $scope.currentLeadGenProject.costs ===  "undefined") return 0;

                var costs = 0;
                for (var i = 0; i < $scope.currentLeadGenProject.costs.length; i++) {
                    costs += $scope.currentLeadGenProject.costs[i].amount;
                }

                return costs;
            };

            $scope.deleteCompanyCostsIndex = function(index) {
                $scope.currentLeadGenProject.costs.splice(index, 1);
                logger.logSuccess(" Обновите проект для удаления  ! ");
            };

            $scope.deleteUTMByIndex = function(index) {
                $scope.currentLeadGenProject.utm_metrics.splice(index, 1);
            };

            $scope.deleteTelephoneByIndex = function(index) {
                $scope.currentLeadGenProject.telephones.splice(index, 1);
            };

            $scope.deletePromoCodesByIndex = function(index) {
                $scope.currentLeadGenProject.promoCodes.splice(index, 1);
            };

        }])
;
