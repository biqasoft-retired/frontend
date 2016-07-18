'use strict';

angular.module('app.costs', ['ngRoute', 'LocalStorageModule'])
    .controller('CompanyCostAllCtrl', ['$scope', '$rootScope', 'LeadGenService', 'PaymentsService', 'SystemService',
        function($scope, $rootScope, LeadGenService, PaymentsService, SystemService) {

            $scope.filterPanelShow = false;

            $scope.projects = [];
            $scope.allLeadGenProjects = [];

            $scope.itemsPerPage = 25; // this should match however many results your API puts on one page
            $scope.currentPage = 1;
            $scope.lastRequestCount = 0;

            $scope.allCustomersCount = $rootScope.globalDomainStats.allCostsCount;

            $scope.customerAndLeadGetRequestCriteriaDao = {};

            $scope.customerAndLeadGetRequestCriteriaDao.sortDESCbyCreatedDate = true;
            $scope.customerAndLeadGetRequestCriteriaDao.sortByAmount = false;

            $scope.customerAndLeadGetRequestCriteriaDao.usePagination = true;
            $scope.customerAndLeadGetRequestCriteriaDao.useRelativeCreatedDateFrom = false;
            $scope.customerAndLeadGetRequestCriteriaDao.useRelativeCreatedDateTo = false;

            $scope.customerAndLeadGetRequestCriteriaDao.useAmountMoreThan = false;

            $scope.customerAndLeadGetRequestCriteriaDao.leadGenMethodId = "ANY";
            $scope.customerAndLeadGetRequestCriteriaDao.leadGenProjectId = "ANY";
            $scope.customerAndLeadGetRequestCriteriaDao.customerIDs = [];

            $scope.allLeadGenMethodsArray = LeadGenService.getAllLeadGenMethods().then(function(data) {
                $scope.allLeadGenMethodsArray = data;
            });

            LeadGenService.getAllLeadGenProjects().then(function(e) {
                $scope.allLeadGenProjects = e;
            });

            $scope.pageChanged = function(newPage) {

                var fromRecord = (newPage - 1) * $scope.itemsPerPage;
                var toRecord = newPage * $scope.itemsPerPage;

                var customerBuilder = angular.copy($scope.customerAndLeadGetRequestCriteriaDao);
                customerBuilder = SystemService.buildDataObjectBuilder(customerBuilder);

                customerBuilder.recordFrom = fromRecord;
                customerBuilder.recordTo = toRecord;

                if ($scope.customerAndLeadGetRequestCriteriaDao.fullTextSearchRequest && $scope.customerAndLeadGetRequestCriteriaDao.fullTextSearchRequest.length > 0) {
                    customerBuilder.useFullTextSearch = true;
                }else {
                    customerBuilder.useFullTextSearch = false;
                }

                $scope.customersPromise = PaymentsService.getCostsByBuilder
                (customerBuilder).then(function(e) {
                    $scope.projects = e.resultedObjects;
                    $scope.allCustomersCount = e.entityNumber;
                    $scope.lastRequestCount = e.entityNumber;
                });
            };

            $scope.pageChanged(1);

            $scope.sortFilterChanged = function(fieldChangedName) {
                if ($scope.customerAndLeadGetRequestCriteriaDao.sortDESCbyCreatedDate && fieldChangedName ===  "sortDESCbyCreatedDate") {
                    $scope.customerAndLeadGetRequestCriteriaDao.sortByAmount = false;
                }

                if ($scope.customerAndLeadGetRequestCriteriaDao.sortByAmount && fieldChangedName ===  "sortByAmount") {
                    $scope.customerAndLeadGetRequestCriteriaDao.sortDESCbyCreatedDate = false;
                }

                $scope.pageChanged(1);
            }

        }])
