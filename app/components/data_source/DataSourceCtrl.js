'use strict';

angular.module('app.datasource', ['ngRoute', 'LocalStorageModule'])

    .controller('DataSourceCtrl', ['$scope', '$rootScope', 'SalesFunnelService', 'logger', '$mdDialog', 'SystemService', '$translate',
        function($scope, $rootScope, SalesFunnelService, logger, $mdDialog, SystemService, $translate) {

            $scope.projects = [];

            $scope.itemsPerPage = 15; // this should match however many results your API puts on one page
            $scope.currentPage = 1;
            $scope.pagesNumbers = 1;

            $scope.filterPanelShow = false;

            $scope.viewTypes = [
                {name: $translate.instant('APP.VIEW_TYPES.CARDS'), value: 'cards'},
                {name: $translate.instant('APP.VIEW_TYPES.TABLE'), value: 'table'}
            ];

            $scope.allLights = [
                {name: "Успешно - SUCCESS", value: 'SUCCESS'},
                {name: "Аномалии - WARNING", value: 'WARNING'},
                {name: "Исправлять - ERROR", value: 'ERROR'}
            ];

            $scope.viewType = $scope.viewTypes[0];

            $scope.arrayOfDataSourcesValues = [];

            $scope.newDataSource = {};
            $scope.newDataSource.parameters = [];

            $scope.simpleMode = false;

            $scope.newParametre = {};
            $scope.newParametre.name = "";
            $scope.newParametre.value = "";

            $scope.editMode = true;

            $scope.allDataSourceControllers = SalesFunnelService.getAllDataSourceControllers;
            $scope.getAllDataSourceReturnTypes = SystemService.customFieldTypes;

            $scope.customerAndLeadGetRequestCriteriaDao = {};
            $scope.customerAndLeadGetRequestCriteriaDao.sortDESCbyCreatedDate = true;
            $scope.customerAndLeadGetRequestCriteriaDao.usePagination = true;

            $scope.customerAndLeadGetRequestCriteriaDao.useRelativeCreatedDateFrom = false;
            $scope.customerAndLeadGetRequestCriteriaDao.useRelativeCreatedDateTo = false;

            $scope.addParameterToParametres = function() {
                $scope.newDataSource.parameters.push($scope.newParametre);
                $scope.newParametre = {};
                $scope.newParametre.name = "";
                $scope.newParametre.value = "";
            };

            $scope.deleteParamByIndex = function(index) {
                $scope.newDataSource.parameters.splice(index, 1);
            };

            $scope.addDataSource = function() {
                SalesFunnelService.addDataSource($scope.newDataSource).then(function (data) {
                    $scope.pageChanged(1);
                });
                $scope.newDataSource = {};
                $scope.newDataSource.parameters = [];
                logger.logSuccess("Добавлен источник данных");
            };

            $scope.showSystemIssuedBool = true;
            $scope.showCustomUserCreatedBool = true;

            $scope.showSystemIssued = function(dataSource) {
                if (!dataSource.systemIssued)return true;
                if (dataSource.systemIssued && $scope.showSystemIssuedBool) return true
            };

            $scope.showCustomUserCreated = function(dataSource) {
                if (dataSource.systemIssued)return true;
                if (!dataSource.systemIssued && $scope.showCustomUserCreatedBool) return true
            };

            $scope.pageChanged = function(newPage) {

                var fromRecord = (newPage - 1) * $scope.itemsPerPage;
                var toRecord = newPage * $scope.itemsPerPage;

                var customerBuilder = angular.copy($scope.customerAndLeadGetRequestCriteriaDao);

                if (!customerBuilder.usePagination){
                    $scope.itemsPerPage = GLOBAL_CONSTANTS.MAX_INTEGER_TO_SERVER;
                }

                customerBuilder = SystemService.buildDataObjectBuilder(customerBuilder);
                customerBuilder.recordFrom = fromRecord;
                customerBuilder.recordTo = toRecord;

                $scope.customersPromise = SalesFunnelService.getDataSourceByBuilder
                (customerBuilder).then(function(e) {
                    $scope.projects = e.resultedObjects;
                    $scope.allCustomersCount = e.entityNumber;
                    $scope.lastRequestCount = e.entityNumber;
                    $scope.pagesNumbers = Math.ceil($scope.allCustomersCount / $scope.itemsPerPage);
                });
            };

            $scope.pageChanged(1);

            $scope.createNewDataSorce = function(ev) {
                $mdDialog.show({
                    scope: $scope,
                    preserveScope: true,
                    templateUrl: 'templates/data_source/data_source_new.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose:true
                })
                .then(function(answer) {
                }, function() {
                    $scope.status = 'You cancelled the dialog.';
                });
            };

            $scope.getHelpsModel = function(ev) {
                $mdDialog.show({
                        scope: $scope,
                        preserveScope: true,
                        templateUrl: 'app/components/data_source/modal/data_source_help.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose:true
                    })
                    .then(function(answer) {
                        console.log("qqq");
                    }, function() {
                        $scope.status = 'You cancelled the dialog.';
                    });
            };

            $scope.downloadFileExcel = function() {
                var objectSend = angular.copy($scope.customerAndLeadGetRequestCriteriaDao);
                objectSend.usePagination = false;
                logger.logSuccess("Файл скоро будет загружен. Это может занять несколько минут.");

                SalesFunnelService.getExcelByFilter(objectSend).then(function(data) {
                    var myDate = $rootScope.printDate(new Date());
                    $rootScope.downloadFile({
                        file: data, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        filename: 'CRM KPIs от ' + myDate + '.xlsx'
                    })
                })
            };

        }])

    .controller('DataSourceDetailsCtrl', ['$scope', '$rootScope', '$route', 'SalesFunnelService', 'logger', '$mdDialog', 'SweetAlert', '$location', 'SystemService',
        function($scope, $rootScope, $route, SalesFunnelService, logger, $mdDialog, SweetAlert, $location, SystemService) {

            $scope.currentDataSourceId = $route.current.params.id;
            $scope.currentDataSource = {};

            $scope.newParametre = {};
            $scope.newParametre.name = "";
            $scope.newParametre.value = "";

            SalesFunnelService.getDataSourceById($scope.currentDataSourceId).then(function(e) {
                $scope.currentDataSource = e;
                $rootScope.title = e.name;

                if (e.returnType === 'INTEGER') {
                    $scope.getHistoryData();
                }
            });

            $scope.allDataSourceControllers = SalesFunnelService.getAllDataSourceControllers;
            $scope.getAllDataSourceReturnTypes = SystemService.customFieldTypes;

            $scope.kpisBuilder = {};
            $scope.kpisBuilder.startDate = null;
            $scope.kpisBuilder.finalDate = null;
            $scope.kpisBuilder.dataSourceId = $scope.currentDataSourceId;

            $scope.getHistoryData = function() {
                SalesFunnelService.getDataSourceIntegerIndicators ($scope.kpisBuilder).then(function(data) {
                    $scope.printData("dataSourceHistory", data.values);
                })
            };

            $scope.printData = function(target, data, params) {
                params = params || {};

                data = data.map(function(a) {
                    a.date = new Date(a.date);
                    return a;
                });

                var obj = {
                    //title: "Changing Precision 1",
                    description: "" + target,
                    data: data,
                    x_accessor: 'date',  // the key that accesses the x value
                    y_accessor: 'value', // the key that accesses the y value
                    decimals: 3,

                    width: 600,
                    height: 200,

                    //right: 40,
                    xax_count: 4,
                    target: '#' + target
                };

                if (params.format) obj.formar = params.format;
                MG.data_graphic(obj);
            };

            $scope.deleteParamByIndex = function(index) {
                $scope.currentDataSource.parameters.splice(index, 1);
            };

            $scope.deleteDataSourceToServer = function() {
                SalesFunnelService.deleteDataSource($scope.currentDataSource.id).then(function(e) {
                    logger.logSuccess("Удален!");
                    $location.path('/data_source/all');
                })
            };

            $scope.deleteDataSource = function() {
                SweetAlert.swal({
                        title: "Вы действительно хотите удалить",
                        text: " " + $scope.currentDataSource.name,
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Да",
                        cancelButtonText: "Отмена",
                        closeOnConfirm: true,
                        closeOnCancel: true
                    },
                    function(isConfirm) {
                        if (isConfirm) {
                            $scope.deleteDataSourceToServer();
                        } else {
                            SweetAlert.swal("Отмена", "error");
                        }
                    }

                )
            };

            $scope.updateDataSource = function() {
                SalesFunnelService.updateDataSource($scope.currentDataSource).then(function(e) {
                    logger.logSuccess("Обновлен");
                })
            };

            $scope.addParameterToParametres = function() {
                $scope.currentDataSource.parameters.push($scope.newParametre);
                $scope.newParametre = {};
                $scope.newParametre.name = "";
                $scope.newParametre.value = "";
            };

            $scope.addTag = function() {
                $scope.currentDataSource.tags.push($scope.newTag);
                $scope.newTag = "";
            };

            $scope.deleteTagIndex = function(index) {
                $scope.currentDataSource.tags.splice(index, 1);
            };

            $scope.addDataSource = function() {
                SalesFunnelService.addDataSource($scope.newDataSource);
                $scope.newDataSource = {};
                $scope.newDataSource.parameters = [];
                logger.logSuccess("Добавлен источник данных");
                $scope.getAndUpdateAllDataSources();
            };

            $scope.getHelpsModel = function(ev) {
                $mdDialog.show({
                    scope: $scope,
                    preserveScope: true,
                    templateUrl: 'app/components/data_source/modal/data_source_help.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose:true
                })
                .then(function(answer) {
                    console.log("qqq");
                }, function() {
                    $scope.status = 'You cancelled the dialog.';
                });
            };

        }])

;
