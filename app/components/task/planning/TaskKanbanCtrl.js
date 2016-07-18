'use strict';

angular.module('app.task.all')
    
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
