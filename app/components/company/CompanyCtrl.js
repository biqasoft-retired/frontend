'use strict';

angular.module('app.company.all', ['ngRoute', 'LocalStorageModule'])

    .controller('CompanyAllCtrl', ['$scope', '$rootScope', '$http', 'localStorageService', 'UserService', 'configurationService', 'companyService', 'logger', '$location', 'SystemService', 'hotkeys', 'customerService',
        function ($scope, $rootScope, $http, localStorageService, UserService, configurationService, companyService, logger, $location, SystemService, hotkeys, customerService) {

            $scope.projects = [];

            $scope.itemsPerPage = 15; // this should match however many results your API puts on one page
            $scope.currentPage = 1;

            $scope.allCustomersCount = $rootScope.globalDomainStats.allCustomersCount;

            $scope.getObjectOnLoad = true;

            $scope.newCompany = {};
            $scope.showOnlyWhenIamResponsible = false;

            $scope.addCompany = function () {
                logger.logSuccess("Компания успешно добавлена!");

                companyService.addCompany($scope.newCompany).then(function (e) {
                    $location.path('/company/details/' + e.id);
                });

            };

            hotkeys.add({
                combo: 'shit+N',
                description: '',
                callback: function () {
                    $scope.addCompany();
                }
            });

            //
            $scope.managersResponsibles = [];

            $scope.customerAndLeadGetRequestCriteriaDao = {};

            $scope.customerAndLeadGetRequestCriteriaDao.showOnlyWhenIamResponsible = false;
            $scope.customerAndLeadGetRequestCriteriaDao.active = false;
            $scope.customerAndLeadGetRequestCriteriaDao.sortDESCbyCreatedDate = true;

            $scope.customerAndLeadGetRequestCriteriaDao.usePagination = true;

            $scope.customerAndLeadGetRequestCriteriaDao.useRelativeCreatedDateFrom = false;
            $scope.customerAndLeadGetRequestCriteriaDao.useRelativeCreatedDateTo = false;

            $scope.customerAndLeadGetRequestCriteriaDao.useResponsiblesManagersList = false;
            $scope.customerAndLeadGetRequestCriteriaDao.responsiblesManagersList = [];

            ////////////////////////////////////////////////////////////////////////////////////////////////

            $scope.convertCustomerBuilderToserver = function () {
                var customerBuilder = angular.copy($scope.customerAndLeadGetRequestCriteriaDao);

                customerBuilder = SystemService.buildDataObjectBuilder(customerBuilder);
                customerBuilder.responsiblesManagersList = SystemService.getListOfIDsFromArrayObjects($scope.managersResponsibles);

                return customerBuilder;
            };

            $scope.pageChanged = function (newPage, dontConvert) {

                var convertToBuilder = true;
                var customerBuilder = {};

                var fromRecord = (newPage - 1) * $scope.itemsPerPage;
                var toRecord = newPage * $scope.itemsPerPage;

                // dont't convert if this is dynamic segment
                if (dontConvert && dontConvert === true)  convertToBuilder = false;

                if (convertToBuilder) {
                    customerBuilder = $scope.convertCustomerBuilderToserver();
                } else {
                    customerBuilder = $scope.customerAndLeadGetRequestCriteriaDao;
                }

                customerBuilder.recordFrom = fromRecord;
                customerBuilder.recordTo = toRecord;

                $scope.customersPromise = customerService.getAllCompanyByBuilder
                (customerBuilder).then(function (e) {
                    $scope.projects = e.resultedObjects;
                    $scope.allCustomersCount = e.entityNumber;
                    $scope.lastRequestCount = e.entityNumber;
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

            //
            $scope.onShowOnlyLeadChange = function () {
                $scope.customerAndLeadGetRequestCriteriaDao.customer = false;
                if ($scope.customerAndLeadGetRequestCriteriaDao.lead) {
                    $scope.pageChanged($scope.currentPage);
                    return;
                }
            };

            $scope.onShowOnlyCustomerChange = function () {
                $scope.customerAndLeadGetRequestCriteriaDao.lead = false;
                if ($scope.customerAndLeadGetRequestCriteriaDao.customer) {
                    $scope.pageChanged($scope.currentPage);
                    return;
                }
            };

            $scope.changedUseRelativeCreatedDateFrom = function () {

                if ($scope.customerAndLeadGetRequestCriteriaDao.useRelativeCreatedDateFrom) {
                    $scope.customerAndLeadGetRequestCriteriaDao.useCreatedDateFrom = false;
                    return;
                }

                // disabled filter
                if (!$scope.customerAndLeadGetRequestCriteriaDao.useRelativeCreatedDateFrom) {
                    $scope.customerAndLeadGetRequestCriteriaDao.relativeCreatedDateFrom = "";
                    $scope.pageChanged(1);
                    return;
                }
            };

            $scope.changedUseRelativeCreatedDateTo = function () {

                if ($scope.customerAndLeadGetRequestCriteriaDao.useRelativeCreatedDateTo) {
                    $scope.customerAndLeadGetRequestCriteriaDao.useCreatedDateTo = false;
                    return;
                }

                // disabled filter
                if (!$scope.customerAndLeadGetRequestCriteriaDao.useRelativeCreatedDateTo) {
                    $scope.customerAndLeadGetRequestCriteriaDao.relativeCreatedDateTo = "";
                    $scope.pageChanged(1);
                }
            };

            $scope.changedUseCreatedDateFrom = function () {
                if ($scope.customerAndLeadGetRequestCriteriaDao.useCreatedDateFrom) {
                    $scope.customerAndLeadGetRequestCriteriaDao.useRelativeCreatedDateFrom = false;

                }
            };

            $scope.changedUseCreatedDateTo = function () {
                if ($scope.customerAndLeadGetRequestCriteriaDao.useCreatedDateTo) {
                    $scope.customerAndLeadGetRequestCriteriaDao.useRelativeCreatedDateTo = false;

                }
            };

        }])

    .controller('CompanyDetailsCtrl', ['$scope', '$rootScope', '$route', 'logger', 'companyService', 'SystemService', 'UserService',
        function ($scope, $rootScope, $route, logger, companyService, SystemService, UserService) {

            $scope.currentCompanyId = $route.current.params.id;
            $scope.currentCompanyPromise = companyService.getCompanyById($scope.currentCompanyId);

            $scope.currentCompanyPromise.then(function (e) {
                $scope.currentCompany = e;

                if ($rootScope.resolveUser($scope.currentCompany.responsibleManagerID)) {
                    $scope.responsibleManager = $rootScope.resolveUser($scope.currentCompany.responsibleManagerID);
                } else {
                    UserService.getAccountById($scope.currentCompany.responsibleManagerID).then(function (ef) {
                        $scope.responsibleManager = ef;
                    });

                    $rootScope.title = e.name;
                }
            });

            $scope.updateCompany = function (e) {
                if ($scope.responsibleManager) {
                    $scope.currentCompany.responsibleManagerID = $scope.responsibleManager.id;
                }

                companyService.updateCompany($scope.currentCompany);
                logger.logSuccess("Данные о компании успешно обновлены!");
            };

            $scope.definerUnsafe = function (param) {
                var beforeTimes = 1;
                if (param && param.beforeTimes) beforeTimes = param.beforeTimes;
                return $rootScope.defineUnsavedData($scope, 'currentCompany', {
                    autoSaveFunction: $scope.updateCompany,
                    timesBefore: beforeTimes
                });
            };

            $scope.unSavedObject = $scope.definerUnsafe();

        }]);