'use strict';

angular.module('app.customer.new', ['ngRoute', 'LocalStorageModule'])
    .controller('CustomerAllCtrl', ['$scope', '$rootScope', 'LeadGenService', 'customerService', 'SystemService', '$location', 'logger', '$mdDialog', 'hotkeys',
        function ($scope, $rootScope, LeadGenService, customerService, SystemService, $location, logger, $mdDialog, hotkeys) {

            var self = this;

            // show builder settings panel
            $scope.filterPanelShow = false;
            self.getObjectOnLoad = true;

            // all customers with data
            $scope.projects = [];

            // all dynamic segments
            $scope.alltDynamicSegments = [];
            $scope.activeDynamicSegmentID = null;

            // this should match however many results your API puts on one page
            $scope.itemsPerPage = 15;

            // current page on pagination
            $scope.currentPage = 1;
            $scope.pagesNumbers = 1;
            $scope.lastRequestCount = 0;

            $scope.allCustomersCount = $rootScope.globalDomainStats.allCustomersCount;

            $scope.allSegments = [];
            $scope.salesFunnelStatusesForCurrentMethod = [];
            $scope.staticSegmentsIDs = [];
            $scope.allLeadGenMethodsArray = [];
            $scope.allLeadGenProjects = [];
            $scope.customerAndLeadGetRequestCriteriaDao = {};

            // here is temp result for percent of
            // current sales funnel status to all
            // sales funnel statuses for lead/customer
            self.tempDataPercents = [];

            // builder object
            if ($location.path() === "/customer/all")   $scope.customerAndLeadGetRequestCriteriaDao.customer = true;
            if ($location.path() === "/lead/all")   $scope.customerAndLeadGetRequestCriteriaDao.lead = true;

            $scope.customerAndLeadGetRequestCriteriaDao.showOnlyWhenIamResponsible = true;
            $scope.customerAndLeadGetRequestCriteriaDao.active = true;
            $scope.customerAndLeadGetRequestCriteriaDao.sortDESCbyCreatedDate = true;
            $scope.customerAndLeadGetRequestCriteriaDao.leadGenMethodId = "ANY";
            $scope.customerAndLeadGetRequestCriteriaDao.leadGenProjectId = "ANY";
            $scope.customerAndLeadGetRequestCriteriaDao.salesFunnelStatusID = "ANY";
            $scope.customerAndLeadGetRequestCriteriaDao.usePagination = true;

            $scope.customerAndLeadGetRequestCriteriaDao.useRelativeCreatedDateFrom = false;
            $scope.customerAndLeadGetRequestCriteriaDao.useRelativeCreatedDateTo = false;

            $scope.customerAndLeadGetRequestCriteriaDao.useResponsiblesManagersList = false;
            $scope.customerAndLeadGetRequestCriteriaDao.responsiblesManagersList = [];

            $scope.currentDynamicSegmentObjectEdited = false;

            // called when we click on customer line ( <tr> )
            $scope.clickedCustomerLine = function (customer) {

                if ($rootScope.personalSettings.openEmbeddedCustomer) {

                    // $rootScope.customerSelected - ID of customer which is
                    // embedded to page `/customer/all`
                    $rootScope.customerSelected = customer.id;
                    $rootScope.$broadcast('redrawCustomerDetails');
                } else {
                    $location.path('/customer/details/' + customer.id);
                }
            };

            LeadGenService.getAllLeadGenMethods().then(function (data) {
                $scope.allLeadGenMethodsArray = data;
            });

            $scope.loadLeadGenProjects = function () {
                if ($scope.allLeadGenProjects.length > 0) return;
                LeadGenService.getAllLeadGenProjects().then(function (e) {
                    $scope.allLeadGenProjects = e;
                });
            };

            $scope.loadStaticSegments = function () {
                if ($scope.allSegments.length > 0) return;
                customerService.getAllStaticSegments().then(function (data) {
                    $scope.allSegments = data;
                    if ($location.search().staticSegmentsIDs) {
                        self.getObjectOnLoad = false;
                        var a = JSON.parse($location.search().staticSegmentsIDs);
                        for (var obj in a) {
                            console.log(obj);
                            $scope.staticSegmentsIDs.push(SystemService.universalResolver($scope.allSegments, a[obj]));
                        }

                        $scope.pageChanged(1);
                    }
                });
            };

            // if in address bar we have static segment filter
            if ($location.search().staticSegmentsIDs) {
                $scope.customerAndLeadGetRequestCriteriaDao.customer = false;
                $scope.customerAndLeadGetRequestCriteriaDao.lead = false;
                $scope.customerAndLeadGetRequestCriteriaDao.showOnlyWhenIamResponsible = false;
                $scope.customerAndLeadGetRequestCriteriaDao.useStaticSegments = true;
                $scope.customerAndLeadGetRequestCriteriaDao.active = false;
            }

            $scope.updateSalesFunnelStatusesForCurrentMethod = function () {
                console.log(1);
                var returnArray = [];
                if ($scope.customerAndLeadGetRequestCriteriaDao.leadGenMethodId === "ANY") return;
                if (!$scope.customerAndLeadGetRequestCriteriaDao.customer && !$scope.customerAndLeadGetRequestCriteriaDao.lead) return;

                var salesFunnel = SystemService.universalResolver($scope.allLeadGenMethodsArray, $scope.customerAndLeadGetRequestCriteriaDao.leadGenMethodId);

                if ($scope.customerAndLeadGetRequestCriteriaDao.lead) {
                    returnArray = salesFunnel.leadConversionSalesFunnel.salesFunnelStatuses;
                }

                if ($scope.customerAndLeadGetRequestCriteriaDao.customer) {
                    returnArray = salesFunnel.accountManagementSalesFunnel.salesFunnelStatuses;
                }

                $scope.salesFunnelStatusesForCurrentMethod = returnArray;
            };

            self.convertCustomerBuilderToserver = function () {
                var customerBuilder = angular.copy($scope.customerAndLeadGetRequestCriteriaDao);
                customerBuilder = SystemService.buildDataObjectBuilder(customerBuilder);

                if ($scope.customerAndLeadGetRequestCriteriaDao.useResponsiblesManagersList &&
                    $scope.customerAndLeadGetRequestCriteriaDao.responsiblesManagersList &&
                    $scope.customerAndLeadGetRequestCriteriaDao.responsiblesManagersList.length > 0) {
                    $scope.customerAndLeadGetRequestCriteriaDao.showOnlyWhenIamResponsible = false;
                    customerBuilder.showOnlyWhenIamResponsible = false;
                }

                if ($scope.staticSegmentsIDs && $scope.staticSegmentsIDs.length > 0)
                    customerBuilder.staticSegmentsIDs = SystemService.getListOfIDsFromArrayObjects($scope.staticSegmentsIDs);

                return customerBuilder;
            };

            $scope.pageChanged = function (newPage) {

                var fromRecord = (newPage - 1) * $scope.itemsPerPage;
                var toRecord = newPage * $scope.itemsPerPage;

                var customerBuilder = self.convertCustomerBuilderToserver();

                customerBuilder.usePagination = true;
                customerBuilder.recordFrom = fromRecord;
                customerBuilder.recordTo = toRecord;

                $scope.customersPromise = customerService.getAllCustomerByBuilder(customerBuilder).then(function (e) {
                    $scope.projects = e.resultedObjects;
                    $scope.allCustomersCount = e.entityNumber;
                    $scope.lastRequestCount = e.entityNumber;

                    $scope.pagesNumbers = Math.ceil($scope.allCustomersCount / $scope.itemsPerPage);
                });
            };

            $scope.editedTimes = 0;

            // flag to not add additional watcher
            self.wahchedDynamicSegmentChanges = false;

            $scope.getByDynamicSegment = function (data) {
                $scope.activeDynamicSegmentID = data.id;
                $scope.currentDynamicSegment = data;

                $scope.customerAndLeadGetRequestCriteriaDao = data.customerBuilder;
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

                if (data.customerBuilder.staticSegmentsIDs && data.customerBuilder.staticSegmentsIDs.length > 0) {
                    customerService.getAllStaticSegments().then(function (dataSeg) {
                        $scope.allSegments = dataSeg;

                        for (var i = 0; i < data.customerBuilder.staticSegmentsIDs.length; i++) {
                            $scope.staticSegmentsIDs.push(SystemService.universalResolver($rootScope.allSegments, data.customerBuilder.staticSegmentsIDs[i]));
                        }
                    })
                }
            };

            $scope.saveUpdateDynamicSegment = function () {
                customerService.updateDynamicSegment($scope.currentDynamicSegment);
                logger.logSuccess("Сегмент: " + $scope.currentDynamicSegment.name + " обновлен!");
                $scope.currentDynamicSegmentObjectEdited = false;
            };

            // we want to show customers
            // by some dynamicSegment
            // (which have customer builder)
            if ($location.search().dynamicSegmentsIDs) {
                self.getObjectOnLoad = false;

                var a = JSON.parse($location.search().dynamicSegmentsIDs);
                console.log(a);
                var segment = a[0];

                customerService.getDynamicSegmentById(segment).then(function (data) {
                    $scope.getByDynamicSegment(data);

                    customerService.getAllDynamicSegments().then(function (data2) {
                        $scope.alltDynamicSegments = data2;
                    })

                });
            }

            // firstly load
            if (self.getObjectOnLoad) {
                $scope.pageChanged(1);

                customerService.getAllDynamicSegments().then(function (data) {
                    $scope.alltDynamicSegments = data;
                })
            }

            // bind hotkeys to change page
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

            $scope.downloadFileExcel = function () {
                var objectSend = self.convertCustomerBuilderToserver();
                objectSend.usePagination = false;
                logger.logSuccess("Файл скоро будет загружен. Это может занять несколько минут.");

                customerService.getExcelByFilter(objectSend).then(function (data) {
                    $rootScope.downloadFile({
                        file: data, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        filename: 'CRM клиенты от ' + $rootScope.printDate(new Date()) + '.xlsx'
                    })
                })
            };

            $scope.getCustomerPercentStatusByStatusId = function (statusId, leadgenMEthodId) {
                if (typeof self.tempDataPercents[statusId + leadgenMEthodId] != 'undefined') return self.tempDataPercents[statusId + leadgenMEthodId];
                var currentLeadGenMethodObject = $scope.getLeadGenMethodId(leadgenMEthodId);
                if (isUndefinedOrNull(currentLeadGenMethodObject))return;
                if (typeof currentLeadGenMethodObject.accountManagementSalesFunnel === "undefined") return;

                var defaultSalesFunnel = [0, 0];
                var i = 0;

                // it should not be in normal situation
                if (!currentLeadGenMethodObject.accountManagementSalesFunnel || !currentLeadGenMethodObject.leadConversionSalesFunnel) {
                    //console.log("Sales funnel has not statuses" , statusId , currentLeadGenMethodObject);
                    return defaultSalesFunnel;
                }

                for (i = 0; i < currentLeadGenMethodObject.accountManagementSalesFunnel.salesFunnelStatuses.length; i++) {
                    if (currentLeadGenMethodObject.accountManagementSalesFunnel.salesFunnelStatuses[i].id === statusId) {
                        self.tempDataPercents[statusId + leadgenMEthodId] = [i, currentLeadGenMethodObject.accountManagementSalesFunnel.salesFunnelStatuses.length, currentLeadGenMethodObject.accountManagementSalesFunnel.salesFunnelStatuses[i].color];
                        return self.tempDataPercents[statusId + leadgenMEthodId];
                    }
                }

                for (i = 0; i < currentLeadGenMethodObject.leadConversionSalesFunnel.salesFunnelStatuses.length; i++) {
                    if (currentLeadGenMethodObject.leadConversionSalesFunnel.salesFunnelStatuses[i].id === statusId) {
                        self.tempDataPercents[statusId + leadgenMEthodId] = [i, currentLeadGenMethodObject.leadConversionSalesFunnel.salesFunnelStatuses.length, currentLeadGenMethodObject.leadConversionSalesFunnel.salesFunnelStatuses[i].color];
                        return self.tempDataPercents[statusId + leadgenMEthodId];
                    }
                }

                // it should not be in normal situation
                return defaultSalesFunnel;
            };

            $scope.getPercentFromArrayStatus = function (arr) {
                if (typeof arr != "object")return 0;
                if (arr[0] + 1 === arr[1]) {
                    arr[0]++;
                }

                return (arr[0] / arr[1]);
            };

            $scope.getLeadGenMethodId = function (id) {
                for (var i = 0; i < $scope.allLeadGenMethodsArray.length; i++) {
                    if ($scope.allLeadGenMethodsArray[i].id === id) return $scope.allLeadGenMethodsArray[i];
                }
            };

            // add dynamic segment
            $scope.addDynamicSegment = function () {
                $scope.newDynamicSegment.customerBuilder = self.convertCustomerBuilderToserver();

                customerService.addDynamicSegment($scope.newDynamicSegment).then(function (data) {
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
                    templateUrl: 'templates/modal/add_dynamic_segment.html',
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

        }]);

