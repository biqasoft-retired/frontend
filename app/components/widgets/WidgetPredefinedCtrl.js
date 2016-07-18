'use strict';

angular.module('app.widgets.predefined', ['ngRoute', 'LocalStorageModule'])

    .controller('PredefinedWidgetCreator', ['$scope', '$rootScope', 'timeService', 'logger', 'SalesFunnelService', 'widgetService', 'analyticsService', 'chartsService',
        'PaymentsService', 'widgetDashboardService', '$translate',
        function ($scope, $rootScope, timeService, logger, SalesFunnelService, widgetService, analyticsService, chartsService, PaymentsService, widgetDashboardService, $translate) {

            $scope.status = {};

            $scope.allDataSources = [];
            $scope.currentDashboard = {};
            $scope.allDashboards = [];

            // this is new widget iframe controller
            // default settings
            $scope.url = "http://parse.com";
            $scope.iframe_styles = "width: 100%; height:400px";

            // this is dirty hack to `ng-include` template updating in view
            // every change in widget - will create new template, with new ID
            // and then - this template will be included to page
            $scope.widgetId = "b";

            // generate new widget ID for new template
            // this just should be unic
            $scope.getNewWidgetId = function () {
                return $scope.widgetId += "b";
            };

            /**
             * render widget to demo place
             * @param widget
             */
            $scope.renderNewWidget = function (widget) {
                var par = angular.copy(widget);
                par.id = $scope.getNewWidgetId();

                (function () {
                    var sc = $scope;
                    var callbackOnSuccess = function () {
                        sc.widgetId = par.id;
                    };
                    widgetDashboardService.renderWidgetFromDashboard($scope, par, callbackOnSuccess);
                })();
            };

            //
            SalesFunnelService.getAlldataSource().then(function (e) {
                $scope.allDataSources = e;
            });
            //
            widgetService.getAllDashboards().then(function (e) {
                $scope.allDashboards = e;
                $scope.currentDashboard = e[0];
            });
            //

            $scope.newWidget = {};
            $scope.newWidgetData = {};
            $scope.newWidget.dataSources = [];
            $scope.style = "1";
            $scope.dataBuilder = {};
            // 
            $scope.translatedDataToChart = [["ONE", 50], ["two", 50]];
            //
            $scope.drawCompanyAimGauge = chartsService.drawGauge;
            $scope.drawColdCallResult = chartsService.drawColdCallResult;
            $scope.drawColumnChart = chartsService.drawColumnChart;
            $scope.drawPieChart = chartsService.drawPieChart;
            $scope.drawMangerMapyments = chartsService.drawBubbleChart;
            $scope.drawBarChart = chartsService.drawBarChart;
            $scope.translateDataSourcesArrayToHighchartsSeries = SalesFunnelService.translateDataSourcesArrayToHighchartsSeries;
            /////////////////////////////////////////////////////////////////////////////
            $scope.dataSourceWidgetNew = function (dataSourceId) {
                $scope.newWidget = {};
                var params =
                        [
                            {
                                "name": "style",
                                "value": ($scope.style || "1")
                            }
                        ]
                    ;
                $scope.newWidget.additionalData = params;

                $scope.newWidget.templateController = "DATA_SOURCE_ONE_DATA";
                $scope.newWidget.dataSources = [];
                $scope.newWidget.dataSources.push(dataSourceId);
                $scope.renderNewWidget($scope.newWidget);
            };

            $scope.iframeWidgetNew = function () {
                console.log($scope.url);
                $scope.newWidget = {};
                $scope.newWidget.sizeX = 6;
                $scope.newWidget.sizeY = 3;
                var params =
                        [
                            {
                                "name": "url",
                                "value": $scope.url
                            },
                            {
                                "name": "iframe_styles",
                                "value": $scope.iframe_styles
                            }

                        ]
                    ;
                $scope.newWidget.additionalData = params;
                $scope.newWidget.templateController = "IFRAME";
                $scope.renderNewWidget($scope.newWidget);
            };

            /////////////////////////////////////////////////////////////////////////////
            $scope.deleteDataSourceComplexBuIndex = function (i) {
                $scope.newWidget.dataSources.splice(i, 1);
                $scope.redrawAllChartsAndTranslateDataFromDataSource();
            };
            /////////////////////////////////////////////////////////////////////////////

            $scope.dataSourceWidgetComplexNew = function (dataSourceId) {
                var e = dataSourceId;
                $scope.newWidgetData = e;
                $scope.newWidget.sizeX = 4;
                $scope.newWidget.sizeY = 2;

                if ($scope.newWidget.templateController != "DATA_SOURCE_COMPLEX_DATA")  $scope.newWidget.dataSources = [];

                var params =
                        [
                            {
                                "name": "style",
                                "value": ($scope.style || "1")
                            }
                        ]
                    ;
                $scope.newWidget.additionalData = params;

                $scope.newWidget.templateController = "DATA_SOURCE_COMPLEX_DATA";
                $scope.newWidget.dataSources.push(e);
                $scope.redrawAllChartsAndTranslateDataFromDataSource();
            };

            /////////////////////////////////////////////////////////////////////////////
            $scope.redrawAllChartsAndTranslateDataFromDataSource = function () {
                var params =
                        [
                            {
                                "name": "style",
                                "value": ($scope.style || "1")
                            }
                        ]
                    ;
                $scope.newWidget.additionalData = params;

                $scope.translatedDataToChart = $scope.translateDataSourcesArrayToHighchartsSeries($scope.newWidget.dataSources);

                $scope.drawPieChart("chart1", $scope.translatedDataToChart, {"title": "", dataSources: $scope.newWidget.dataSources});
                $scope.drawColumnChart("chart2", $scope.translatedDataToChart, {dataSources: $scope.newWidget.dataSources});
                $scope.renderNewWidget($scope.newWidget);
            };

            /////////////////////////////////////////////////////////////////////////////
            $scope.managerPaymentsWidgetPieNew = function () {
                $scope.newWidgetData = {};
                $scope.newWidget.templateController = "MANAGER_PAYMENTS_PIE";
                $scope.newWidget.sizeX = 6;
                $scope.newWidget.sizeY = 3;
                $scope.renderNewWidget($scope.newWidget);
            };
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            $scope.managerPaymentsWidgetNew = function () {
                $scope.newWidgetData = {};
                $scope.newWidget.templateController = "MANAGER_PAYMENTS_BUBBLE";
                $scope.newWidget.sizeX = 6;
                $scope.newWidget.sizeY = 3;
                $scope.renderNewWidget($scope.newWidget);
            };
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            $scope.customersAndLeadsByManagersWidgetNew = function () {
                $scope.newWidgetData = {};
                $scope.newWidget.templateController = "MANAGER_LEADS_CUSTOMERS_BAR";
                $scope.newWidget.sizeX = 6;
                $scope.newWidget.sizeY = 3;
                $scope.newWidget.biqaClassBuilderAbstract = $scope.dataBuilder;
                $scope.renderNewWidget($scope.newWidget);
            };
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            $scope.taskMiniWidgetNew = function () {
                $scope.newWidgetData = {};
                $scope.newWidget.templateController = "TASKS_MINI";
                $scope.newWidget.sizeX = 6;
                $scope.renderNewWidget($scope.newWidget);
            };
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            $scope.leadsLastsWidgetNew = function () {
                $scope.newWidgetData = {};
                $scope.newWidget.templateController = "LEADS_LASTS";
                $scope.newWidget.sizeX = 6;
                $scope.newWidget.sizeY = 6;
                $scope.renderNewWidget($scope.newWidget);
            };

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            $scope.companyAimWidgetNew = function () {
                $scope.newWidgetData = {};
                $scope.newWidget.templateController = "COMPANY_AIM_GAUGE";
                $scope.newWidget.sizeX = 4;
                $scope.newWidget.sizeY = 2;
                $scope.drawCompanyAimGauge("companyAimGauge", 0, 10, 100);
                $scope.renderNewWidget($scope.newWidget);
            };
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            $scope.updateCompanyAimWidget = function (item, pos) {

                SalesFunnelService.getDataSourceById(item.id).then(function (e) {
                    $scope.newWidget.dataSources[pos] = e;
                    $scope.drawCompanyAimGauge(
                        "companyAimGauge",
                        parseFloat($rootScope.getResolvedOneData($scope.newWidget.dataSources[0])),
                        parseFloat($rootScope.getResolvedOneData($scope.newWidget.dataSources[1])),
                        parseFloat($rootScope.getResolvedOneData($scope.newWidget.dataSources[2]))
                    );
                });
            };
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            $scope.addWidget = function () {
                logger.logSuccess($translate.instant('APP.COMMON.TOASTS.ADDED.SUCCESS'));

                widgetService.addWidget($scope.newWidget).then(function (e) {
                    $scope.currentDashboard.widgets.push(e);
                    widgetService.updateOneDashboard($scope.currentDashboard).then(function (e) {

                        widgetService.getAllDashboards().then(function (data) {
                            $scope.allDashboards = data;
                        });
                        // logger.logSuccess("Dashboard updated");
                    });
                });
            };
        }]);
