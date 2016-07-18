'use strict';

angular.module('app.customer.details', ['ngRoute', 'LocalStorageModule'])

    .service('CustomerDetailsService', ['$rootScope', '$route', 'configurationService', '$upload', '$timeout', 'customerService', '$location', '$anchorScroll',
        'opportunityService', 'TaskService', 'logger', 'PaymentsService', 'leadRepositoryService', 'LeadGenService', 'UserService', 'companyService', 'analyticsService', 'storageService',
        'SweetAlert', 'hotkeys', '$mdDialog',
        function ($rootScope, $route, configurationService, $upload, $timeout,
                  customerService, $location, $anchorScroll,
                  opportunityService, TaskService, logger, PaymentsService, leadRepositoryService, LeadGenService,
                  UserService, companyService, analyticsService, documentsService, SweetAlert, hotkeys, $mdDialog) {

            var self = this;

            self.archiveCustomerConfirmation = function ($scope) {
                SweetAlert.swal({
                        title: "Добавить в архив?",
                        text: "По умолчанию добавление в архив означает, что клиент не будет удален и вся информация о нем сохранится. " +
                        "Клиент автоматически станет 'не активным' ",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Да",
                        cancelButtonText: "Отмена",
                        closeOnConfirm: true,
                        closeOnCancel: true
                    },
                    function (isConfirm) {
                        if (isConfirm) {
                            SweetAlert.swal("Клиент добавлен в архив");
                            $scope.detailedCustomerInfo.active = false;
                            $scope.detailedCustomerInfo.archived = true;
                        } else {
                            SweetAlert.swal("Отмена", "error");
                        }
                    }
                )
            };

            self.deArchiveCustomerConfirmation = function (checkListItem, $scope) {
                console.log(checkListItem);

                SweetAlert.swal({
                        title: "Убрать из архива?",
                        text: "Клиент из архива переместиться в активного клиента / лида ",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Да",
                        cancelButtonText: "Отмена",
                        closeOnConfirm: true,
                        closeOnCancel: true
                    },
                    function (isConfirm) {
                        if (isConfirm) {
                            SweetAlert.swal("Клиент стал активным");
                            $scope.detailedCustomerInfo.active = true;
                            $scope.detailedCustomerInfo.archived = false;
                        } else {
                            SweetAlert.swal("Отмена", "error");
                        }
                    }
                )
            };

            self.deleteExistingOpporunityConfirmation = function (index, $scope) {
                SweetAlert.swal({
                        title: "Удалить возможность?",
                        text: "Данное действие удалит объект безвозвратно!",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Да, удалить!",
                        cancelButtonText: "Отмена",
                        closeOnConfirm: true,
                        closeOnCancel: true
                    },
                    function (isConfirm) {
                        if (isConfirm) {
                            SweetAlert.swal("Удалена!", "", "success");
                            $scope.deleteExistingOpporunity(index);
                        } else {
                            SweetAlert.swal("Отмена", "error");
                        }
                    }
                )
            };

            self.deleteExistingDealConfirmation = function (index, $scope) {
                SweetAlert.swal({
                        title: "Удалить сделку?",
                        text: "Данное действие удалит объект безвозвратно!",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Да, удалить!",
                        cancelButtonText: "Отмена",
                        closeOnConfirm: true,
                        closeOnCancel: true
                    },
                    function (isConfirm) {
                        if (isConfirm) {
                            SweetAlert.swal("Удалена!", "", "success");
                            $scope.deleteExistingDeal(index);
                        } else {
                            SweetAlert.swal("Отмена", "error");
                        }
                    }
                )
            };
        }

    ])

    .controller('CustomerDetailsCtrl', ['$scope', '$rootScope', '$route', '$timeout', 'customerService', '$location', '$anchorScroll',
        'opportunityService', 'TaskService', 'logger', 'PaymentsService', 'leadRepositoryService', 'LeadGenService', 'UserService', 'companyService', 'analyticsService', 'storageService',
        'SweetAlert', 'hotkeys', '$mdDialog', 'CustomerDetailsService',
        function ($scope, $rootScope, $route, $timeout,
                  customerService, $location, $anchorScroll,
                  opportunityService, TaskService, logger, PaymentsService, leadRepositoryService, LeadGenService,
                  UserService, companyService, analyticsService, documentsService, SweetAlert, hotkeys, $mdDialog, CustomerDetailsService) {

            var self = this;

            $scope.currentCustomerId = $route.current.params.id || $rootScope.customerSelected;

            $scope.objectHistoryResultHolder = [];

            if (!$rootScope.customerSelected) {
                // scroll to top ( fixes from  customer/all page, when we change $location )
                $anchorScroll(0);
            }

            $scope.archiveCustomerConfirmation = function () {
                CustomerDetailsService.archiveCustomerConfirmation($scope);
            };
            $scope.deleteExistingDealConfirmation = function (index) {
                CustomerDetailsService.deleteExistingDealConfirmation(index, $scope);
            };
            $scope.deleteExistingOpporunityConfirmation = function (index) {
                CustomerDetailsService.deleteExistingOpporunityConfirmation(index, $scope);
            };

            $scope.deArchiveCustomerConfirmation = function (index) {
                CustomerDetailsService.deArchiveCustomerConfirmation(index, $scope);
            };

            $scope.newDocumentMetaInfo = {};
            $scope.newDocumentMetaInfo.connectedCustomerId = $scope.currentCustomerId;

            $scope.detailedCustomerInfo = {};
            $scope.allAnalyticsRecords = [];

            $scope.allLeadGenMethods = [];
            $scope.allLeadGenProjects = [];

            $scope.allConnectedTasks = [];
            $scope.existingOpporunities = [];
            $scope.existingDeals = [];
            $scope.allCompanies = [];
            $scope.allPromoCodes = [];

            $scope.allStaticSegments = [];
            $scope.allDynamicSegments = [];

            $scope.showExistingDealsHeader = false;
            $scope.showExistingOpportunitiesHeader = false;

            $scope.showOnlyActive = true;

            $scope.allStatisSegments = [];

            $scope.dynamicSegmentsForCurrentCustomer = [];

            /**
             * create new clean task
             */
            self.resolveForTask = function () {

                $scope.task = {};
                $scope.task.name = "";
                $scope.task.fullText = "";
                $scope.task.recursive = false;
                $scope.task.favourite = false;

                $scope.task.project = {};
                $scope.task.project.id = 0;

                $scope.task.startDate = new Date();
                $scope.task.finalDate = new Date();
                $scope.task.finalDate.setHours(23);
                $scope.task.finalDate.setMinutes(59);
                $scope.task.priority = 2;

                $scope.task.connectedInfo = {};
                $scope.task.connectedInfo.connectedCustomerId = $scope.currentCustomerId;
                $scope.task.responsibles = {};
                $scope.task.responsibles.userAccountsIDs = [];

                if ($scope.detailedCustomerInfo.responsibleManagerID != $rootScope.currentUser.id) {
                    $scope.task.responsibles.userAccountsIDs.push($scope.detailedCustomerInfo.responsibleManagerID);
                }

                $scope.task.responsibles.userAccountsIDs.push($rootScope.currentUser.id);

            };

            //TODO: this is dirty hack
            $scope.downloadCompanies = function () {
                // get all b2b campaigns
                companyService.getAllCompanies().then(function (data) {
                    $scope.allCompanies = data;
                });
            };

            $scope.setColor = function () {

                if (isUndefinedOrNull($rootScope.personalSettings.ui) || isUndefinedOrNull($rootScope.personalSettings.ui.dynamicColor)) {
                    return;
                }

                if ($rootScope.personalSettings.ui.dynamicColor === true) {

                    var mainColor = $scope.detailedCustomerInfo.salesFunnelStatus.color;

                    changecss(".panel-primary > .panel-heading", "background-color", mainColor);
                    changecss(".btn-primary", "background-color", mainColor);
                    changecss(".badge-info", "background-color", mainColor);
                    changecss(".header-container > .top-header .logo", "background-color", mainColor);
                    changecss(".background-input-color", "background-color", mainColor + " !important");
                }
            };

            $scope.updateAllProfile = function () {
                $scope.setColor();

                if ($scope.responsibleManager && $scope.responsibleManager.id) {
                    $scope.detailedCustomerInfo.responsibleManagerID = $scope.responsibleManager.id;
                } else {
                    logger.logWarning("Нет ответственного менеджера!");
                }

                customerService.updateCustomer($scope.detailedCustomerInfo);
                $rootScope.hasUnsavedEdits = false;
                if (!$rootScope.autoSaveObjects) {
                    logger.logSuccess("Изменения успешно сохранены!");
                }
            };

            self.definerUnsafe = function (param) {
                $scope.setColor();

                var beforeTimes = 0;
                if (param && param.beforeTimes) beforeTimes = param.beforeTimes;
                return $rootScope.defineUnsavedData($scope, 'detailedCustomerInfo', {
                    autoSaveFunction: $scope.updateAllProfile,
                    timesBefore: beforeTimes
                });
            };

            customerService.getCustomerOrLeadByIdDetails($scope.currentCustomerId).then(function (e) {
                $scope.detailedCustomerInfo = e.customer;

                if ($scope.detailedCustomerInfo.b2b && $scope.allCompanies.length === 0) {
                    $scope.downloadCompanies();
                }

                $scope.allConnectedTasks = e.tasks;
                $scope.existingOpporunities = e.opportunities;
                $scope.existingDeals = e.customerDeals;

                customerService.getAllDynamicSegments().then(function (data) {

                    if (!isUndefinedOrNull($scope.detailedCustomerInfo.dynamicSegments)) {
                        data.forEach(function (data2) {
                            $scope.detailedCustomerInfo.dynamicSegments.forEach(function (data3) {
                                if (data3 == data2.id) {
                                    $scope.dynamicSegmentsForCurrentCustomer.push(data2);
                                }
                            })

                        });
                    }
                });

                if ($scope.detailedCustomerInfo.b2b) {
                    // get all b2b campaigns
                    if ($scope.allCompanies.length === 0) {
                        $scope.downloadCompanies();
                    }
                }

                if (!$rootScope.resolveUser($scope.detailedCustomerInfo.responsibleManagerID)) {
                    UserService.getAccountById($scope.detailedCustomerInfo.responsibleManagerID).then(function (data) {
                        $scope.responsibleManager = data;
                    })

                } else {
                    $scope.responsibleManager = $rootScope.resolveUser($scope.detailedCustomerInfo.responsibleManagerID);
                }

                // change page title to current customer name
                $rootScope.title = $scope.detailedCustomerInfo.firstName + " " + $scope.detailedCustomerInfo.lastName;
                if (!$scope.detailedCustomerInfo.firstName && !$scope.detailedCustomerInfo.lastName) $rootScope.title = "Безымянный клиент";

                // get all lead gen methods and choose in customer card which is him
                leadRepositoryService.getAllLeadGenMethod().then(function (ez) {
                    $scope.allLeadGenMethods = ez;
                    for (var i = 0; i < $scope.allLeadGenMethods.length; i++) {
                        if ($scope.allLeadGenMethods[i].id === $scope.detailedCustomerInfo.leadGenMethod) {
                            $scope.bindedLEadGenMethod = $scope.allLeadGenMethods[i];

                            // get all lead gen methods
                            LeadGenService.getAllLeadGenProjects().then(function (eff) {
                                $scope.allLeadGenProjects = eff;
                                self.updateLeadGenProjectsForCurrentMethod();

                                for (var j = 0; j < $scope.allLeadGenProjects.length; j++) {
                                    if ($scope.allLeadGenProjects[j].id === $scope.detailedCustomerInfo.leadGenProject) {
                                        $scope.bindedLEadGenProject = $scope.allLeadGenProjects[j];
                                        return;
                                    }
                                }
                            });

                            break;
                        }
                    }
                });

                self.resolveForTask();

                // watch current object for changes and show pop-up about unsaved data
                $scope.unSavedObject = self.definerUnsafe();
            });

            // get all static segments list
            customerService.getAllStaticSegments().then(function (data) {
                $scope.allStaticSegments = data;
            });

            // new opportunity object
            $scope.newOpportunity = {};
            $scope.newDeal = {};
            $scope.newOpportunity.priority = 2;
            $scope.allNewDeals = [];
            $scope.allNewOpportunities = [];
            $scope.bindedLEadGenMethod = null;
            $scope.currentPromoCode = "";

            $scope.newCompanyModer = {};

            $scope.newAdditionalEmail = "@";

            $scope.editMode = false;
            $scope.leadGenProjectByPromo = null;
            $scope.leadGenProjectsForCurrentMethod = [];

            $scope.priorities = [
                {value: 1, text: '1'},
                {value: 2, text: '2'},
                {value: 3, text: '3'},
                {value: 4, text: '4'},
                {value: 5, text: '5'},
                {value: 6, text: '6'}
            ];

            $scope.opportunityStatus = [
                {value: true, text: 'Активна'},
                {value: false, text: 'Неактивна'}
            ];

            self.leadGenMethodChanedTimes = 0;

            // called on promo code change
            // when typing
            $scope.findLeadGenProjectAndMethodByPromoCode = function () {
                LeadGenService.getLeadGenProjectByPromoCodeId($scope.currentPromoCode).then(function (f) {
                    $scope.detailedCustomerInfo.leadGenProject = f.id;
                    $scope.bindedLEadGenProject = f;
                    $scope.leadGenProjectByPromo = f;

                    LeadGenService.getAllLeadGenMethodById(f.leadGenMethodId).then(function (ee) {
                        $scope.bindedLEadGenMethod = ee;
                        $scope.detailedCustomerInfo.leadGenMethod = $scope.bindedLEadGenMethod.id;
                    });
                });
            };

            self.updateLeadGenProjectsForCurrentMethod = function () {
                console.log("updateLeadGenProjectsForCurrentMethod methods");
                $scope.leadGenProjectsForCurrentMethod = [];

                for (var i = 0; i < $scope.allLeadGenProjects.length; i++) {
                    if ($scope.allLeadGenProjects[i].leadGenMethodId === $scope.detailedCustomerInfo.leadGenMethod) {
                        $scope.leadGenProjectsForCurrentMethod.push($scope.allLeadGenProjects[i]);
                    }
                }

                console.log($scope.leadGenProjectsForCurrentMethod);
                return $scope.leadGenProjectsForCurrentMethod;
            };

            self.leadGenProjectChoosen = function () {
                if (!$scope.bindedLEadGenProject) {
                    return;
                }

                $scope.detailedCustomerInfo.leadGenProject = $scope.bindedLEadGenProject.id;
            };

            $scope.leadLenMethodChanged = function () {
                if ($scope.bindedLEadGenProject) {
                    if ($scope.bindedLEadGenProject.leadGenMethodId != $scope.detailedCustomerInfo.leadGenMethod) {
                        $scope.bindedLEadGenProject = null;
                    }
                }
            };

            $scope.leadGenMethodChoosen = function () {
                if (!$scope.bindedLEadGenMethod) return;
                $scope.detailedCustomerInfo.leadGenMethod = $scope.bindedLEadGenMethod.id;

                if ($scope.leadGenProjectByPromo) {
                    $scope.bindedLEadGenProject = $scope.leadGenProjectByPromo;
                }

                self.updateLeadGenProjectsForCurrentMethod();
                self.leadGenProjectChoosen();

                self.leadGenMethodChanedTimes++;
            };

            $scope.$watch('bindedLEadGenMethod', function () {
                console.info("New lead gen method choosed!;");
                $scope.leadGenMethodChoosen();
            });

            $scope.$watch('bindedLEadGenProject', function () {
                console.info("New lead gen project choosed!;");
                self.leadGenProjectChoosen();
            });

            $scope.allExistingDealsAmount = 0;
            $scope.allExistingOpportunitiesAmount = 0;

            self.countDealsAndOpportunity = function () {
                (function () {
                    var allCustomerDealsAmount = 0;
                    for (var i = 0; i < $scope.existingDeals.length; i++) {
                        allCustomerDealsAmount += $scope.existingDeals[i].amount;
                    }

                    $scope.allExistingDealsAmount = allCustomerDealsAmount;
                })();

                (function () {
                    var allCustomerDealsAmount = 0;
                    for (var i = 0; i < $scope.existingOpporunities.length; i++) {
                        allCustomerDealsAmount += $scope.existingOpporunities[i].amount;
                    }

                    $scope.allExistingOpportunitiesAmount = allCustomerDealsAmount;
                })();

            };
            setInterval(self.countDealsAndOpportunity, 1000);

            $scope.downloadFile = documentsService.downloadFile;

            $scope.showProfileOverview = function (ev) {
                $mdDialog.show({
                    scope: $scope,
                    preserveScope: true,
                    templateUrl: 'templates/modal/customer_profile.html',
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

            $scope.showNewTaskFoo = function (ev) {

                // do not add here self.resolveForTask() - that decrease performance

                $mdDialog.show({
                    scope: $scope,
                    preserveScope: true,
                    templateUrl: 'templates/modal/add_new_task.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true
                })
                    .then(function (answer) {
                        //$scope.status = 'You said the information was "' + answer + '".';
                    }, function () {
                        $scope.status = 'You cancelled the dialog.';
                    });
            };

            //////////////////////////////////////////////////////

            $scope.addAdditionalEmail = function () {
                $scope.detailedCustomerInfo.emails.push($scope.newAdditionalEmail);
                $scope.newAdditionalEmail = "";
                console.log($scope.detailedCustomerInfo.emails);
            };

            $scope.deleteAdditionalEmail = function (index) {
                console.log("Delete additional email by index: " + index);
                $scope.detailedCustomerInfo.emails.splice(index, 1);
            };

            $scope.showEmails = function () {
                $scope.showEmailVal = !$scope.showEmailVal;
            };

            $scope.addDealFromOpportunity = function (id, index) {
                $scope.existingOpporunities.splice(index, 1);

                $scope.detailedCustomerInfo.customer = true;
                $scope.detailedCustomerInfo.lead = false;
                $scope.chanedLeadAndCustomer('customer');

                PaymentsService.addNewDealFromOpportunity(id).then(function (e) {
                    $scope.existingDeals.push(e);
                    logger.logSuccess("Новая сделка: " + e.name + " добавлена!");
                })
            };

            $scope.addStaticSegment = function (segment) {
                $scope.detailedCustomerInfo.staticSegmentsIDs.push(segment.id);
                logger.logSuccess("Сегмент: <b> " + segment.name + "  </b> добавлен!")
            };

            $scope.deleteStaticSegment = function (segment) {
                var index = $scope.detailedCustomerInfo.staticSegmentsIDs.indexOf(segment);
                $scope.detailedCustomerInfo.staticSegmentsIDs.splice(index, 1);
                logger.logSuccess("Сегмент: <b> " + segment.name + "  </b> удален!")
            };

            $scope.chanedLeadAndCustomer = function (whatSelected) {

                if (whatSelected === "lead") {

                    if ($scope.detailedCustomerInfo.lead) {
                        $scope.detailedCustomerInfo.salesFunnelStatus = $scope.bindedLEadGenMethod.leadConversionSalesFunnel.salesFunnelStatuses[0];
                        $scope.detailedCustomerInfo.customer = false;
                        return;
                    } else {
                        $scope.detailedCustomerInfo.salesFunnelStatus = $scope.bindedLEadGenMethod.accountManagementSalesFunnel.salesFunnelStatuses[0];
                        $scope.detailedCustomerInfo.lead = false;
                        $scope.detailedCustomerInfo.customer = true;

                        return;
                    }
                } else if (whatSelected === "customer") {

                    if ($scope.detailedCustomerInfo.customer) {
                        $scope.detailedCustomerInfo.salesFunnelStatus = $scope.bindedLEadGenMethod.accountManagementSalesFunnel.salesFunnelStatuses[0];
                        $scope.detailedCustomerInfo.lead = false;
                        return;

                    } else {
                        $scope.detailedCustomerInfo.salesFunnelStatus = $scope.bindedLEadGenMethod.leadConversionSalesFunnel.salesFunnelStatuses[0];
                        $scope.detailedCustomerInfo.customer = false;
                        $scope.detailedCustomerInfo.lead = true;
                        return;
                    }
                }

            };

            // OPPORTUNITY START
            $scope.saveNewOpporunity = function (data, id) {
                angular.extend(data, {id: id});
                data.connectedInfo = {};
                data.connectedInfo.connectedType = "CUSTOMER";
                data.connectedInfo.connectedCustomerId = $route.current.params.id;

                opportunityService.addNewOpportunity(data).then(function (e) {
                    $scope.existingOpporunities.push(e);
                    $scope.allNewOpportunities.pop(data);
                });
            };

            $scope.saveExistingOpporunity = function (data, id) {
                angular.extend(data, {id: id});
                data.connectedInfo = {};
                data.connectedInfo.connectedType = "CUSTOMER";
                data.connectedInfo.connectedCustomerId = $route.current.params.id;
                console.log(data);
                opportunityService.saveExistingOpportunity(data);
            };

            $scope.deleteExistingOpporunity = function (index) {
                console.log($scope.existingOpporunities[index]);
                opportunityService.deleteExistingOpportunity($scope.existingOpporunities[index]);
                $scope.existingOpporunities.splice(index, 1);

            };

            $scope.removeUser = function (index) {
                $scope.allNewOpportunities.splice(index, 1);
            };

            $scope.addNewOpporunityToOpportunities = function () {
                $scope.newOpportunity.tempId = $scope.allNewOpportunities.length + 1;
                $scope.allNewOpportunities.push($scope.newOpportunity);
                $scope.newOpportunity = {};
                $scope.newOpportunity.priority = 2;
            };

            // OPPORTUNITY END

            // DEAL START
            $scope.saveNewDeal = function (data, id) {
                angular.extend(data, {id: id});
                data.connectedInfo = {};
                data.connectedInfo.connectedCustomerId = $route.current.params.id;

                PaymentsService.addNewDeal(data).then(function (e) {
                    $scope.existingDeals.push(e);
                    $scope.allNewDeals.pop(data);

                    $scope.detailedCustomerInfo.customer = true;
                    $scope.detailedCustomerInfo.lead = false;
                    $scope.chanedLeadAndCustomer('customer');
                });
            };

            $scope.saveExistingDeal = function (data, id) {
                angular.extend(data, {id: id});

                data.connectedInfo = {};
                data.connectedInfo.connectedCustomerId = $route.current.params.id;
                console.log(data);
                PaymentsService.saveExistingDeal(data);
            };

            $scope.deleteExistingDeal = function (index) {
                console.log($scope.existingDeals[index]);
                PaymentsService.deleteExistingDeal($scope.existingDeals[index]);
                $scope.existingDeals.splice(index, 1);
            };

            $scope.removeDeal = function (index) {
                $scope.allNewDeals.splice(index, 1);
            };

            $scope.addNewDealToOpportunities = function () {
                $scope.newDeal.tempId = $scope.allNewDeals.length + 1;
                $scope.allNewDeals.push($scope.newDeal);
                $scope.newDeal = {};
            };

            // when type on promo code search or get all list of promo codes ->
            // get all promo codes ( from leadGenProject ) list from server
            $scope.requestForAllPromoCodes = function () {
                if ($scope.allPromoCodes.length > 0) return;
                LeadGenService.geAllPromoCodes().then(function (data) {
                    $scope.allPromoCodes = data;
                });
            };

            // DEAL END

            $scope.goTo = function (where) {
                $location.hash(where);
                $anchorScroll();
            };

            $scope.hideDeletedFilter = function (filter) {
                return filter.status != "deleted";
            };

            $scope.getLeadGenMethodByPromoCodeId = function (code) {
                return LeadGenService.getLeadGenMethodByPromoCodeId(code);
            };

            $scope.analyticsRecordShow = function () {
                if ($scope.detailedCustomerInfo.customerWebAnalytics != null) {
                    analyticsService.getAllAnalyticRecordsByCookiesIds($scope.detailedCustomerInfo.customerWebAnalytics.cookiesIds).then(function (e) {
                        $scope.allAnalyticsRecords = e;
                    });
                }

                logger.logSuccess("Показаны данные по аналитике!");
            };

            hotkeys.add({
                combo: 'shit+N',
                description: '',
                callback: function () {
                    $scope.showNewTaskFoo();
                }
            });

            $scope.addTask = function () {
                logger.logSuccess("Новая задача: " + $scope.task.name + "успешно добавлена!");

                TaskService.addTask($scope.task).then(function (e) {
                    TaskService.getAllTasksByCustomerId($scope.currentCustomerId).then(function (data) {
                        $scope.allConnectedTasks = data.resultedObjects;
                        self.resolveForTask();
                    })
                });
                $mdDialog.hide();
            };

            $scope.showHistoryAstring = function () {
                customerService.getCustomerOrLeadChangesStringedById($scope.detailedCustomerInfo.id).then(function (data) {
                    $scope.stringedObjectHistory = data.stringLog;
                })
            };

            $scope.beforeUploadMetaInfoInterceptor = function () {
                var data = {};
                data.parentId = $rootScope.domainSettings.customerFolderId;
                return data;
            };

        }])
;

