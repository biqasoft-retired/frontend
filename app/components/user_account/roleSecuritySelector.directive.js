/**
 * Created Nikita Bakaev, ya@nbakaev.ru on 2/25/2016.
 * All Rights Reserved
 */
angular.module('app.directivesmy')
    .directive('roleSecuritySelector', function() {
        return {
            restrict: 'EA',
            require: '^ngModel',
            scope: {
                ngModel: '='
            },
            templateUrl: 'app/components/user_account/role_security_selector.html',
            controller: ['$scope', function($scope) {

                $scope.roles = {};

                $scope.updater = function() {

                    for (var i in $scope.roles) {
                        $scope.roles[i] = false;
                    }

                    $scope.ngModel.forEach(function(data) {
                        $scope.roles[data] = true;
                    });
                };

                $scope.removeRole = function(role) {
                    $scope.ngModel = $scope.ngModel.filter(function(data) {
                        if (data !== role) return true;
                    })
                };

                $scope.changeRole = function(role) {
                    if ($scope.ngModel.filter(function(data) {
                            if (data === role) return true;
                        }).length > 0) {
                        $scope.removeRole(role);
                    } else {
                        $scope.ngModel.push(role);
                    }
                };

                $scope.$watch('ngModel', function(newVal) {
                    if (newVal) {
                        $scope.updater();
                    }
                }, true);

            }]

        }
    });