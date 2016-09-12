/**
 * Created Nikita Bakaev, ya@nbakaev.ru on 2/25/2016.
 * All Rights Reserved
 */
angular.module('app.directivesmy')
    .directive('dateSelector', function () {
        return {
            restrict: 'EA',
            require: '^ngModel',
            scope: {
                ngModel: '=',
                ngChange: "&"
            },
            templateUrl: 'app/components/system/date_selector/date_selector.html',
            controller: ['$scope', '$rootScope', 'timeService', function ($scope, $rootScope, timeService) {

                $scope.customerAndLeadGetRequestCriteriaDao = {};
                $scope.objDateModel = null;
                $scope.allDateExpression = timeService.getAllDateExpression();
                $scope.printDate = $rootScope.printDate;

                $scope.objectRelChanged = function () {
                    if ($scope.customerAndLeadGetRequestCriteriaDao && $scope.customerAndLeadGetRequestCriteriaDao.relativeCreatedDateFrom) {
                        $scope.ngModel = $scope.customerAndLeadGetRequestCriteriaDao.relativeCreatedDateFrom.value;
                    } else {
                        $scope.ngModel = null;
                    }

                    $scope.ngChange();
                    $scope.objDateModel = null;
                };

                $scope.objDateModelFoo = function () {
                    $scope.ngModel = $scope.objDateModel;
                    $scope.customerAndLeadGetRequestCriteriaDao = null;
                    $scope.ngChange();
                };

                // we have some model property
                if ($scope.ngModel) {

                    // this is date Expression, such as `%CURRENT_DAY_START%`...
                    if ($scope.ngModel && $scope.ngModel[0] === '%') {
                        $scope.customerAndLeadGetRequestCriteriaDao.relativeCreatedDateFrom = $scope.allDateExpression.filter(function (data) {
                            if (data.value === $scope.ngModel) {
                                $scope.customerAndLeadGetRequestCriteriaDao.relativeCreatedDateFrom = data;
                                return true;
                            }
                        })[0];
                        $scope.objectRelChanged();
                    } else {
                        // this is javaScript date
                        $scope.ngModel = $scope.ngModel.toString();
                        $scope.objDateModel = $scope.ngModel.toString();
                    }

                    $scope.ngChange();
                }

            }]
        }
    })

    .directive('filterClassAbstract', function () {
        return {
            restrict: 'EA',
            require: '^ngModel',
            scope: {
                ngModel: '=',
                ngChange: "&",
                searchFunc: "&"
            },
            templateUrl: 'templates/filter_class_abstract.html',
            controller: ['$scope', '$rootScope', function ($scope, $rootScope) {

                $scope.customerAndLeadGetRequestCriteriaDao = $scope.ngModel;

                $scope.tableClasses = $rootScope.tableClasses;

                $rootScope.$watch('tableClasses', function (newValue) {
                    $scope.tableClasses = $rootScope.tableClasses;
                });

                $scope.$watch('ngModel', function (newValue) {
                    $scope.customerAndLeadGetRequestCriteriaDao = $scope.ngModel;
                });

            }]
        }
    })

    .directive('fromToSelector', function () {
        return {
            restrict: 'EA',
            scope: {
                object: '=',
                fromUse: '=',
                fromValue: '=',
                toValue: '=',
                toUse: '=',
                ngChange: "&"
            },
            templateUrl: 'app/components/system/date_selector/from_to_selector.html',
            controller: ['$scope', function ($scope) {

                $scope.$watch('object', function (newValue) {

                    if (isUndefinedOrNullOrEmpty($scope.object[$scope.fromValue]) || $scope.object[$scope.fromValue].length == 0) {
                        $scope.object[$scope.fromUse] = false;
                    } else {
                        $scope.object[$scope.fromUse] = true;
                    }

                    if (isUndefinedOrNullOrEmpty($scope.object[$scope.toValue]) || $scope.object[$scope.toValue].length == 0) {
                        $scope.object[$scope.toUse] = false;
                    } else {
                        $scope.object[$scope.toUse] = true;
                    }

                }, true);

            }]
        }
    })