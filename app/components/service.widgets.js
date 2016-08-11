'use strict';

angular.module('app.services.widget', ['LocalStorageModule', 'ngRoute', 'app.services'])

    .service('widgetContextHolder', [function () {
        var self = this;
        self.templates = {};
    }])

    .service('widgetDashboardService', ['$http', 'widgetContextHolder',
        'weatherRepositoryService', 'currencyExchangeRepositoryService', 'statsRepositoryService', 'customerService',
        '$compile', '$injector', '$timeout', 'widgetService', 'SalesFunnelService', 'timeService', 'logger', 'analyticsService', 'chartsService',
        '$templateCache', 'PaymentsService', '$translate',
        function ($http, widgetContextHolder,
                  weatherRepositoryService, currencyExchangeRepositoryService,
                  statsRepositoryService, customerService, $compile, $injector,
                  $timeout, widgetService, SalesFunnelService, timeService, logger, analyticsService,
                  chartsService, $templateCache, PaymentsService, $translate) {

            var self = this;

            self.allTemplatesResolved = false;
            self.resolvedWidgetTemplates = 0;
            self.allWidgetTemplatesNumber = 0;

            if (!widgetContextHolder.templates) {
                widgetContextHolder.templates = {};
            }

            self.checkThatAllWidgetsDownloaded = function () {
                if (self.resolvedWidgetTemplates === self.allWidgetTemplatesNumber) {
                    self.allTemplatesResolved = true;
                }
            };

            /**
             * get all html widget templates and put to _widgetContextHolder.templates
             */
            this.resolveTemplates = function () {
                var allWidgetsTemplatesName = SalesFunnelService.allWidgetsTemplates;
                self.allWidgetTemplatesNumber = allWidgetsTemplatesName.length;

                for (var ir = 0; ir < self.allWidgetTemplatesNumber; ir++) {
                    (function () {
                        var _self = self;
                        var _widgetContextHolder = widgetContextHolder;
                        var widgetForTemplate = allWidgetsTemplatesName[ir];

                        if ($templateCache.get(widgetForTemplate.url)) {
                            _widgetContextHolder.templates[widgetForTemplate.name] = $templateCache.get(widgetForTemplate.url);
                            _self.resolvedWidgetTemplates++;

                            self.checkThatAllWidgetsDownloaded();
                        } else {

                            $http.get(widgetForTemplate.url).success(function (data, status, headers, config) {
                                _widgetContextHolder.templates[widgetForTemplate.name] = data;
                                _self.resolvedWidgetTemplates++;

                                self.checkThatAllWidgetsDownloaded();
                            }).error(function (data, status, headers, config) {
                            });
                        }
                    })();
                }
            };
            this.resolveTemplates();

            this.renderWidgetFromDashboard = function ($scope, currentWidget, callbackOnSuccess) {

                // this is first call
                if (isUndefinedOrNullOrEmpty($scope.widgetsInitiated)) {
                    $scope.drawCompanyAimGauge = chartsService.drawGauge;
                    $scope.drawColdCallResult = chartsService.drawColdCallResult;
                    $scope.drawColumnChart = chartsService.drawColumnChart;
                    $scope.drawPieChart = chartsService.drawPieChart;
                    $scope.drawMangerMapyments = chartsService.drawBubbleChart;
                    $scope.drawBarChart = chartsService.drawBarChart;
                    $scope.widgetsInitiated = true;
                }

                if (!self.allTemplatesResolved) {
                    $timeout(function () {
                        console.warn("Retry draw widget", currentWidget, self);
                        self.renderWidgetFromDashboard($scope, currentWidget, callbackOnSuccess);
                    }, 350);
                    return;
                }

                var templateHTML = null;

                if (!$scope.allWidgetsData) {
                    $scope.allWidgetsData = [];
                }

                switch (currentWidget.templateController) {
                    //
                    case "DATA_SOURCE_ONE_DATA":
                        for (var parLength = 0; parLength < currentWidget.additionalData.length; parLength++) {
                            if (currentWidget.additionalData[parLength].name === "style") var styleId = currentWidget.additionalData[parLength].value;
                        }

                        switch (styleId) {
                            case "1":
                                templateHTML = widgetContextHolder.templates.DATA_SOURCE_ONE_DATA_STYLE1;
                                break;

                            case "2":
                                templateHTML = widgetContextHolder.templates.DATA_SOURCE_ONE_DATA_STYLE2;
                                break;
                        }

                        templateHTML = templateHTML.replaceAll("|currentWidget|", currentWidget.id);
                        $compile('<script type="text/ng-template" id="' + currentWidget.id + '"> ' + templateHTML + '</script>')($scope);

                        $scope.allWidgetsData[currentWidget.id] = {};

                        $scope.allWidgetsData[currentWidget.id].demo = currentWidget.demo;
                        $scope.allWidgetsData[currentWidget.id].dataSource = currentWidget.dataSources[0];
                        $scope.allWidgetsData[currentWidget.id].widgetName = currentWidget.name;
                        $scope.allWidgetsData[currentWidget.id].demo = currentWidget.demo;

                        break;

                    case "DATA_SOURCE_COMPLEX_DATA":

                        for (var parLength = 0; parLength < currentWidget.additionalData.length; parLength++) {
                            if (currentWidget.additionalData[parLength].name === "style") var styleId = currentWidget.additionalData[parLength].value;
                        }

                        switch (styleId) {
                            case "1":
                                templateHTML = widgetContextHolder.templates.DATA_SOURCE_COMPLEX_DATA_PIE;
                                templateHTML = templateHTML.replaceAll("|currentWidget|", currentWidget.id);
                                $compile('<script type="text/ng-template" id="' + currentWidget.id + '"> ' + templateHTML + '</script>')($scope);

                                (function () {
                                    var widgetId = currentWidget.id;
                                    var widget = currentWidget;

                                    $scope.drawPieChart(
                                        widgetId + "-chart",
                                        SalesFunnelService.translateDataSourcesArrayToHighchartsSeries(widget.dataSources),
                                        {
                                            "titleChart": widget.name,
                                            dataSources: widget.dataSources,
                                            delay: 300
                                        }
                                    );

                                    $scope.allWidgetsData[widgetId] = {};
                                    $scope.allWidgetsData[widgetId].widgetName = widget.name;
                                    $scope.allWidgetsData[widgetId].demo = widget.demo;
                                })();
                                break;

                            case "2":

                                templateHTML = widgetContextHolder.templates.DATA_SOURCE_COMPLEX_DATA_COLUMN;
                                templateHTML = templateHTML.replaceAll("|currentWidget|", currentWidget.id);
                                $compile('<script type="text/ng-template" id="' + currentWidget.id + '"> ' + templateHTML + '</script>')($scope);

                                (function () {
                                    var widgetId = currentWidget.id;
                                    var widget = currentWidget;

                                    $scope.drawColumnChart(
                                        widgetId + "-chart",
                                        SalesFunnelService.translateDataSourcesArrayToHighchartsSeries(widget.dataSources),
                                        {
                                            dataSources: widget.dataSources,
                                            delay: 300
                                        }
                                    );

                                    $scope.allWidgetsData[widgetId] = {};
                                    $scope.allWidgetsData[widgetId].widgetName = widget.name;
                                    $scope.allWidgetsData[widgetId].demo = widget.demo;
                                })();
                                break;
                        }
                        break;

                    //
                    case "TASKS_MINI":

                        templateHTML = widgetContextHolder.templates.TASKS_MINI;
                        templateHTML = templateHTML.replaceAll("|currentWidget|", currentWidget.id);
                        $compile('<script type="text/ng-template" id="' + currentWidget.id + '"> ' + templateHTML + '</script>')($scope);
                        $scope.allWidgetsData[currentWidget.id] = {};
                        $scope.allWidgetsData[currentWidget.id].widgetName = currentWidget.name;
                        break;

                    //
                    case "LEADS_LASTS":

                        templateHTML = widgetContextHolder.templates.LEADS_LASTS;
                        templateHTML = templateHTML.replaceAll("|currentWidget|", currentWidget.id);
                        $compile('<script type="text/ng-template" id="' + currentWidget.id + '"> ' + templateHTML + '</script>')($scope);
                        break;

                    //
                    case "IFRAME":
                        if (!currentWidget.additionalData) {
                            logger.logError($translate.instant('WIDGETS.ERROR.IFRAME.ERROR.NO_URL'));
                            return;
                        }
                        var url = null;
                        var iframe_styles = null;
                        for (var parLength = 0; parLength < currentWidget.additionalData.length; parLength++) {
                            if (currentWidget.additionalData[parLength].name === "url")  url = currentWidget.additionalData[parLength].value;
                            if (currentWidget.additionalData[parLength].name === "iframe_styles")  iframe_styles = currentWidget.additionalData[parLength].value;
                        }

                        templateHTML = widgetContextHolder.templates.IFRAME;
                        templateHTML = templateHTML.replaceAll("|currentWidget|", currentWidget.id);
                        $compile(' <script type="text/ng-template" id="' + currentWidget.id + '"> ' + templateHTML + '</script>')($scope);
                        $scope.allWidgetsData[currentWidget.id] = {};
                        $scope.allWidgetsData[currentWidget.id].url = url;
                        $scope.allWidgetsData[currentWidget.id].iframe_styles = iframe_styles;
                        break;

                    //
                    case "CUSTOM":
                        $compile(' <script type="text/ng-template" id="' + currentWidget.id + '"> ' + currentWidget.htmlTemplate + '</script>')($scope);
                        break;

                    //
                    case "COLD_CALL":

                        templateHTML = widgetContextHolder.templates.COLD_CALL;
                        templateHTML = templateHTML.replaceAll("|currentWidget|", currentWidget.id);
                        $compile(' <script type="text/ng-template" id="' + currentWidget.id + '"> ' + templateHTML + '</script>')($scope);

                        (function () {
                            var widgetId = currentWidget.id;

                            $scope.allCallStatsToday = analyticsService.getCallStatsToday().then(function (eee) {
                                var allUserNames = [];
                                var successCalls = [];
                                var failedCalls = [];
                                var noCalls = [];
                                var allCalls = [];

                                for (var i = 0; i < eee.length; i++) {
                                    if (eee.userAccount != null) {
                                        allUserNames.push(eee.userAccount.firstname + " " + eee.userAccount.lastname + "( " + eee.userAccount.username + " )");
                                    } else {
                                        allUserNames.push($translate.instant('CUSTOMER.COMMON.NO_RESPONSIBLE'));
                                    }

                                    successCalls.push(eee.successCalls);
                                    failedCalls.push(eee.failedCalls);
                                    noCalls.push(eee.noCalls);
                                    allCalls.push(eee.allCalls);
                                }

                                $scope.drawColdCallResult(widgetId + "-chart", allUserNames, successCalls, failedCalls, noCalls, allCalls);
                            });
                        })();

                        $scope.allWidgetsData[currentWidget.id] = {};
                        $scope.allWidgetsData[currentWidget.id].widgetName = currentWidget.name;
                        break;

                    //
                    case "COMPANY_AIM_GAUGE":

                        templateHTML = widgetContextHolder.templates.COMPANY_AIM_GAUGE;
                        templateHTML = templateHTML.replaceAll("|currentWidget|", currentWidget.id);
                        $compile(' <script type="text/ng-template" id="' + currentWidget.id + '"> ' + templateHTML + '</script>')($scope);

                        (function () {
                            var widgetId = currentWidget.id;
                            var widget = currentWidget;
                            var resolvedDataSources = 0;

                            if (resolvedDataSources === widget.dataSources.length) {

                                $scope.drawCompanyAimGauge(
                                    widgetId + "-chart",
                                    parseFloat(widget.dataSources[0].value),
                                    parseFloat(widget.dataSources[1].value),
                                    parseFloat(widget.dataSources[2].value),
                                    {dataSources: widget.dataSources}
                                );
                            }

                            $scope.allWidgetsData[widgetId] = {};
                            $scope.allWidgetsData[widgetId].widgetName = widget.name;
                        })();

                        break;

                    //
                    case "MANAGER_LEADS_CUSTOMERS_BAR":

                        templateHTML = widgetContextHolder.templates.MANAGER_LEADS_CUSTOMERS_BAR;
                        templateHTML = templateHTML.replaceAll("|currentWidget|", currentWidget.id);
                        $compile('<script type="text/ng-template" id="' + currentWidget.id + '"> ' + templateHTML + '</script>')($scope);

                        (function () {
                            var widgetId = currentWidget.id;

                            analyticsService.getManagerCreatedByCustomerAndLeads(currentWidget.biqaClassBuilderAbstract).then(function (e) {
                                var leads = [];
                                var customers = [];
                                var managers = [];

                                for (var b = 0; b < e.length; b++) {
                                    var currentManager = e[b];

                                    leads.push(parseFloat(currentManager.leadsNumber));
                                    customers.push(parseFloat(currentManager.customersNumber));
                                    managers.push(currentManager.userAccount);
                                }

                                var series = [];
                                series[0] = {"name": $translate.instant('WIDGETS.MANAGER_LEADS_CUSTOMERS_BAR.LEADS'), "data": leads};
                                series[1] = {"name": $translate.instant('WIDGETS.MANAGER_LEADS_CUSTOMERS_BAR.CUSTOMERS'), "data": customers};

                                var params = {};
                                params.title = "";
                                params.subtitle = " ";
                                params.yAxisText = $translate.instant('WIDGETS.MANAGER_LEADS_CUSTOMERS_BAR.LEADS_AND_CUSTOMERS_NUMBER');
                                params.userAccountLinks = true;
                                params.delay = 300;

                                $scope.drawBarChart(widgetId + "-chart", managers, series, params);
                            });
                        })();

                        $scope.allWidgetsData[currentWidget.id] = {};
                        $scope.allWidgetsData[currentWidget.id].widgetName = currentWidget.name;

                        break;

                    case "MANAGER_PAYMENTS_BUBBLE":

                        templateHTML = widgetContextHolder.templates.MANAGER_PAYMENTS_BUBBLE;
                        templateHTML = templateHTML.replaceAll("|currentWidget|", currentWidget.id);
                        $compile(' <script type="text/ng-template" id="' + currentWidget.id + '"> ' + templateHTML + '</script>')($scope);

                        (function () {
                            var widgetId = currentWidget.id;
                            var data = {};

                            PaymentsService.getAllManagerStatsFromBuilder(data).then(function (eee) {
                                var series = [];

                                for (var i = 0; i < eee.length; i++) {
                                    var ser = {};
                                    ser.data = [];
                                    var managerAmountAll = 0;

                                    for (var b = 0; b < eee[i].customerDeals.length; b++) {
                                        var serDataArr = [i, b, eee[i].customerDeals[b].amount];
                                        managerAmountAll += parseFloat(eee[i].customerDeals[b].amount);
                                        ser.data.push(serDataArr);
                                    }

                                    if (eee[i].userAccount != null) {
                                        ser.name = eee[i].userAccount.firstname + " " + eee[i].userAccount.lastname + "( " + eee[i].userAccount.username + " ) | " + managerAmountAll;
                                    } else {
                                        ser.name = $translate.instant('CUSTOMER.COMMON.NO_RESPONSIBLE') + " | " + managerAmountAll;
                                    }

                                    series.push(ser);
                                }

                                var params = {};
                                params.delay = 300;

                                $scope.drawMangerMapyments(widgetId + "-chart", series, params);
                            });
                        })();

                        $scope.allWidgetsData[currentWidget.id] = {};
                        $scope.allWidgetsData[currentWidget.id].widgetName = currentWidget.name;

                        break;

                    case "MANAGER_PAYMENTS_PIE":

                        templateHTML = widgetContextHolder.templates.MANAGER_PAYMENTS_BUBBLE;
                        templateHTML = templateHTML.replaceAll("|currentWidget|", currentWidget.id);
                        $compile(' <script type="text/ng-template" id="' + currentWidget.id + '"> ' + templateHTML + '</script>')($scope);

                        (function () {
                            var widgetId = currentWidget.id;
                            var data = {};

                            $scope.allCallStatsToday = PaymentsService.getAllManagerStatsFromBuilder(data).then(function (e) {
                                var series = [];

                                for (var i = 0; i < e.length; i++) {
                                    var ser = [];
                                    var managerAmountAll = 0;

                                    for (var b = 0; b < e[i].customerDeals.length; b++) {
                                        managerAmountAll += parseFloat(e[i].customerDeals[b].amount);
                                    }

                                    if (e[i].userAccount != null) {
                                        ser = [$rootScope.printUser(e[i].userAccount) + managerAmountAll, managerAmountAll];
                                    } else {
                                        ser = [$translate.instant('CUSTOMER.COMMON.NO_RESPONSIBLE') + " | " + managerAmountAll, managerAmountAll];
                                    }

                                    series.push(ser);
                                }

                                var params = {};
                                params.delay = 300;

                                $scope.drawPieChart(widgetId + "-chart", series, params);
                            });
                        })();

                        $scope.allWidgetsData[currentWidget.id] = {};
                        $scope.allWidgetsData[currentWidget.id].widgetName = currentWidget.name;
                        break;

                    //
                    default :
                        logger.logWarning($translate.instant('WIDGETS.NO_SUCH_CONTROLLER.TOAST') + ":" + +currentWidget.templateController + "  " + $translate.instant('WIDGETS.NO_SUCH_CONTROLLER_IN_WIDGET.TOAST') + currentWidget.name);
                        break;
                }

                //additionalData
                if (currentWidget.jsExec != null && currentWidget.location != "BACKGROUND") {
                    eval(currentWidget.jsExec);
                }

                if (callbackOnSuccess && typeof callbackOnSuccess === 'function') {
                    callbackOnSuccess();
                }

            };

        }]);
