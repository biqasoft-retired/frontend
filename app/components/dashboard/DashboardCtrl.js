(function () {
    'use strict';
    angular.module('app.dashboard', [])
        .controller('DashboardCtrl', ['$scope', '$rootScope', '$injector', '$timeout', 'widgetService', 'logger', 'widgetDashboardService', '$mdDialog', 'chartsService', '$templateCache',
            function ($scope, $rootScope, $injector, $timeout, widgetService, logger, widgetDashboardService, $mdDialog, chartsService, $templateCache) {

                console.info("Dashboard ctrl start");
                var self = this;

                $scope.state = {};
                $scope.state.editMode = false;

                /////////////////////////////////////////////////////////////////////////////
                $scope.drawCompanyAimGauge = chartsService.drawGauge;
                $scope.drawColdCallResult = chartsService.drawColdCallResult;
                $scope.drawColumnChart = chartsService.drawColumnChart;
                $scope.drawPieChart = chartsService.drawPieChart;
                $scope.drawMangerMapyments = chartsService.drawBubbleChart;
                /////////////////////////////////////////////////////////////////////////////

                $scope.allWidgetsData = [];

                // reference for editable widget in modal window in `editWidgetAction()`
                $scope.currentEditableWidget = null;

                $scope.rerenderDashboardOnSelect = true;
                $scope.settingsShow = false;

                $scope.currentDashboard = {};

                $scope.paneConfig = {
                    verticalDragMinHeight: 40
                };

                /**
                 *
                 * @param name
                 * @returns {boolean} true if angular have cached template by name
                 */
                $scope.haveCachedTemplate = function (name) {
                    if ($templateCache.get(name)) return true;
                    return false;
                };

                $scope.editWidgetAction = function (widget, ev) {
                    $scope.currentEditableWidget = widget;
                    $mdDialog.show({
                        scope: $scope,
                        preserveScope: true,
                        templateUrl: 'app/components/widgets/modal/edit_widget.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose: true
                    })
                        .then(function (answer) {
                        }, function () {
                        });
                };

                $scope.gridsterOpts = {
                    isMobile: true,
                    swapping: true,

                    columns: 30, // the width of the grid, in columns

                    width: 'auto', // can be an integer or 'auto'. 'auto' scales gridster to be the full width of its containing element
                    colWidth: 'auto', // can be an integer or 'auto'.  'auto' uses the pixel width of the element divided by 'columns'
                    //rowHeight: 'match', // can be an integer or 'match'.  Match uses the colWidth, giving you square widgets.
                    rowHeight: '30', // can be an integer or 'match'.  Match uses the colWidth, giving you square widgets.

                    margins: [20, 20],
                    outerMargin: false,
                    pushing: true,
                    floating: true,
                    draggable: {
                        enabled: false
                    },
                    resizable: {
                        enabled: false,
                        handles: ['n', 'e', 's', 'w', 'se', 'sw']
                    }
                };

                /////////////////////////////////////////////////////////////////////////////
                $scope.settingsShowSelected = function () {
                    $scope.state.editMode = !$scope.state.editMode;
                    if ($scope.state.editMode) {
                        $scope.gridsterOpts.draggable.enabled = true;
                        $scope.gridsterOpts.resizable.enabled = true;

                        $scope.gridsterOpts.resizable.stop = function (event, $element, widget) {
                            self.renderWidgetFromDashboard(widget);
                        };

                    } else {
                        $scope.gridsterOpts.draggable.enabled = false;
                        $scope.gridsterOpts.resizable.enabled = false;
                    }
                };

                /////////////////////////////////////////////////////////////////////////////
                // TODO: if we want to show only first(one) dashboard - we can load from server only one, not all widgets
                self.resolveAllWidgetsFunction = function () {
                    widgetService.getAllDashboards().then(function (e) {
                        if (e.length > 0) {
                            // draw only first
                            self.renderDashboard(e[0]);
                        }

                        $scope.resolvedWidgets = true;
                        $scope.allDashboards = e;


                    });
                };

                self.renderWidgetFromDashboard = function (widget) {
                    widgetDashboardService.renderWidgetFromDashboard($scope, widget);
                };

                self.renderDashboard = function (currentDashboard) {
                    if ($scope.currentDashboard.id != currentDashboard.id) {
                        $scope.currentDashboard = currentDashboard;
                    }

                    for (var j = 0; j < currentDashboard.widgets.length; j++) {
                        self.renderWidgetFromDashboard(currentDashboard.widgets[j]);
                    }
                };

                /**
                 * this function have 300ms delay to draw
                 * because widgets with canvas (like all Highcharts graphics) should know their
                 * DOM height and width to draw correctly
                 * this is dirty hack
                 * @param dashboard
                 */
                $scope.widgetTabSelected = function (dashboard) {
                    $scope.currentDashboard = dashboard;
                    (function () {
                        var curDash = dashboard;
                        $timeout(function () {
                            if ($scope.rerenderDashboardOnSelect) self.renderDashboard(curDash);
                        }, 300);
                    })();
                };


                $scope.updateAllDashBoards = function () {
                    $scope.settingsShowSelected();
                    logger.logSuccess("Все Dashboards обновлены!");
                    widgetService.updateAllDashBoards($scope.allDashboards);
                };

                $scope.addNewDashboard = function () {
                    logger.logSuccess(" Новый Dashboard обновлен!");
                    var v = {};
                    widgetService.addNewDashboard(v).then(function (e) {
                        $scope.allDashboards.push(e);
                    });
                };

                $scope.deleteWidgetById = function (id, dashboard, index) {
                    dashboard.splice(index, 1);
                    widgetService.deleteWidgetById(id);
                    logger.logSuccess("Виджет удален!");
                };

                $scope.deleteDashboardById = function (dashboard, allDashboards, index) {
                    widgetService.deleteDashboardById(dashboard.id);

                    //if ($scope.allDashboards.length > 1){
                    //    $scope.widgetTabSelected($scope.allDashboards[0]);
                    //}

                    $scope.allDashboards.splice(index, 1);
                    logger.logSuccess("Dashboard удален!");
                };

                // dirty hack to work with  highcharts graphics
                // after we came from another page
                // and don't have DOM 'OK'
                $timeout(self.resolveAllWidgetsFunction, 100);

            }])
}).call(this);
