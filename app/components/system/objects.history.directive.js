/**
 * Created Nikita Bakaev, ya@nbakaev.ru on 2/25/2016.
 * All Rights Reserved
 */
angular.module('app.historyobjects', [])
    .directive('objectsHistoryShowerBiqa', function () {
        return {
            restrict: 'EA',
            scope: {
                objectId: '=?',
                uploadedAllCallback: "&?",
                objectType: "=?",
                result: "=?",
                fieldsNameFilter: "=?"
            },
            templateUrl: 'app/components/system/objects_history.html',
            controller: ['$scope', '$rootScope', '$timeout', 'SystemService', 'logger', 'objectsHistoryService', '$translate', '$filter',
                function ($scope, $rootScope, $timeout, SystemService, logger, objectsHistoryService, $translate, $filter) {

                    var self = this;
                    $scope.printDate = $rootScope.printDate;
                    $scope.printUser = $rootScope.printUser;
                    $scope.resolveUser = $rootScope.resolveUser;
                    $scope.getAvatarUrlByUser = $rootScope.getAvatarUrlByUser;
                    $scope.debugMode = $rootScope.debugMode;

                    if (isUndefinedOrNull($scope.result)) {
                        $scope.result = [];
                    }

                    $scope.loadHistory = function () {
                        objectsHistoryService.getObjectHistoryChangesByTypeAndId($scope.objectId, $scope.objectType).then(function (result) {

                            // hm... we can not just use $scope.result = result;
                            // because we will get new new object which is not passed through directive
                            $scope.result.length = 0;

                            // transform object from REST API

                            for (var k in result) {
                                var change = result[k];

                                if (change.action === 'ListChange') {
                                    for (var subChange in change.change.changes) {
                                        var newSubChange = {};
                                        newSubChange.change = angular.copy(change.change.changes[subChange]);
                                        newSubChange.change.left = newSubChange.change.leftValue;
                                        newSubChange.change.right = newSubChange.change.rightValue;
                                        newSubChange.date = change.date;
                                        newSubChange.userId = change.userId;
                                        newSubChange.change.propertyName = change.change.propertyName;
                                        newSubChange.action = 'ValueChange';

                                        $scope.result.push(newSubChange);
                                    }

                                } else {

                                    // we can normally render this object in UI
                                    if (change.change.propertyName === 'connectedInfo'){
                                        continue;
                                    }

                                    // ValueChange
                                    $scope.result.push(change);
                                }

                            }
                        });

                    };

                    self.printCustomFieldValue = function (field) {
                        var errorResponse = '';

                        if (!field || !field.type) {
                            return errorResponse;
                        }

                        if (field.type === 'STRING') {
                            if (isUndefinedOrNull(field.value) || isUndefinedOrNull(field.value.stringVal)) return errorResponse;
                            return field.value.stringVal;
                        }

                        if (field.type === 'DICTIONARY') {
                            if (isUndefinedOrNull(field.value) || isUndefinedOrNull(field.value.dictVal) || isUndefinedOrNull(field.value.dictVal.value)) return errorResponse;
                            return field.value.dictVal.value.name;
                        }

                        if (field.type === 'INTEGER') {
                            if (isUndefinedOrNull(field.value) || isUndefinedOrNull(field.value.intVal)) return errorResponse;
                            return field.value.intVal;
                        }

                        if (field.type === 'DATE') {
                            if (isUndefinedOrNull(field.value) || isUndefinedOrNull(field.value.dateVal)) return errorResponse;
                            return $rootScope.printDate(field.value.dateVal);
                        }

                        if (field.type === 'BOOLEAN') {
                            if (isUndefinedOrNull(field.value) || isUndefinedOrNull(field.value.boolVal)) return errorResponse;
                            var data = field.value.boolVal;
                            if (data) {
                                return $translate.instant('HISTORY.FIELDS.VALUES.TRUE');
                            } else {
                                return $translate.instant('HISTORY.FIELDS.VALUES.FALSE');
                            }
                        }

                        return errorResponse;
                    };

                    $scope.printValue = function (change, position) {
                        // return typeof data;
                        if (isUndefinedOrNullOrEmpty(change) || isUndefinedOrNullOrEmpty(change.change) || isUndefinedOrNullOrEmpty(change.change[position])) {
                            return '';
                        }

                        if (change.change.propertyName === 'customFields') {
                            return self.printCustomFieldValue(change.change[position]);
                        }

                        if (change.action === 'ValueChange') {
                            var data = change.change[position];
                            if (typeof data === 'string') return data;

                            if (typeof data === 'number') {

                                // try to guess that this is a Date
                                if (change.change.propertyName.toUpperCase().contains('date'.toUpperCase())) {
                                    return $rootScope.printDate(data);
                                }

                                return data;
                            }

                            if (typeof data === 'object') {

                                // if there is a difference in object name - print it
                                // dirty hack
                                if (!isUndefinedOrNullOrEmpty(data) && !isUndefinedOrNullOrEmpty(data.name)) {
                                    if (change.change['right'].name !== change.change['left'].name) {
                                        return data.name;
                                    }

                                    // hacks to check list item for tasks
                                    if (change.change.propertyName === 'checkListItems') {
                                        if (data.done) {
                                            return $translate.instant('HISTORY.FIELDS.VALUES.TRUE');
                                        } else {
                                            return $translate.instant('HISTORY.FIELDS.VALUES.FALSE');
                                        }
                                    }

                                } else {
                                    return $filter('json')(data);
                                }
                            }

                            if (typeof data === 'boolean') {
                                if (data) {
                                    return $translate.instant('HISTORY.FIELDS.VALUES.TRUE');
                                } else {
                                    return $translate.instant('HISTORY.FIELDS.VALUES.FALSE');
                                }
                            }

                            return data;
                        }

                    };

                    $scope.printFieldsName = function (change) {

                        // if this custom field - print name
                        if (change.change.propertyName === 'customFields') {
                            return change.change.right.name;
                        }

                        var translationId = 'HISTORY.FIELDS.PROPERTY.' + $scope.objectType + '.' + change.change.propertyName;

                        // hacks to checkListItems item for tasks (task/details page)
                        if (translationId === 'HISTORY.FIELDS.PROPERTY.TASK.checkListItems' && change.change['right']) {
                            if (change.change['right'].name === change.change['left'].name) {
                                return change.change['right'].name;
                            }
                        }

                        return $translate.instant(translationId);
                    };

                    self.checkModel = function () {
                        if (isUndefinedOrNullOrEmpty($scope.objectId)) {
                            $timeout($scope.checkModel, 1000);
                            return;
                        }

                        $scope.loadHistory();
                    };
                    self.checkModel();


                }]
        }
    });
