/*jshint undef: false, unused: false, indent: 2*/
/*global angular: false */

'use strict';
function Board(name, numberOfColumns) {
    return {
        name: name,
        numberOfColumns: numberOfColumns,
        columns: [],
        backlogs: []
    };
}

function Column(name) {
    return {
        name: name,
        cards: []
    };
}

function Backlog(name) {
    return {
        name: name,
        phases: []
    };
}

function Phase(name) {
    return {
        name: name,
        cards: []
    };
}

function Card(title, status, details) {
    this.name = title;
    this.status = status;
    this.details = details;
    return this;
}

angular.module('app.services.test', ['LocalStorageModule', 'ngRoute', 'app.services'])

    .factory('BoardManipulator', function() {

        function Board(name, numberOfColumns) {
            return {
                name: name,
                numberOfColumns: numberOfColumns,
                columns: [],
                backlogs: []
            };
        }

        function Column(name) {
            return {
                name: name,
                cards: []
            };
        }

        function Backlog(name) {
            return {
                name: name,
                phases: []
            };
        }

        function Phase(name) {
            return {
                name: name,
                cards: []
            };
        }

        function Card(title, status, details) {
            this.name = title;
            this.status = status;
            this.details = details;
            return this;
        };

        return {

            addColumn: function(board, columnName) {
                board.columns.push(new Column(columnName));
            },

            addCardToColumn: function(board, column, cardTitle, details) {
                angular.forEach(board.columns, function(col) {
                    if (col.name === column.name) {
                        col.cards.push(new Card(cardTitle, column.name, details));
                    }
                });
            },
            removeCardFromColumn: function(board, column, card) {
                angular.forEach(board.columns, function(col) {
                    if (col.name === column.name) {
                        col.cards.splice(col.cards.indexOf(card), 1);
                    }
                });
            },
            addBacklog: function(board, backlogName) {
                board.backlogs.push(new Backlog(backlogName));
            },

            addPhaseToBacklog: function(board, backlogName, phase) {
                angular.forEach(board.backlogs, function(backlog) {
                    if (backlog.name === backlogName) {
                        backlog.phases.push(new Phase(phase.name));
                    }
                });
            },

            addCardToBacklog: function(board, backlogName, phaseName, task) {
                angular.forEach(board.backlogs, function(backlog) {
                    if (backlog.name === backlogName) {
                        angular.forEach(backlog.phases, function(phase) {
                            if (phase.name === phaseName) {
                                phase.cards.push(new Card(task.title, task.status, task.details));
                            }
                        });
                    }
                });
            }
        };
    })

    .service('BoardService', ['$modal', 'BoardManipulator', function($modal, BoardManipulator) {

        return {
            removeCard: function(board, column, card) {
                if (confirm('Are You sure to Delete?')) {
                    BoardManipulator.removeCardFromColumn(board, column, card);
                }
            },

            addNewCard: function(board, column) {
                var modalInstance = $modal.open({
                    templateUrl: 'app/components/task/planning/partials/newCard.html',
                    controller: 'NewCardController',
                    backdrop: 'static',
                    resolve: {
                        column: function() {
                            return column;
                        }
                    }
                });
                modalInstance.result.then(function(cardDetails) {
                    if (cardDetails) {
                        BoardManipulator.addCardToColumn(board, cardDetails.column, cardDetails.title, cardDetails.details);
                    }
                });
            },
            kanbanBoard: function(board) {
                var kanbanBoard = new Board(board.name, board.numberOfColumns);
                angular.forEach(board.columns, function(column) {
                    BoardManipulator.addColumn(kanbanBoard, column.name);
                    angular.forEach(column.cards, function(card) {
                        BoardManipulator.addCardToColumn(kanbanBoard, column, card.name, card.details);
                    });
                });
                return kanbanBoard;
            }

            //,
            //sprintBoard: function (board) {
            //    var sprintBoard = new Board(board.name, board.numberOfColumns);
            //    angular.forEach(board.columns, function (column) {
            //        BoardManipulator.addColumn(sprintBoard, column.name);
            //    });
            //    angular.forEach(board.backlogs, function (backlog) {
            //        BoardManipulator.addBacklog(sprintBoard, backlog.title);
            //        angular.forEach(backlog.phases, function (phase) {
            //            BoardManipulator.addPhaseToBacklog(sprintBoard, backlog.title, phase);
            //            angular.forEach(phase.cards, function (card) {
            //                BoardManipulator.addCardToBacklog(sprintBoard, backlog.title, phase.name, card);
            //            });
            //        });
            //
            //    });
            //    return sprintBoard;
            //}
        };
    }])

;
