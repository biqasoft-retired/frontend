'use strict';
angular.module('app.bpmn', ['ngRoute', 'LocalStorageModule', 'ngMaterial'])

    .service('BPMNCodeExecutorService', ['logger', '$timeout', 'localStorageService', 'widgetService', '$translate', '$rootScope', '$injector',
        function (logger, $timeout, localStorageService, widgetService, $translate, $rootScope, $injector) {
            var self = this;
            self.clientSideExecutorErrors = [];

            self.executeClientSideCode = function (data) {
                try {
                    eval(data.jsExec);
                } catch (err) {
                    self.clientSideExecutorErrors.push(err);
                    logger.logError($translate.instant('APP.INTERNAL.WIDGETS.BACKGROUND.ERROR_LOADING') + ': ' + data.id + ' ' + err);
                    console.warn("Error background widget", data, err);
                }
            };

            self.executeFirstRunCode = function () {
                // disable background widget
                // to load page if we have widgets
                // that fail page to load
                if (localStorageService.get('disableBackgroundWidgets') === 'true') {
                    logger.logWarning($translate.instant('APP.INTERNAL.WIDGETS.BACKGROUND.DISABLE'));
                } else {
                    widgetService.getAllBackgroundWidgets().then(function (e) {
                        for (var i = 0; i < e.length; i++) {
                            var widget = e[i];
                            if (!isUndefinedOrNullOrEmpty(widget.jsExec) && widget.enabled) {
                                self.executeClientSideCode(widget);
                            }
                        }
                    });
                }
            };

        }])

    .controller('bpmnEditorIDECtrl', ['$scope', '$rootScope', 'bpmnService', 'logger', 'BPMNCodeExecutorService', 'widgetService',
        function ($scope, $rootScope, bpmnService, logger, BPMNCodeExecutorService, widgetService) {

            $scope.executeRequest = {};
            $scope.executeRequest.code = " function plusOneToNumber(a) {return a+1}; \n\n //expect 5 as script result\n plusOneToNumber(4);";

            $scope.clientSideCode = {};
            $scope.clientSideCode.location = "BACKGROUND";
            $scope.clientSideCode.jsExec = "var currentUserPretty = 'Hello,'+ $rootScope.printUser($rootScope.currentUser); \rlogger.logWarning(currentUserPretty); \rlogger.logSuccess($rootScope.printDate(new Date()));";

            $scope.result = {};
            $scope.lastClientSideExecuterError = {};
            $scope.lastClientSideExecuterError.error = "";

            $scope.execute = function () {
                bpmnService.executeJavaScriptRaw($scope.executeRequest.code).then(function (data) {
                    $scope.result = data;
                });
            };

            $scope.allBackgroundWidgetsMy = [];
            widgetService.getAllBackgroundWidgets().then(function (data) {
                $scope.allBackgroundWidgetsMy = data;
            });

            $scope.executeJsCode = function () {
                var allExecutionsError = BPMNCodeExecutorService.clientSideExecutorErrors;
                var isError = angular.copy(allExecutionsError.length);

                BPMNCodeExecutorService.executeClientSideCode($scope.clientSideCode);

                if (allExecutionsError.length > 0) {
                    if (allExecutionsError.length === isError) {
                        $scope.lastClientSideExecuterError.error = "";
                    } else {
                        $scope.lastClientSideExecuterError.error = allExecutionsError[allExecutionsError.length - 1].toString();
                    }
                }
            };

            $scope.updateWidgetToServer = function () {
                widgetService.updateWidget($scope.clientSideCode);
            };

            $scope.addClientSideWidget = function () {
                widgetService.addWidget($scope.clientSideCode).then(function (e) {
                    $scope.clientSideCode.id = e.id;
                    logger.logSuccess("Added");
                    $scope.allBackgroundWidgetsMy.push(e);
                });
            };

            $scope.editorOptions = {
                lineWrapping: true,
                lineNumbers: true,
                indentWithTabs: true,
                mode: 'javascript',
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

        }])

    .controller('bpmnDeveloperCtrl', ['$scope', '$rootScope', 'bpmnService', 'logger',
        function ($scope, $rootScope, bpmnService, logger) {

            $scope.executeRequest = {};
            $scope.executeRequest.code = " function plusOneToNumber(a) {return a+1}; \n\n //expect 5 as script result\n plusOneToNumber(4);";

            $scope.result = {};

            $scope.execute = function () {
                bpmnService.executeJavaScriptRaw($scope.executeRequest.code).then(function (data) {
                    $scope.result = data;
                });
            };

            $scope.editorOptions = {
                lineWrapping: true,
                lineNumbers: true,
                indentWithTabs: true,
                mode: 'javascript',
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

        }])


;

