'use strict';

angular.module('app.custom.objects.meta', ['ngRoute', 'LocalStorageModule'])
    .controller('CustomObjectsMetaAllCtrl', ['$scope', '$rootScope', 'logger', '$location', 'SystemService', 'hotkeys', 'customObjectsService',
        function ($scope, $rootScope, logger, $location, SystemService, hotkeys, customObjectsService) {
            $scope.projects = [];

            $scope.itemsPerPage = 15; // this should match however many results your API puts on one page
            $scope.currentPage = 1;
            $scope.pagesNumbers = 1;

            $scope.filterPanelShow = false;

            $scope.allCustomersCount = $rootScope.globalDomainStats.allCustomersCount;

            $scope.newCompany = {};
            $scope.showOnlyWhenIamResponsible = false;

            $scope.addCompany = function () {
                logger.logSuccess("Объект успешно добавлена!");

                customObjectsService.addCustomObjectMeta($scope.newCompany).then(function (e) {
                    $rootScope.allCustomObjectsMeta.push(e);
                    $location.path('/objects/custom/meta/details/' + e.id);
                });

            };

            hotkeys.add({
                combo: 'shit+N',
                description: '',
                callback: function () {
                    $scope.addCompany();
                }
            });

            $scope.customerAndLeadGetRequestCriteriaDao = {};
            $scope.customerAndLeadGetRequestCriteriaDao.sortDESCbyCreatedDate = true;
            $scope.customerAndLeadGetRequestCriteriaDao.usePagination = true;

            $scope.customerAndLeadGetRequestCriteriaDao.useRelativeCreatedDateFrom = false;
            $scope.customerAndLeadGetRequestCriteriaDao.useRelativeCreatedDateTo = false;

            $scope.pageChanged = function (newPage) {

                var fromRecord = (newPage - 1) * $scope.itemsPerPage;
                var toRecord = newPage * $scope.itemsPerPage;

                var customerBuilder = angular.copy($scope.customerAndLeadGetRequestCriteriaDao);
                customerBuilder = SystemService.buildDataObjectBuilder(customerBuilder);

                customerBuilder.recordFrom = fromRecord;
                customerBuilder.recordTo = toRecord;

                $scope.customersPromise = customObjectsService.getCustomObjectMetaByBuilder
                (customerBuilder).then(function (e) {
                    $scope.projects = e.resultedObjects;
                    $scope.allCustomersCount = e.entityNumber;
                    $scope.lastRequestCount = e.entityNumber;
                    $scope.pagesNumbers = Math.ceil($scope.allCustomersCount / $scope.itemsPerPage);
                });
            };

            $scope.pageChanged(1);

            hotkeys.add({
                combo: 'ctrl+right',
                description: '',
                callback: function () {
                    $scope.currentPage += 1;
                    if ($scope.currentPage < 1)  $scope.currentPage = 1;
                }
            });

            hotkeys.add({
                combo: 'ctrl+left',
                description: '',
                callback: function () {
                    $scope.currentPage -= 1;
                    if ($scope.currentPage < 1)  $scope.currentPage = 1;
                }
            });

        }])
;