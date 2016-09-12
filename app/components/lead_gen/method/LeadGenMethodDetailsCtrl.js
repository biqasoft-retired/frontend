'use strict';

angular.module('app.leadGenMethod.methodById', ['ngRoute', 'LocalStorageModule'])

    .service('LeadGenMethodsByIdService', ['$rootScope', 'logger', 'LeadGenService',
        function($rootScope, logger, LeadGenService) {

            var self = this;

            this.printData = function(target, data, params) {
                params = params || {};

                if (!data || !data.length) return;

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

                    //width: 600,
                    //height: 200,
                    //right: 40,
                    xax_count: 4,
                    target: '#' + target
                };

                if (params.format) obj.formar = params.format;
                MG.data_graphic(obj);
            };

            this.getKPIs = function($scope, selfPar) {
                LeadGenService.getLeadGenKPIs($scope.kpisBuilder).then(function(data) {

                    if (!data.succeed){
                        $scope.showKpisMetricsObj.val = false;
                        return;
                    }else{
                        $scope.showKpisMetricsObj.val = true;
                    }

                    selfPar.data = data;

                    self.printData("kpiLeadGenMethod-customersNumber", data.customersNumber);
                    self.printData("kpiLeadGenMethod-dealsAmounts", data.dealsAmounts);
                    self.printData("kpiLeadGenMethod-costsAmount", data.costsAmount);
                    self.printData("kpiLeadGenMethod-leadsNumber", data.leadsNumber);
                    self.printData("kpiLeadGenMethod-dealsNumber", data.dealsNumber);
                    self.printData("kpiLeadGenMethod-costsNumber", data.costsNumber);
                    self.printData("kpiLeadGenMethod-conversionFromLeadToCustomer",
                        data.conversionFromLeadToCustomer.map(function(a) {
                            a.value = a.value * 100; return a
                        }), {format: 'percentage'});
                    self.printData("kpiLeadGenMethod-leadCost", data.leadCost);
                    self.printData("kpiLeadGenMethod-customerCost", data.customerCost);
                    self.printData("kpiLeadGenMethod-averagePayment", data.averagePayment);
                    self.printData("kpiLeadGenMethod-ltv", data.ltv.filter(function(a) {
                        if (a.value !== 'Infinity') return true;
                    }), {});
                    self.printData("kpiLeadGenMethod-dealsCycle", data.dealsCycle.map(function(a) {
                        a.value = a.value / 3600; return a
                    }), {});
                    self.printData("kpiLeadGenMethod-roi", data.roi.map(function(a) {
                        a.value = a.value * 100; return a
                    }), {format: 'percentage'});
                })
            };

            this.getConversionRateFromPreviousStatus = function(statusDataSource, $scope) {
                var rate = 0.0;
                var i = 0;

                /////////////////////////////////////////////////////////////////
                for (i = 0; i < $scope.choosenSalesFunnelLG.salesFunnelStatuses.length; i++) {
                    if ($scope.choosenSalesFunnelLG.salesFunnelStatuses[i].id ===  statusDataSource.id) {
                        if (i ===  0) {
                            rate = 0.0;
                            return rate;
                        }
                        else {
                            rate = $rootScope.getResolvedOneData($scope.choosenSalesFunnelLG.salesFunnelStatuses[i].dataSourceSavedData) / $rootScope.getResolvedOneData($scope.choosenSalesFunnelLG.salesFunnelStatuses[i - 1].dataSourceSavedData);
                            if (rate ===  Infinity) return null;
                            return rate;
                        }
                    }
                }

                /////////////////////////////////////////////////////////////////
                for (i = 0; i < $scope.choosenSalesFunnelLC.salesFunnelStatuses.length; i++) {
                    if ($scope.choosenSalesFunnelLC.salesFunnelStatuses[i].id ===  statusDataSource.id) {
                        if (i ===  0) {
                            // usually it means, that we don't have Lead gen sales funnel
                            if (!$scope.choosenSalesFunnelLG.salesFunnelStatuses[$scope.choosenSalesFunnelLG.salesFunnelStatuses.length - 1]) return 0;

                            rate = $rootScope.getResolvedOneData($scope.choosenSalesFunnelLC.salesFunnelStatuses[i].dataSourceSavedData) / $rootScope.getResolvedOneData($scope.choosenSalesFunnelLG.salesFunnelStatuses[$scope.choosenSalesFunnelLG.salesFunnelStatuses.length - 1].dataSourceSavedData);
                            return rate;
                        }
                        else {
                            rate = $rootScope.getResolvedOneData($scope.choosenSalesFunnelLC.salesFunnelStatuses[i].dataSourceSavedData) / $rootScope.getResolvedOneData($scope.choosenSalesFunnelLC.salesFunnelStatuses[i - 1].dataSourceSavedData);
                            if (rate ===  Infinity) return null;
                            return rate;
                        }
                    }
                }

                /////////////////////////////////////////////////////////////////
                for (i = 0; i < $scope.choosenSalesFunnelAM.salesFunnelStatuses.length; i++) {
                    if ($scope.choosenSalesFunnelAM.salesFunnelStatuses[i].id ===  statusDataSource.id) {
                        if (i ===  0) {
                            rate = $rootScope.getResolvedOneData($scope.choosenSalesFunnelAM.salesFunnelStatuses[i].dataSourceSavedData) / $rootScope.getResolvedOneData($scope.choosenSalesFunnelLC.salesFunnelStatuses[$scope.choosenSalesFunnelLC.salesFunnelStatuses.length - 1].dataSourceSavedData);
                            return rate;
                        }
                        else {
                            rate = $rootScope.getResolvedOneData($scope.choosenSalesFunnelAM.salesFunnelStatuses[i].dataSourceSavedData) / $rootScope.getResolvedOneData($scope.choosenSalesFunnelAM.salesFunnelStatuses[i - 1].dataSourceSavedData);
                            if (rate ===  Infinity) return null;
                            return rate;
                        }
                    }
                }

                /////////////////////////////////////////////////////////////////
                return rate;
            };

            this.getIndexOfDataSource = function(statusDataSource, $scope) {
                var i = 0;
                for (i = 0; i < $scope.choosenSalesFunnelLG.salesFunnelStatuses.length; i++) {
                    if ($scope.choosenSalesFunnelLG.salesFunnelStatuses[i].id ===  statusDataSource.id) {
                        return [i, "LG"];
                    }
                }

                for (i = 0; i < $scope.choosenSalesFunnelLC.salesFunnelStatuses.length; i++) {
                    if ($scope.choosenSalesFunnelLC.salesFunnelStatuses[i].id ===  statusDataSource.id) {
                        return [i, "LC"];
                    }
                }

                for (i = 0; i < $scope.choosenSalesFunnelAM.salesFunnelStatuses.length; i++) {
                    if ($scope.choosenSalesFunnelAM.salesFunnelStatuses[i].id ===  statusDataSource.id) {
                        return [i, "AM"];
                    }
                }

                return false;
            };

        }])

    .controller('LeadGenMethodsByIdCtrl', ['$scope', '$rootScope', 'logger', 'LeadGenService', '$route', 'chartsService', 'SalesFunnelService', 'PaymentsService',
         'SweetAlert', 'customerService', '$timeout', 'LeadGenMethodsByIdService', '$mdDialog',
        function($scope, $rootScope, logger, LeadGenService, $route, chartsService, SalesFunnelService, PaymentsService, SweetAlert,
                 customerService, $timeout, LeadGenMethodsByIdService, $mdDialog) {

            var self = this;

            $scope.currentLeadGenMethodId = $route.current.params.id;
            $scope.newLeadGenProject = {};

            $scope.showNewProjectFlag = false;
            $scope.showKpisMetricsObj = {};
            $scope.showKpisMetricsObj.val = false;
            $scope.kpiLeadGenMethodCachedDate = null;

            $scope.showExistingSalesFunnelLG = true;
            $scope.showExistingSalesFunnelLC = true;
            $scope.showExistingSalesFunnelAM = true;

            $scope.choosenSalesFunnelLG = undefined;
            $scope.choosenSalesFunnelLC = undefined;
            $scope.choosenSalesFunnelAM = undefined;

            self.allSalesFunnels = [];
            self.absoluteSalesFunnelStatusesValue = [];
            self.printData = LeadGenMethodsByIdService.printData;

            $scope.editMode = true;

            $scope.kpisBuilder = {};
            $scope.kpisBuilder.startDate = null;
            $scope.kpisBuilder.finalDate = null;
            $scope.kpisBuilder.leadGenMethodId = $scope.currentLeadGenMethodId;

            $scope.allDataSources = [];


            self.getKPIs = function() {
                return LeadGenMethodsByIdService.getKPIs($scope, self);
            };
            $scope.getKPIs = self.getKPIs;

            // get current leadGenMethod
            LeadGenService.getAllLeadGenMethodById($scope.currentLeadGenMethodId).then(function(e) {
                $scope.currentLeadGenMethod = e;
                $rootScope.title = e.name;

                $scope.kpiLeadGenMethod = e.cachedKPIsData;
                $scope.kpiLeadGenMethodCachedDate = e.cachedKPIsMetaInfo.lastUpdate;

                $rootScope.defineUnsavedData($scope, 'currentLeadGenMethod', {
                    autoSaveFunction: function() {
                    }, timesBefore: 0
                });

                $scope.choosenSalesFunnelLG = $scope.currentLeadGenMethod.leadGenSalesFunnel;
                $scope.choosenSalesFunnelLC = $scope.currentLeadGenMethod.leadConversionSalesFunnel;
                $scope.choosenSalesFunnelAM = $scope.currentLeadGenMethod.accountManagementSalesFunnel;

                self.allSalesFunnelArray = {};

                self.leadGenChartUpdate();
                self.leadAccountManagementSalesFunnelChartUpdate();
                self.leadConversionSalesFunnelChartUpdate();
                self.allSalesFunnelChartUpdate();

                $timeout (self.getKPIs, 2000);
            });

            // TODO: optimize
            self.loadAllDataSource = function () {
                SalesFunnelService.getAlldataSource().then(function(data) {
                    $scope.allDataSources = data;
                });
            };

            $scope.addNewProjectToLeadGenMethod = function() {
                $scope.newLeadGenProject.leadGenMethodId = $scope.currentLeadGenMethod.id;
                LeadGenService.addNewLeadGenProject($scope.newLeadGenProject).then(function(f) {
                    logger.logSuccess("Создан способ лидгена: " + $scope.newLeadGenProject.name + " !");
                    $scope.currentLeadGenMethod.leadGenProjects.push(f);
                    $scope.newLeadGenProject = {};
                    $scope.newLeadGenProject.leadGenMethodId = $scope.currentLeadGenMethod.id;
                    LeadGenService.updateLeadGenLeadGenMethod($scope.currentLeadGenMethod).then(function(b) {
                    });
                })
            };

            // MAKE AND DELETE SALES FUNNEL STATUSES DRAGGABLE
            $scope.editModeChanged = function() {
                if ($scope.editMode) {
                    window.jQuery(".angular-ui-tree-handle").attr("data-nodrag");
                } else {
                    self.loadAllDataSource();
                    window.jQuery(".angular-ui-tree-handle").removeAttr("data-nodrag");
                }
            };

            /////////////////////////////////////////////////////////////////

            $scope.deleteSalesFunnelStatusConfirmation = function(status, remover) {
                SweetAlert.swal({
                    title: "Удалить статус: " + status.name,
                    text: "Этот статус для клиентов/лидов будет удален",
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
                            $scope.deleteSalesFunnelStatus(status, remover);
                        } else {
                            SweetAlert.swal("Отмена", "error");
                        }
                    }
                )
            };

            $scope.getIndexOfDataSource = function(datasource) {
                return LeadGenMethodsByIdService.getIndexOfDataSource(datasource, $scope);
            };

            $scope.deleteSalesFunnelStatus = function(status, remover) {
                console.log(status, remover);
                var customerBuilder = {};
                customerBuilder.salesFunnelStatusID = status.id;

                /**
                 * If this status was added in this page,
                 * but not yet saved to server
                 */
                if (!status.id) {
                    remover.remove();
                    SweetAlert.swal("Временный статус удален");
                    return;
                }

                customerService.getAllCustomerByBuilder(customerBuilder).then(function(data) {
                    if (data.entityNumber > 0) {
                        SweetAlert.swal("У вас есть клиенты/лиды с этим статусом. Сначала смените у них статус на другой");
                    }else {
                        remover.remove();
                        SweetAlert.swal("Статус удален");
                    }
                })
            };

            /**
             * Add new status to sales funnel
             * @param salesFunnel
             */
            $scope.addNewStatusToList = function(salesFunnel) {
                var a = {};
                a.name = "Новый статус";

                a.dataSourceSavedData = {};
                a.dataSourceSavedData.values = {};
                a.dataSourceSavedData.values.intVal = 0;
                a.dataSourceSavedData.name = "выберите источник данных";
                a.dataSourceSavedData.returnType = "INTEGER";
                a.dataSourceSavedData.resolved = true;

                // set new color as previous status
                if (salesFunnel.salesFunnelStatuses.length && salesFunnel.salesFunnelStatuses.length > 0){
                    var color = salesFunnel.salesFunnelStatuses[salesFunnel.salesFunnelStatuses.length - 1].color;
                    if ( !isUndefinedOrNull(color) ){
                        a.color = color;
                    }
                }

                salesFunnel.salesFunnelStatuses.push(a);
            };

            $scope.getConversionRateFromPreviousStatus = function(statusDataSource) {
                return LeadGenMethodsByIdService.getConversionRateFromPreviousStatus(statusDataSource, $scope);
            };

            $scope.getAbsoluteValueBySalesFennelId = function(id) {
                for (var i = 0; i < self.absoluteSalesFunnelStatusesValue.length; i++) {
                    if (self.absoluteSalesFunnelStatusesValue[i].id ===  id) return self.absoluteSalesFunnelStatusesValue[i];
                }

                return null;
            };

            /**
             * update current leadGenMethod
             */
            $scope.addNewProject = function() {
                LeadGenService.updateLeadGenLeadGenMethod($scope.currentLeadGenMethod).then(function(b) {
                    logger.logSuccess("Метод лидгена <b>" + b.name + " </b> успешно обновлен!");

                    $rootScope.hasUnsavedEdits = false;
                    if (!$rootScope.autoSaveObjects) {
                        logger.logSuccess("Изменения успешно сохранены!");
                    }
                });
                $scope.editMode = !$scope.editMode;
            };

            $scope.changedDataSource = function(item) {
                SalesFunnelService.getDataSourceById(item.dataSourceSavedData.id).then(function(e) {
                    item.dataSourceSavedData = e;

                    $scope.choosenSalesFunnelLG = $scope.currentLeadGenMethod.leadGenSalesFunnel;
                    $scope.choosenSalesFunnelLC = $scope.currentLeadGenMethod.leadConversionSalesFunnel;
                    $scope.choosenSalesFunnelAM = $scope.currentLeadGenMethod.accountManagementSalesFunnel;

                    self.leadGenChartUpdate();
                    self.leadAccountManagementSalesFunnelChartUpdate();
                    self.leadConversionSalesFunnelChartUpdate();
                    self.allSalesFunnelChartUpdate();
                })
            };

            self.translatedDataToChartFromDB = function(data) {
                var a = [];
                var value = 0;
                for (var i = 0; i < data.salesFunnelStatuses.length; i++) {
                    value = 0;
                    if (data.salesFunnelStatuses[i].dataSourceSavedData != null) value = parseFloat($rootScope.getResolvedOneData(data.salesFunnelStatuses[i].dataSourceSavedData));
                    a.push([data.salesFunnelStatuses[i].name, value, data.salesFunnelStatuses[i].color]);
                }

                return a;
            };

            $scope.onChangedSelectedFunnelLG = function() {
                // показ существующей воронки
                if ($scope.showExistingSalesFunnelLG) {
                    for (var i = 0; i < self.allSalesFunnels.length; i++) {
                        if (self.allSalesFunnels[i].id ===  $scope.choosenSalesFunnelLG.id) {
                            $scope.currentLeadGenMethod.leadGenSalesFunnel = self.allSalesFunnels[i];
                            $scope.choosenSalesFunnelLG = self.allSalesFunnels[i];
                        }
                    }
                }

                self.leadGenChartUpdate();
                self.allSalesFunnelChartUpdate();
            };

            $scope.onChangedSelectedFunnelLC = function() {
                // показ существующей воронки
                if ($scope.showExistingSalesFunnelLC) {
                    for (var i = 0; i < self.allSalesFunnels.length; i++) {
                        if (self.allSalesFunnels[i].id ===  $scope.choosenSalesFunnelLC.id) {
                            $scope.currentLeadGenMethod.leadConversionSalesFunnel = self.allSalesFunnels[i];
                            $scope.choosenSalesFunnelLC = self.allSalesFunnels[i];
                        }
                    }
                }

                self.leadConversionSalesFunnelChartUpdate();
                self.allSalesFunnelChartUpdate();
            };

            $scope.onChangedSelectedFunnelAM = function() {
                // показ существующей воронки
                if ($scope.showExistingSalesFunnelAM) {
                    for (var i = 0; i < self.allSalesFunnels.length; i++) {
                        if (self.allSalesFunnels[i].id ===  $scope.choosenSalesFunnelAM.id) {
                            $scope.currentLeadGenMethod.accountManagementSalesFunnel = self.allSalesFunnels[i];
                            $scope.choosenSalesFunnelAM = self.allSalesFunnels[i];
                        }
                    }
                }

                self.leadAccountManagementSalesFunnelChartUpdate();
                self.allSalesFunnelChartUpdate();
            };

            $scope.currentEditableSalesFunnelStatus = {};

            $scope.editSalesFunnelStatus = function(item, object, ev) {
                $scope.currentEditableSalesFunnelStatus = item;

                $mdDialog.show({
                        scope: $scope,
                        preserveScope: true,
                        templateUrl: 'app/components/lead_gen/modal/edit_sales_funnel_status.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose:true
                    })
                    .then(function(answer) {

                    }, function() {
                        $scope.status = 'You cancelled the dialog.';
                    });
            };

            // here are 3 sales funnel
            // dirty hack to update imminently
            // at edit

            $scope.$watch('choosenSalesFunnelLG', function() {
                self.leadGenChartUpdate();
                self.allSalesFunnelChartUpdate();
            }, true);

            $scope.$watch('choosenSalesFunnelLC', function() {
                self.leadConversionSalesFunnelChartUpdate();
                self.allSalesFunnelChartUpdate();
            }, true);

            $scope.$watch('choosenSalesFunnelAM', function() {
                self.leadAccountManagementSalesFunnelChartUpdate();
                self.allSalesFunnelChartUpdate();
            }, true);

            self.leadGenChartUpdate = function () {
                if (typeof $scope.choosenSalesFunnelLG != 'undefined')
                    chartsService.drawSalesFunnelByDOMidAndDataSource_ONE("leadGenSalesFunnel", self.translatedDataToChartFromDB($scope.choosenSalesFunnelLG), "");
            };

            self.leadConversionSalesFunnelChartUpdate = function () {
                if (typeof $scope.choosenSalesFunnelLC != 'undefined')
                    chartsService.drawSalesFunnelByDOMidAndDataSource_ONE("leadConversionSalesFunnel", self.translatedDataToChartFromDB($scope.choosenSalesFunnelLC), "");
            };

            self.leadAccountManagementSalesFunnelChartUpdate = function() {
                if (typeof $scope.choosenSalesFunnelAM != 'undefined')
                    chartsService.drawSalesFunnelByDOMidAndDataSource_ONE("leadAccountManagementSalesFunnel", self.translatedDataToChartFromDB($scope.choosenSalesFunnelAM), "");
            };

            // update sales funnel of all funnels
            self.allSalesFunnelChartUpdate = function() {

                // this is undefined on page load
                // see $scope.choosenSalesFunnelLG = undefined above
                if (isUndefinedOrNull($scope.choosenSalesFunnelLG) || isUndefinedOrNull($scope.choosenSalesFunnelLC) || isUndefinedOrNull($scope.choosenSalesFunnelAM)){
                    return;
                }

                self.allSalesFunnelArray.salesFunnelStatuses = $scope.choosenSalesFunnelLG.salesFunnelStatuses.concat($scope.choosenSalesFunnelLC.salesFunnelStatuses, $scope.choosenSalesFunnelAM.salesFunnelStatuses);

                // this check - to avoid error if this page is first loaded
                if (!$scope.currentLeadGenMethod) return;
                var name = $scope.currentLeadGenMethod.name + " от " + $rootScope.printDate(new Date());
                if (!isUndefinedOrNull(self.allSalesFunnelArray)){
                    chartsService.drawSalesFunnelByDOMidAndDataSource_ONE("allSalesFunnel", self.translatedDataToChartFromDB(self.allSalesFunnelArray), name);
                }
            }

        }]);
