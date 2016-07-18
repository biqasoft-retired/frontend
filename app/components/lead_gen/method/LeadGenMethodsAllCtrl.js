'use strict';

angular.module('app.leadGenMethod.methodsAll', ['ngRoute', 'LocalStorageModule'])

    .controller('AllLeadGenMethodsCtrl', ['$scope', '$rootScope', '$location', 'logger', 'LeadGenService', 'PaymentsService', 'hotkeys', 'SystemService', '$mdDialog', '$timeout', '$translate',
        function($scope, $rootScope, $location, logger, LeadGenService, PaymentsService, hotkeys, SystemService, $mdDialog, $timeout, $translate) {

            $scope.allLeadGenMethodsPromise = LeadGenService.getAllLeadGenMethods();

            $scope.viewTypes = [
                {name: $translate.instant('APP.VIEW_TYPES.CARDS'), value: 'cards'},
                {name: $translate.instant('APP.VIEW_TYPES.TABLE'), value: 'table'}
            ];
            
            $scope.viewType = $scope.viewTypes[0];

            $scope.newProject = {};

            $scope.allLeadGenMethodsIndicators = [];
            $scope.allLeadGenMethods = [];

            $scope.sameSise = function() {
                var sameHeightTop = $(".modify_parent");
                if (sameHeightTop.length !== 0) {
                    sameHeightTop.each(function() {
                        var tallest = 0;
                        var sameHeightChildren = $(this).find(".modify_child");
                        sameHeightChildren.each(function() {
                            var thisHeight = $(this).height();
                            if (thisHeight > tallest) {
                                tallest = thisHeight;
                            }
                        });
                        sameHeightChildren.height(tallest);
                    });
                }
            };

            $scope.allLeadGenMethodsPromise.then(function(e) {
                $scope.allLeadGenMethods = e;

                for (var i = 0; i < $scope.allLeadGenMethods.length; i++) {
                    $scope.allLeadGenMethodsIndicators[$scope.allLeadGenMethods[i].id] = $scope.allLeadGenMethods[i].cachedKPIsData;
                }
            });

            $scope.updateSize = setInterval($scope.sameSise, 2000);

            $rootScope.$on("$locationChangeStart", function() {
                clearInterval($scope.updateSize);
            });

            $scope.getKPIByLeadGenMethodId = function(id) {
                return $scope.allLeadGenMethodsIndicators[id];
            };

            $scope.downloadFileExcel2 = function() {
                var objectSend = $scope.leadenExcelBuilder;
                objectSend.usePagination = false;
                logger.logSuccess("Файл скоро будет загружен. Это может занять несколько минут.");

                LeadGenService.getExcelByFilter(objectSend).then(function(data) {
                    $rootScope.downloadFile(
                        {
                            file: data, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                            filename: 'Методы продаж от ' + $rootScope.printDate(new Date()) + '.xlsx'
                        })
                })
            };

            $scope.leadenExcelBuilder = {};
            $scope.downloadFileExcel = function(ev) {
                $mdDialog.show({
                    controller: 'AllLeadGenMethodsCtrl',
                    templateUrl: 'dialog1.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose:true
                })
                    .then(function(answer) {
                        $scope.downloadFileExcel2();
                        console.log("qqq");

                        //$scope.status = 'You said the information was "' + answer + '".';
                    }, function() {
                        $scope.status = 'You cancelled the dialog.';
                    });
            };

            ////////////////// ADD NEW BUTTON ////////////////////////

            $scope.addNewProject = function() {
                var project = $scope.newProject;

                if (isUndefinedOrNull(project.name) || !project.name || project.name.length === 0) {
                    project.name = "Новый метод";
                }

                LeadGenService.addNewLeadGenMethods(project).then(function(e) {
                    logger.logSuccess("Глобальный Метод лидгена добавлен ! ");

                    var leadGenProject = {};

                    leadGenProject.name = "Первый проект в методе лидгена " + e.name + " !";
                    leadGenProject.leadGenMethodId = e.id;

                    LeadGenService.addNewLeadGenProject(leadGenProject).then(function(f) {
                        logger.logSuccess("Автоматически создан первый проект в данном методе лидгена!");

                            $location.path('/marketing/lead_gen_methods/id/' + e.id);

                    });
                });
            };

            hotkeys.add({
                combo: 'shit+N',
                description: '',
                callback: function() {
                    $scope.addNewProject();
                }
            });
        }]);
