'use strict';

angular.module('app.task.project', ['ngRoute', 'LocalStorageModule'])

    .controller('ProjectsAllCtrl', ['$scope', '$http', 'localStorageService', 'UserService', 'configurationService', 'timeService', 'TaskService', '$location', 'logger', 'TaskStatisticService',
        function($scope, $http, localStorageService, UserService, configurationService, timeService, TaskService, $location, logger, TaskStatisticService) {

            $scope.allTasksProjects = [];

            TaskService.getAllTaskProjectsWithTasks().then(function(data) {
                $scope.allTasksProjects = data;
            });

            $scope.newProject = {};
            $scope.newProject.name = "";

            $scope.addProject = function() {
                TaskService.addProject($scope.newProject).then(function(e) {
                    logger.logSuccess("Проект добавлен!");
                    $location.path('/task/projects/details/' + e.id);
                });
            };

            $scope.countDoneCheckedListInTask = TaskStatisticService.countDoneCheckedListInTask;
            $scope.startTaskFoo = TaskStatisticService.startTaskFoo;
            $scope.startTaskToEndFoo = TaskStatisticService.startTaskToEndFoo;
            $scope.returnTimeDifferenceBetweenDate = timeService.returnTimeDifferenceBetweenDate;

            $scope.getPercentFromArrayStatus = function(arr) {
                if (typeof arr != "object")return 0;
                return (arr[0] / arr[1]);
            };

        }])

    .controller('ProjectDetailsCtrl', ['$scope', '$rootScope', '$route', 'timeService', 'TaskService', 'logger', 'TaskStatisticService',
        function($scope, $rootScope, $route, timeService, TaskService, logger, TaskStatisticService) {

            $scope.currentTaskDetailsId = $route.current.params.id;

            $scope.currentTaskProject = TaskService.getTaskProjectById($scope.currentTaskDetailsId).then(function(data) {
                $scope.currentTaskProject = data;
                $rootScope.title = data.name;
            });

            $scope.updateTaskProject = function() {
                TaskService.updateTaskProject($scope.currentTaskProject);
                logger.logSuccess("Проект обновлен!");
            };

            $scope.deleteTaskProject = function() {
                TaskService.deleteProjectById($scope.currentTaskProject.id);
                logger.logSuccess("Проект удален!");
            };

            $scope.getPercentFromArrayStatus = function(arr) {
                if (typeof arr != "object")return 0;
                return (arr[0] / arr[1]);
            };

            $scope.countDoneCheckedListInTask = TaskStatisticService.countDoneCheckedListInTask;
            $scope.startTaskFoo = TaskStatisticService.startTaskFoo;
            $scope.startTaskToEndFoo = TaskStatisticService.startTaskToEndFoo;
            $scope.returnTimeDifferenceBetweenDate = timeService.returnTimeDifferenceBetweenDate;

        }])

    .controller('TasksPlanningCtrl', ['$scope', '$rootScope', 'TaskService', 'BoardService',
        function($scope, $rootScope, TaskService, BoardService) {

            //$scope.kanbanBoard = BoardService.kanbanBoard(BoardDataFactory.kanban);

            $scope.TasksBoardDeviced = {};

            TaskService.getAllTasksForController().then(function(e) {

                $scope.TasksBoardDeviced = {
                    "name": "Kanban Board",
                    "numberOfColumns": 4,
                    "columns": [
                        {
                            "name": "Ideas", "cards": [
                            {"title": "Come up with a POC for new Project"},
                            {"title": "Design new framework for reporting module"}
                        ]
                        },
                        {
                            "name": "Not started", "cards": [
                            {
                                "title": "Explore new IDE for Development",
                                "details": "Testing Card Details"
                            },
                            {
                                "title": "Get new resource for new Project",
                                "details": "Testing Card Details"
                            }
                        ]
                        },
                        {
                            "name": "In progress", "cards": [
                            {
                                "title": "Develop ui for tracker module",
                                "details": "Testing Card Details"
                            },
                            {
                                "title": "Develop backend for plan module",
                                "details": "Testing Card Details"
                            }
                        ]
                        },
                        {
                            "name": "Done", "cards": e

                            //    [
                            //    {"title": "Test user module",
                            //        "details": "Testing Card Details"},
                            //    {"title": "End to End Testing for user group module",
                            //        "details": "Testing Card Details"},
                            //    {"title": "CI for user module",
                            //        "details": "Testing Card Details"}
                            //]

                        }
                    ]

                };

                $scope.kanbanBoard = BoardService.kanbanBoard($scope.TasksBoardDeviced);

            });

            $scope.kanbanSortOptions = {

                //restrict move across columns. move only within column.
                /*accept: function (sourceItemHandleScope, destSortableScope) {
                 return sourceItemHandleScope.itemScope.sortableScope.$id !== destSortableScope.$id;
                 },*/
                itemMoved: function(event) {
                    event.source.itemScope.modelValue.status = event.dest.sortableScope.$parent.column.name;
                },
                orderChanged: function(event) {
                },
                containment: '#board'
            };

            $scope.removeCard = function(column, card) {
                BoardService.removeCard($scope.kanbanBoard, column, card);
            };

            $scope.addNewCard = function(column) {
                BoardService.addNewCard($scope.kanbanBoard, column);
            }

        }])
;
