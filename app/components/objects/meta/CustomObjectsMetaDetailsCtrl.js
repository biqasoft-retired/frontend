'use strict';

angular.module('app.custom.objects.meta')
    
    .controller('CustomObjectsMetaDetailsCtrl', ['$scope', '$rootScope', '$route', 'logger', 'companyService', 'SystemService',
        'UserService', 'customObjectsService', '$window', '$location', 'SweetAlert',
        function ($scope, $rootScope, $route, logger, companyService, SystemService, UserService, customObjectsService, $window, $location, SweetAlert) {

            $scope.currentCompanyId = $route.current.params.id;

            $scope.currentCompany = {};
            $scope.$window = $window;

            $scope.defaultOptions = {};
            $scope.defaultOptions.editableFields = false;

            $scope.showTemplates = false;

            $scope.definerUnsafe = function (param) {
                var beforeTimes = 0;
                if (param && param.beforeTimes) beforeTimes = param.beforeTimes;
                return $rootScope.defineUnsavedData($scope, 'currentCompany', {
                    autoSaveFunction: function () {
                    },
                    timesBefore: beforeTimes
                });
            };

            customObjectsService.getCustomObjectsMetaById($scope.currentCompanyId).then(function (response) {
                    $scope.currentCompany = response;
                    $scope.definerUnsafe();
                    $rootScope.title = response.name || $rootScope.printEmptyField();
                }
            );

            $scope.printableTypes = [
                {name: "handlebars", value: "HANDLEBARS"}
            ];

            $scope.deleteObjectPrntableTemplate = function (index) {
                $scope.currentCompany.printableTemplates.splice(index, 1);
            };

            $scope.updateCompany = function (e) {
                customObjectsService.updateCustomObjectMeta($scope.currentCompany).then(function (response) {
                    $scope.currentCompany = response;
                });
                logger.logSuccess("Данные об объекте успешно обновлены!");
                $rootScope.hasUnsavedEdits = false;
            };

            $scope.deleteConfirmation = function (obj) {
                SweetAlert.swal({
                        title: "Удалить объект?",
                        text: "Объект " + $scope.currentCompany.name + " с Id " + $scope.currentCompany.id + " будет безвозвратно удалён",
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
                            SweetAlert.swal("Удалён");

                            customObjectsService.deleteCustomObjectMeta(obj).then(function (data) {
                                logger.logError("Удалено");
                                $location.path('/objects/custom/meta/all');
                            })

                        } else {
                            SweetAlert.swal("Отмена", "error");
                        }
                    }
                )
            };

            CodeMirror.defineMode("mustache", function (config, parserConfig) {
                var mustacheOverlay = {
                    token: function (stream, state) {
                        var ch;
                        if (stream.match("{{")) {
                            while ((ch = stream.next()) != null)
                                if (ch == "}" && stream.next() == "}") {
                                    stream.eat("}");
                                    return "mustache";
                                }
                        }
                        while (stream.next() != null && !stream.match("{{", false)) {
                        }
                        return null;
                    }
                };
                return CodeMirror.overlayMode(CodeMirror.getMode(config, parserConfig.backdrop || "text/html"), mustacheOverlay);
            });

            $scope.editorOptions = {
                lineWrapping: true,
                lineNumbers: true,
                indentWithTabs: true,
                mode: 'mustache',
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


            $scope.addNewPrintableTemplate = function () {
                var newTemplate = {};
                newTemplate.type = "HANDLEBARS";
                newTemplate.mimeType = "text/html";
                $scope.currentCompany.printableTemplates.push(newTemplate);
            };

        }]);
