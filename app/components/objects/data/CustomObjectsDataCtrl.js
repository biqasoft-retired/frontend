'use strict';

angular.module('app.custom.objects.data', ['ngRoute', 'LocalStorageModule'])
    .controller('CustomObjectsDataAllCtrl', ['$scope', '$rootScope',
        'companyService', 'logger', '$location', 'SystemService', 'hotkeys', 'customObjectsDataService', '$route', 'customObjectsService', '$filter', '$mdDialog',
        function ($scope, $rootScope, companyService, logger, $location, SystemService, hotkeys, customObjectsDataService, $route, customObjectsService, $filter, $mdDialog) {
            var self = this;

            $scope.collectionId = $route.current.params.id;

            $scope.projects = [];

            $scope.itemsPerPage = 15; // this should match however many results your API puts on one page
            $scope.currentPage = 1;
            $scope.pagesNumbers = 1;

            $scope.alltDynamicSegments = [];

            $scope.filterPanelShow = false;

            $scope.allCustomersCount = $rootScope.globalDomainStats.allCustomersCount;

            $scope.customObjectMeta = {};

            $scope.newCompany = {};
            $scope.newCompany.collectionId = $scope.collectionId;
            $scope.showOnlyWhenIamResponsible = false;

            $scope.addCompany = function () {
                logger.logSuccess("Объект успешно добавлена!");

                customObjectsDataService.addCustomObjectData($scope.newCompany).then(function (e) {
                    $location.path('/objects/custom/data/object/details/id/' + e.id + '/collectionId/' + e.collectionId);
                });
            };

            hotkeys.add({
                combo: 'shit+N',
                description: '',
                callback: function () {
                    $scope.addCompany();
                }
            });

            ////////////////////////////////////////////////////////////////
            $scope.customerAndLeadGetRequestCriteriaDao = {};
            $scope.customerAndLeadGetRequestCriteriaDao.sortDESCbyCreatedDate = true;
            $scope.customerAndLeadGetRequestCriteriaDao.usePagination = true;

            $scope.customerAndLeadGetRequestCriteriaDao.useRelativeCreatedDateFrom = false;
            $scope.customerAndLeadGetRequestCriteriaDao.useRelativeCreatedDateTo = false;

            $scope.customerAndLeadGetRequestCriteriaDao.collectionId = $scope.collectionId;

            ////////////////////////////////////////////////////////////////

            customObjectsDataService.getAllSegment().then(function (data) {
                $scope.alltDynamicSegments = data;
            });

            $scope.pageChanged = function (newPage) {

                var fromRecord = (newPage - 1) * $scope.itemsPerPage;
                var toRecord = newPage * $scope.itemsPerPage;

                var customerBuilder = angular.copy($scope.customerAndLeadGetRequestCriteriaDao);
                customerBuilder = SystemService.buildDataObjectBuilder(customerBuilder);

                customerBuilder.recordFrom = fromRecord;
                customerBuilder.recordTo = toRecord;

                $scope.customersPromise = customObjectsDataService.getCustomObjectDataByBuilder
                (customerBuilder).then(function (e) {
                    $scope.projects = e.resultedObjects;
                    $scope.allCustomersCount = e.entityNumber;
                    $scope.lastRequestCount = e.entityNumber;
                    $scope.pagesNumbers = Math.ceil($scope.allCustomersCount / $scope.itemsPerPage);
                });
            };

            $scope.pageChanged(1);

            customObjectsService.getCustomObjectsMetaById($scope.collectionId).then(function (data2) {
                $scope.customObjectMeta = data2;
                $rootScope.title = data2.name;
            });

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

            $scope.downloadFileExcel = function () {
                var objectSend = angular.copy($scope.customerAndLeadGetRequestCriteriaDao);
                objectSend = SystemService.buildDataObjectBuilder(objectSend);

                objectSend.usePagination = false;
                logger.logSuccess("Файл скоро будет загружен. Это может занять несколько минут.");

                customObjectsDataService.getExcelByFilter(objectSend).then(function (data) {
                    var today = $rootScope.printDate(new Date());
                    $rootScope.downloadFile({
                        file: data, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        filename: $scope.customObjectMeta.name + ' от ' + today + ' объекты biqa' + '.xlsx'
                    })
                })
            };

            // add dynamic segment
            $scope.addDynamicSegment = function () {
                $scope.newDynamicSegment.customObjectsDataBuilder = angular.copy($scope.customerAndLeadGetRequestCriteriaDao);
                $scope.newDynamicSegment.usePagination = false;

                customObjectsDataService.addSegment($scope.newDynamicSegment).then(function (data) {
                    logger.logSuccess("Сегмент добавлен!");
                    $mdDialog.hide();
                    $scope.alltDynamicSegments.push(data);
                })
            };

            $scope.saveAsDynamicSegment = function (ev) {
                // new dynamic segment object from builder
                $scope.newDynamicSegment = {};
                $scope.newDynamicSegment.name = "Новый динамический сегмент";
                $scope.newDynamicSegment.customerBuilder = {};

                $mdDialog.show({
                    scope: $scope,
                    preserveScope: true,
                    templateUrl: 'templates/modal/add_custom_object_dynamic_segment.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true
                })
                    .then(function (answer) {
                        console.log("qqq");
                    }, function () {
                        $scope.status = 'You cancelled the dialog.';
                    });
            };

            // flag to not add additional watcher
            self.wahchedDynamicSegmentChanges = false;

            $scope.getByDynamicSegment = function (data) {
                $scope.activeDynamicSegmentID = data.id;
                $scope.currentDynamicSegment = data;

                $scope.customerAndLeadGetRequestCriteriaDao = data.customObjectsDataBuilder;
                $scope.editedTimes = 0;
                $scope.currentDynamicSegmentObjectEdited = false;

                if (!self.wahchedDynamicSegmentChanges) {
                    (function () {
                        var i = $scope.editedTimes;
                        $scope.$watch('customerAndLeadGetRequestCriteriaDao', function (data) {
                            if (i > 0) {
                                $scope.currentDynamicSegmentObjectEdited = true;
                            }

                            console.log(i);
                            i += 1;
                        }, true);
                    })();
                    self.wahchedDynamicSegmentChanges = true;
                }

                $scope.pageChanged(1, true);

            };

            $scope.saveUpdateDynamicSegment = function () {
                customObjectsDataService.updateSegment($scope.currentDynamicSegment);
                logger.logSuccess("Сегмент: " + $scope.currentDynamicSegment.name + " обновлен!");
                $scope.currentDynamicSegmentObjectEdited = false;
            };

        }

    ]);