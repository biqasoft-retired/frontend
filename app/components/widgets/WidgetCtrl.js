'use strict';

angular.module('app.widgets.custom', ['ngRoute', 'LocalStorageModule'])

    .controller('CustomWidgetCreator', ['$scope', '$rootScope', 'configurationService', 'timeService', 'logger', 'SalesFunnelService', 'widgetService', '$compile', 'statsRepositoryService',
        'weatherRepositoryService', 'currencyExchangeRepositoryService', 'configurationServiceDate', '$translate',
        function ($scope, $rootScope, configurationService, timeService, logger,
                  SalesFunnelService, widgetService, $compile, statsRepositoryService, weatherRepositoryService, currencyExchangeRepositoryService, configurationServiceDate, $translate) {

            $scope.status = {};
            $scope.status.isFirstOpen1 = false;
            $scope.status.isFirstOpen2 = true;

            $scope.compiledWidget = false;

            $scope.widgetVer = 0;
            $scope.updateJsInstant = true;

            $scope.allDataSources = [];
            $scope.allWidgetsData = [];
            $scope.allDashboards = [];
            $scope.currentDashboard = {};


            $scope.widgetUpdateMode = false;



            SalesFunnelService.getAlldataSource().then(function (data) {
                $scope.allDataSources = data;
            });

            widgetService.getAllDashboards().then(function (e) {
                $scope.allDashboards = e;
                $scope.currentDashboard = e[0];
            });

            $scope.newWidget = {};
            $scope.newWidget.jsExec = "";
            $scope.newWidget.location = "DASHBOARD";

            $scope.newWidget.htmlTemplate = '<div class="col-md-12"> <section class="panel panel-box"> <div class="panel-left panel-item bg-reverse"> <p class="size-h4 ng-binding"> __NAME__  </p> </div> <div class="panel-right panel-item bg-success"> <p style="font-size: 4em;" class="ng-binding">  VAL   </p> <p class="text-muted" style="color: #ffffff"> </p> </div> </section> </div>';

            $scope.newTestTemplateForWidgetWithVer = "newTestTemplateForWidget" + $scope.widgetVer;

            $compile('<script type="text/ng-template" id="newTestTemplateForWidget' + $scope.widgetVer + '"> ' + $scope.newWidget.htmlTemplate + '</script>')($scope);
            $scope.compiledWidget = true;

            $scope.newWidget.templateController = "CUSTOM";

            $scope.editorOptions = {
                lineWrapping: true,
                lineNumbers: true,
                indentWithTabs: true,
                mode: 'htmlmixed',
                extraKeys: {
                    "Ctrl-Space": "autocomplete",
                    "F11": function (cm) {
                        cm.setOption("fullScreen", !cm.getOption("fullScreen"));
                    },
                    "Esc": function (cm) {
                        if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
                    }
                },
                viewportMargin: Infinity
            };

            // some examples / templates
            $scope.simpleRealTimeWidget = function () {
                $scope.widgetUpdateMode = false;
                $scope.newWidget.htmlTemplate = ' ';
                $scope.newWidget.jsExec = ' $scope.allWidgetsData["[[[id]]]"]=function(){ return new Date(); }';
                $scope.newWidget.htmlTemplate = '<div class="col-md-12"> <section class="panel panel-box"> <div class="panel-left panel-item bg-reverse"> <p class="size-h4 ng-binding"> <h1>Время в режиме реального времени</h1>  </p> </div> <div class="panel-right panel-item bg-success"> <p style="font-size: 4em;" class="ng-binding"> {{allWidgetsData["[[[id]]]"]() | date:"medium"  }} </p> <p class="text-muted" style="color: #ffffff"> </p> </div> </section> </div> ';
                $scope.dataSourceTestJS();
                $scope.updateWidget();
            };

            $scope.addWeatherForecastWidget = function () {
                $scope.widgetUpdateMode = false;
                $scope.newWidget.htmlTemplate = '<style>@font-face { font-family: "weather"; src: url("https://s3-us-west-2.amazonaws.com/s.cdpn.io/93/artill_clean_icons-webfont.eot"); src: url("https://s3-us-west-2.amazonaws.com/s.cdpn.io/93/artill_clean_icons-webfont.eot?#iefix") format("embedded-opentype"), url("https://s3-us-west-2.amazonaws.com/s.cdpn.io/93/artill_clean_icons-webfont.woff") format("woff"), url("https://s3-us-west-2.amazonaws.com/s.cdpn.io/93/artill_clean_icons-webfont.ttf") format("truetype"), url("https://s3-us-west-2.amazonaws.com/s.cdpn.io/93/artill_clean_icons-webfont.svg#artill_clean_weather_iconsRg") format("svg"); font-weight: normal; font-style: normal; } .currency{ font-size: 4em; font-weight: normal; font-style: normal; line-height: 1.0; } .aza { color: #fff; font-family: weather; font-size: 150px; font-weight: normal; font-style: normal; line-height: 1.0; } .icon-0:before { content: ":"; } .icon-1:before { content: "p"; } .icon-2:before { content: "S"; } .icon-3:before { content: "Q"; } .icon-4:before { content: "S"; } .icon-5:before { content: "W"; } .icon-6:before { content: "W"; } .icon-7:before { content: "W"; } .icon-8:before { content: "W"; } .icon-9:before { content: "I"; } .icon-10:before { content: "W"; } .icon-11:before { content: "I"; } .icon-12:before { content: "I"; } .icon-13:before { content: "I"; } .icon-14:before { content: "I"; } .icon-15:before { content: "W"; } .icon-16:before { content: "I"; } .icon-17:before { content: "W"; } .icon-18:before { content: "U"; } .icon-19:before { content: "Z"; } .icon-20:before { content: "Z"; } .icon-21:before { content: "Z"; } .icon-22:before { content: "Z"; } .icon-23:before { content: "Z"; } .icon-24:before { content: "E"; } .icon-25:before { content: "E"; } .icon-26:before { content: "3"; } .icon-27:before { content: "a"; } .icon-28:before { content: "A"; } .icon-29:before { content: "a"; } .icon-30:before { content: "A"; } .icon-31:before { content: "6"; } .icon-32:before { content: "1"; } .icon-33:before { content: "6"; } .icon-34:before { content: "1"; } .icon-35:before { content: "W"; } .icon-36:before { content: "1"; } .icon-37:before { content: "S"; } .icon-38:before { content: "S"; } .icon-39:before { content: "S"; } .icon-40:before { content: "M"; } .icon-41:before { content: "W"; } .icon-42:before { content: "I"; } .icon-43:before { content: "W"; } .icon-44:before { content: "a"; } .icon-45:before { content: "S"; } .icon-46:before { content: "U"; } .icon-47:before { content: "S"; }</style><section class="panel panel-default"> <div class="panel-heading"><span class="glyphicon glyphicon-th"></span> Прогноз погоды </div> <div class="panel-body text-center"> <div class="row"  ng-controller="DashboardCtrl"> <div ng-repeat="cast in weather.results.rss.channel.item.forecast"  class="col-md-12 col-lg-12"> <div> <section class="panel panel-box"> <div class="panel-left panel-item bg-reverse"> <p class="size-h4"> Max:  {{cast.high}} &deg;  </p> <p class="size-h4"> Min:  {{cast.low}}  &deg; </p> <p class="size-h4">  {{cast.day}}   </p> <p class="size-h4">  {{cast.date}}   </p> </div> <div class="panel-right panel-item bg-success"> <i class="aza icon-{{ cast.code }}"></i> <p class="text-muted" style="color: #ffffff"  >{{ cast.text }}</p> </div> </section> </div> </div> </div> </div></section>';
                $scope.newWidget.jsExec = ' function drawWeather  ( weathers ){ $scope.weather = weathers; } if (configurationServiceDate.onlineStatus.connectedToApiServer) { weatherRepositoryService.getWeatherByPlaceId(2052932).then(function (c) { drawWeather(c); }); }else{ drawWeather (  weatherRepositoryService.getWeatherByPlaceId(2052932)  ) }';
                $scope.dataSourceTestJS();
                $scope.updateWidget();
            };

            $scope.addCurrencyEurAndDollar = function () {
                $scope.widgetUpdateMode = false;
                $scope.newWidget.htmlTemplate = ' <div class="col-lg-12 col-md-12"> <section class="panel panel-default"> <div class="panel-heading"><span class="glyphicon glyphicon-th"></span>Курс валют</div> <div class="panel-body text-center"> <div class="row"  > <div class="col-md-6"> <div> <section class="panel panel-box"> <div class="panel-left panel-item bg-reverse"> <p class="size-h4"> USD / RUB  </p> <p class="size-h2">   {{ USDtoRUB.exchangeRate }} руб.   </p> </div> <div class="panel-right panel-item bg-success"> <i class="fa  fa-usd " style="font-size: 4em;" ></i> <p class="text-muted" style="color: #ffffff"  > </p> </div> </section> </div> </div> <div class="col-md-6"> <div> <section class="panel panel-box"> <div class="panel-left panel-item bg-reverse"> <p class="size-h4"> EUR / RUB </p> <p class="size-h2">   {{  EURtoRUB.exchangeRate}} руб.  </p> </div> <div class="panel-right panel-item bg-success"> <i class="fa  fa-eur "   style="font-size: 4em;"></i> <p class="text-muted" style="color: #ffffff"  >   </p> </div> </section> </div> </div> </div> </div></section> </div>';
                $scope.newWidget.jsExec = '   function drawCurrenciesDollar  ( cure ){ $scope.USDtoRUB = cure; }; function drawCurrenciesEuro  ( cure ){ $scope.EURtoRUB = cure; }; if (configurationServiceDate.onlineStatus.connectedToApiServer) { currencyExchangeRepositoryService.getExchangesRates("USD", "RUB").then(function (c) { drawCurrenciesDollar(c); }); }else{ drawCurrenciesDollar (  currencyExchangeRepositoryService.getExchangesRates("USD", "RUB")  ) } if (configurationServiceDate.onlineStatus.connectedToApiServer) { currencyExchangeRepositoryService.getExchangesRates("EUR", "RUB").then(function (c) { drawCurrenciesEuro(c); }); }else{ drawCurrenciesEuro (  currencyExchangeRepositoryService.getExchangesRates("EUR", "RUB")  ) }';

                $scope.dataSourceTestJS();
                $scope.updateWidget();
            };

            $scope.callerStatsWidgetNew = function () {
                $scope.widgetUpdateMode = false;
                $scope.newWidget.htmlTemplate = ' <style> #chartdiv { width: 100%; height: 500px; }</style> <div class="col-md-12"></div> <div class="col-md-6"> <section class="panel panel-default"> <div class="panel-heading"><span class="glyphicon glyphicon-th"></span> Всего звонков сделано сегодня</div> <div class="panel-body text-center"> <div id="chartdiv"></div> </div> </section> </div>  ';
                $scope.newWidget.jsExec = 'function drawCallerStats ( c ){ window.chart = AmCharts.makeChart("chartdiv", { "theme": "light", "type": "serial", "dataProvider": c, "valueAxes": [ { "title": "Сделано звонков, ШТ" } ], "graphs": [ { "balloonText": "Сделано звонков [[category]]:[[value]]", "fillAlphas": 1, "lineAlpha": 0.2, "title": "Calls", "type": "column", "valueField": "dataValue" } ], "depth3D": 20, "angle": 30, "rotate": true, "categoryField": "username", "categoryAxis": { "gridPosition": "start", "fillAlpha": 0.05, "position": "left" }, "exportConfig": { "menuTop": "20px", "menuRight": "20px", "menuItems": [ { "icon": "http://www.amcharts.com/lib/3/images/export.png", "format": "png" } ] } }); jQuery(".chart-input").off().on("input change", function () { var property = jQuery(this).data("property"); var target = chart; chart.startDuration = 0; if (property ===  "topRadius") { target = chart.graphs[0]; if (this.value ===  0) { this.value = undefined; } } target[property] = this.value; chart.validateNow(); }); }  drawCallerStats (  statsRepositoryService.getCallerStatsToday()  ) ';
                $scope.updateWidget();
                $scope.dataSourceTestJS();
            };

            $scope.dataSourceWidgetNew = function (dataSourceId) {
                $scope.widgetUpdateMode = false;
                $scope.currentDataSourceById = SalesFunnelService.getDataSourceById(dataSourceId).then(function (e) {
                    $scope.newWidget.jsExec = '$scope.allWidgetsData["[[[id]]]"]=[]; SalesFunnelService.getDataSourceById("' + e.id + '").then(function(data){$scope.allWidgetsData["[[[id]]]"] = data;});';
                    $scope.dataSourceTestJS();
                    $scope.newWidget.htmlTemplate = '<div class="col-md-12"> <section class="panel panel-box"> <div class="panel-left panel-item bg-reverse"> <p class="size-h4 ng-binding"> ' + e.name + '  </p> </div> <div class="panel-right panel-item bg-success"> <p style="font-size: 4em;" class="ng-binding"> {{allWidgetsData["[[[id]]]"].value  }} </p> <p class="text-muted" style="color: #ffffff"> </p> </div> </section> </div>';
                    $scope.updateWidget();
                });
            };

            $scope.updateWidgetToServer = function () {
                widgetService.updateWidget($scope.newWidget);
            };

            $scope.updateWidget = function () {
                $scope.compiledWidget = false;
                $scope.newWidget.htmlTemplate.replace("[[[id]]]", $scope.widgetVer);

                $scope.widgetVer++;
                $scope.newTestTemplateForWidgetWithVer = "newTestTemplateForWidget" + $scope.widgetVer;
                $compile('<script type="text/ng-template" id="newTestTemplateForWidget' + $scope.widgetVer + '"> ' + $scope.newWidget.htmlTemplate + '</script>')($scope);
                $scope.compiledWidget = true;
            };

            $scope.updateJSCodeOnChange = function () {
                if ($scope.updateJsInstant) eval($scope.newWidget.jsExec);
            };

            $scope.dataSourceTestJS = function () {
                $scope.newWidget.jsExec.replace("[[[id]]]", $scope.widgetVer);
                eval($scope.newWidget.jsExec);
                $scope.updateWidget();
            };

            $scope.addWidget = function () {
                logger.logSuccess($translate.instant('APP.COMMON.TOASTS.ADDED.SUCCESS'));
                $scope.newWidget.templateController = "CUSTOM";

                widgetService.addWidget($scope.newWidget).then(function (e) {
                    $scope.currentDashboard.widgets.push(e);
                    widgetService.updateOneDashboard($scope.currentDashboard).then(function (e) {
                        $scope.allDashboards = widgetService.getAllDashboards();
                        // logger.logSuccess("Dashboard updated");
                    });
                });
            }
        }]);
