'use strict';

angular.module('app.task.all', ['ngRoute', 'LocalStorageModule'])

    .controller('TasksDetailsCtrl', ['$scope', '$rootScope', '$route', 'timeService', '$location', '$filter', 'TaskService', 'logger', 'SweetAlert', 'TaskStatisticService',
        function ($scope, $rootScope, $route, timeService, $location, $filter, TaskService, logger, SweetAlert, TaskStatisticService) {

            if (!$route.current || !$route.current.params || !$route.current.params.id) {
                $scope.currentTaskId = $rootScope.miniObjectDetailsID;
                $rootScope.miniObjectDetailsID = "";
            } else {
                $scope.currentTaskId = $route.current.params.id;
            }

            $scope.currentTask = {};
            $scope.allTasksProjects = [];

            $scope.objectHistoryResultHolder = [];

            TaskService.getTaskById($scope.currentTaskId).then(function (e) {
                $scope.currentTask = e;
                $rootScope.title = $scope.currentTask.name;

                $rootScope.defineUnsavedData($scope, 'currentTask', {
                    autoSaveFunction: $scope.updateTask,
                    timesBefore: 0
                });
            });

            TaskService.getAllTaskProjects().then(function (data) {
                $scope.allTasksProjects = data;
            });

            $scope.checkToUpdate = function () {
                if ($rootScope.domainSettings && $rootScope.domainSettings.allowCompleteTaskWithoutCheckList) return true;

                if ($scope.currentTask.checkListItems && $scope.currentTask.checkListItems.length > 0 && $scope.checkListStats().notDone > 0) {
                    return false;
                }

                return true;
            };

            $scope.updateTask = function () {
                TaskService.updateTask($scope.currentTask).then(function (account) {
                    $rootScope.hasUnsavedEdits = false;
                    if (!$rootScope.autoSaveObjects) {
                        logger.logSuccess("Задача обновлена!");
                    }

                });
            };

            $scope.addNewCheckListItem = function () {
                var a = {};
                a.name = "Новый статус";
                a.done = false;
                $scope.currentTask.checkListItems.push(a);
            };

            $scope.checkListStats = function () {
                var a = {};
                a.done = 0;
                a.notDone = 0;

                for (var i = 0; i < $scope.currentTask.checkListItems.length; i++) {
                    if ($scope.currentTask.checkListItems[i].done) {
                        a.done++;
                    }
                    else {
                        a.notDone++;
                    }
                }

                return a;
            };

            $scope.archiveTaskConfirmation = function () {
                SweetAlert.swal({
                        title: "Убрать в архив?",
                        text: "Задача автоматически станет выполненной",
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
                            SweetAlert.swal("Задача добавлена в архив");
                            $scope.currentTask.completed = true;
                            $scope.currentTask.archived = true;
                        } else {
                            SweetAlert.swal("Отмена", "error");
                        }
                    }
                )
            };

            $scope.deArchiveTaskConfirmation = function () {
                SweetAlert.swal({
                        title: "Убрать из архива?",
                        text: "Задача станет активной  ",
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
                            SweetAlert.swal("Задача убрана из архива и стала активной");
                            $scope.currentTask.completed = false;
                            $scope.currentTask.archived = false;
                        } else {
                            SweetAlert.swal("Отмена", "error");
                        }
                    }
                )
            };

            $scope.deleteChecklistItemConfirmation = function (item) {
                console.log(item);
                SweetAlert.swal({
                        title: "Удалить пункт в чек-листе",
                        text: "  ",
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
                            $scope.currentTask.checkListItems.splice(item, 1);
                            SweetAlert.swal("Пункт удален ");
                        } else {
                            SweetAlert.swal("Отмена", "error");
                        }
                    }
                )
            };

            $scope.deleteTaskModal = function () {
                SweetAlert.swal({
                        title: "Удалить задачу?",
                        text: "Задача " + $scope.currentTask.name + " будет удалена",
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
                            $scope.deleteTask();
                        } else {
                            SweetAlert.swal("Отмена", "error");
                        }
                    }
                )
            };

            $scope.setCompeted = function () {
                if (!$scope.checkToUpdate) {
                    logger.logError("Чтобы выполнить задачу, Вы должны сначала выполнить все чек-листы в ней!");
                    return;
                }

                $scope.currentTask.completed = true;
                logger.logSuccess("Задача помечена как ВЫПОЛНЕННАЯ!");
            };

            $scope.countDoneCheckedListInTask = function () {
                return TaskStatisticService.countDoneCheckedListInTask($scope.currentTask);
            };

            $scope.startTaskFoo = function () {
                return TaskStatisticService.startTaskFoo($scope.currentTask);
            };

            /**
             * вреия выполнения задачи
             * @returns {*}
             */
            $scope.startTaskToEndFoo = function () {
                return TaskStatisticService.startTaskToEndFoo($scope.currentTask);
            };

            /**
             * До окончания задачи
             * число. может быть меньше нуля - просрочена
             * @returns {*}
             */
            $scope.returnTimeDifferenceBetweenDate = function (task) {
                if (task == null) return null;

                return timeService.returnTimeDifferenceBetweenDate(task);
            };

            $scope.deleteTask = function () {
                TaskService.deleteTask($scope.currentTaskId);
                logger.logSuccess("Задача удалена");

                $location.path('/task');
            };

            $scope.changeDone = function (item) {
            };

            $scope.setNotCompeted = function () {
                $scope.currentTask.completed = false;
                logger.logSuccess("Задача помечена как АКТИВНАЯ!");
            };

        }])

    .controller('TaskAllCtrl', ['$scope', '$rootScope', 'timeService', 'TaskService', 'SystemService', '$location', '$modal', 'logger', '$mdDialog', 'TaskStatisticService',
        function ($scope, $rootScope, timeService, TaskService, SystemService, $location, $modal, logger, $mdDialog, TaskStatisticService) {
            $scope.itemsPerPage = 25; // this should match however many results your API puts on one page
            $scope.currentPage = 1;
            $scope.lastRequestCount = 0;

            $scope.pagesNumbers = 1;
            $scope.timeNow = new Date();
            $scope.projects = [];

            $scope.clickedCustomerLine = function (customer) {
                $location.path('/task/details/' + customer.id);
            };

            $scope.showedTaskDetails = false;
            $rootScope.showedTaskDetailsID = "";

            $scope.hoverTask = function ($event, customer) {
                $scope.choosedTask = customer.id;
            };

            //$scope.hoverTask = function ($event, customer) {
            //    console.log($event.target.$$hashKey);
            //    $scope.choosedTask = $event.target.td.$$hashKey;
            //    //console.log("enter tr");
            //
            //};

            $scope.hideDetailsTask = function () {
                $scope.showedTaskDetails = false;
            };

            $scope.mouseLeaveTask = function ($event, customer) {
                //console.log("leave tr");
            };

            $scope.alltDynamicSegments = [];

            TaskService.getAllTaskTemplate().then(function (data) {
                $scope.alltDynamicSegments = data;
            });

            //
            $scope.taskQueryBuilder = SystemService.getBasisBuilder();

            $scope.taskQueryBuilder.onlyDone = false;
            $scope.taskQueryBuilder.onlyActive = true;
            $scope.taskQueryBuilder.responsibles = {};
            $scope.taskQueryBuilder.responsibles.userAccountsIDs = [];

            $scope.taskQueryBuilder.useCompletedDateFrom = false;
            $scope.taskQueryBuilder.useCompletedDateTo = false;
            $scope.taskQueryBuilder.completedDateFrom = "";
            $scope.taskQueryBuilder.completedDateTo = "";

            $scope.taskQueryBuilder.usePagination = true;
            $scope.taskQueryBuilder.recordFrom = 0;
            $scope.taskQueryBuilder.recordTo = 20;

            $scope.convertCustomerBuilderToserver = function (newPage) {

                var fromRecord = (newPage - 1) * $scope.itemsPerPage;
                var toRecord = newPage * $scope.itemsPerPage;

                var customerBuilder = angular.copy($scope.taskQueryBuilder);
                customerBuilder = SystemService.buildDataObjectBuilder(customerBuilder);

                customerBuilder.recordFrom = fromRecord;
                customerBuilder.recordTo = toRecord;

                if ($scope.taskQueryBuilder.fullTextSearchRequest && $scope.taskQueryBuilder.fullTextSearchRequest.length > 0) {
                    customerBuilder.useFullTextSearch = true;
                } else {
                    customerBuilder.useFullTextSearch = false;
                }

                return customerBuilder;
            };

            $scope.pageChanged = function (newPage) {
                var customerBuilder = $scope.convertCustomerBuilderToserver(newPage);

                $scope.customersPromise = TaskService.getAllTasksWithTaskBuilder
                (customerBuilder).then(function (e) {
                    $scope.projects = e.resultedObjects;
                    $scope.allCustomersCount = e.entityNumber;
                    $scope.lastRequestCount = e.entityNumber;

                    $scope.pagesNumbers = Math.ceil($scope.allCustomersCount / $scope.itemsPerPage);
                });
            };
            $scope.pageChanged(1);

            $scope.taskQueryBuilderResponsiblesChanged = function () {
                $scope.pageChanged(1);
            };

            $scope.taskQueryBuilderOnlyDoneChanged = function () {
                if ($scope.taskQueryBuilder.onlyDone) {
                    $scope.taskQueryBuilder.onlyActive = false;
                    $scope.pageChanged(1);
                    return;
                }

                if (!$scope.taskQueryBuilder.onlyDone) {
                    $scope.pageChanged(1);
                    return;
                }
            };

            //////////////////////////////////////////////////////////////////////////////
            $scope.taskQueryBuilderOnlyActiveChanged = function () {
                if ($scope.taskQueryBuilder.onlyActive) {
                    $scope.taskQueryBuilder.onlyDone = false;
                    $scope.pageChanged(1);
                    return;
                }

                if (!$scope.taskQueryBuilder.onlyActive) {
                    $scope.pageChanged(1);
                    return;
                }
            };

            //////////////////////////////////////////////////////////////////////////////

            $scope.taskQueryBuilderSortDESCbyCreatedDateChanged = function () {
                $scope.pageChanged(1);
            };

            /**
             * До окончания задачи
             * число. может быть меньше нуля - просрочена
             * @returns {*}
             */
            $scope.returnTimeDifferenceBetweenDate = function (task) {
                if (task == null) return null;
                return timeService.returnTimeDifferenceBetweenDate(task);
            };

            $scope.countDoneCheckedListInTask = TaskStatisticService.countDoneCheckedListInTask;

            ////////////////////////////////////////////////
            $scope.setCompeted = function (id) {
                var currentTask = {};
                var _id = id;

                (function () {
                    for (var i = 0; i < $scope.projects.length; i++) {
                        if ($scope.projects[i].id === id) {
                            $scope.projects[i].completed = true;
                            currentTask = $scope.projects[i];
                        }
                    }

                    TaskService.updateTask(currentTask).then(function (account) {
                        for (var i = 0; i < $scope.projects.length; i++) {
                            if ($scope.projects[i].id === account.id) {
                                $scope.projects[i] = account;
                            }
                        }
                    }, function (err) {
                        for (var i = 0; i < $scope.projects.length; i++) {
                            if ($scope.projects[i].id === _id) {
                                $scope.projects[i].completed = false;
                                currentTask = $scope.projects[i];
                            }
                        }
                    });
                })();
            };

            ////////////////////////////////////////////////

            $scope.setNotCompeted = function (id) {
                var currentTask = {};

                (function () {
                    var _id = id;

                    for (var i = 0; i < $scope.projects.length; i++) {
                        if ($scope.projects[i].id === id) {
                            $scope.projects[i].completed = false;
                            currentTask = $scope.projects[i];
                        }
                    }

                    TaskService.updateTask(currentTask).then(function (account) {
                        for (var i = 0; i < $scope.projects.length; i++) {
                            if ($scope.projects[i].id === account.id) {
                                $scope.projects[i] = account;
                            }
                        }
                    }, function (err) {
                        for (var i = 0; i < $scope.projects.length; i++) {
                            if ($scope.projects[i].id === _id) {
                                $scope.projects[i].completed = true;
                                currentTask = $scope.projects[i];
                            }
                        }
                    });

                })();

            };

            ////////////////////////////////////////////////
            $scope.countWidthCheckList = function (task) {
                if (!$rootScope.debugMode) return '100%';
                if (task.checkListItems.length === 0) return '100%';

                return ($scope.countDoneCheckedListInTask(task) / task.checkListItems.length * 100) + '%';
            };

            $scope.getByDynamicSegment = function (segment) {
                TaskService.getTaskTemplateByCustomerId(segment).then(function (data) {
                    $scope.activeDynamicSegmentID = data.id;
                    $scope.currentDynamicSegment = data;

                    $scope.taskQueryBuilder = data.taskBuilder;
                    $scope.pageChanged(1, true);
                });
            };

            $scope.saveAsDynamicSegment = function () {
                $scope.saveAsDynamicSegmentTemplate = $modal({
                    scope: $scope,
                    html: true,
                    show: false,
                    contentTemplate: 'app/components/task/modal/add_task_template.html'
                });

                // new dynamic segment object from builder
                $scope.newDynamicSegment = {};
                $scope.newDynamicSegment.name = "Новый динамический сегмент";
                $scope.newDynamicSegment.taskBuilder = {};

                $scope.saveAsDynamicSegmentTemplate.$promise.then($scope.saveAsDynamicSegmentTemplate.show);
            };

            /**
             * add dynamic segment
             */
            $scope.addDynamicSegment = function () {
                $scope.newDynamicSegment.taskBuilder = $scope.convertCustomerBuilderToserver(1);

                TaskService.addTaskTemplate($scope.newDynamicSegment).then(function (data) {
                    logger.logSuccess("Шаблон добавлен!");
                    $scope.saveAsDynamicSegmentTemplate.hide();
                });
            };

            $scope.startTaskFoo = function (task) {
                return TaskStatisticService.startTaskFoo(task);
            };

        }])

    .controller('TaskNewCtrl', ['$scope', 'timeService', 'TaskService', 'logger', '$location', '$rootScope', 'hotkeys', '$mdDialog', '$translate',
        function ($scope, timeService, TaskService, logger, $location, $rootScope, hotkeys, $mdDialog, $translate) {
            $rootScope.title = $translate.instant('APP.PAGES.TITLES.TASK.NEW');

            $scope.allTasksProjects = [];
            $scope.createNewProject = false;

            // TASK OBJECT START
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

            $scope.task.responsibles = {};
            $scope.task.responsibles.userAccountsIDs = [];
            $scope.task.checkListItems = [];

            // task object end

            TaskService.getAllTaskProjects().then(function (data) {
                $scope.allTasksProjects = data;
            });

            $scope.addTask = function () {
                $mdDialog.hide();
                logger.logSuccess("Новая задача: " + $scope.task.name + "успешно добавлена!");

                TaskService.addTask($scope.task).then(function (e) {
                    $location.path('/task/details/' + e.id);
                });
            };

            hotkeys.add({
                combo: 'enter',
                description: '',
                callback: function () {
                    $scope.addTask();
                }
            });

        }])
;
