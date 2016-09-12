/**
 * Created Nikita Bakaev, ya@nbakaev.ru on 2/25/2016.
 * All Rights Reserved
 */
angular.module('app.directivesmy')
    .directive('floatingPaginationPanel', function () {
        return {
            restrict: 'EA',
            scope: {
                pagesNumbers: '=',
                currentPage: '=',
                ngChange: "&",
                pageChanged: "="
            },
            templateUrl: 'app/components/system/floating_pagination_panel_directive.html',
            controller: ['$scope', '$rootScope', function ($scope, $rootScope) {

                $scope.settings = {};
                $scope.settings.showPaginationPanel = false;
            }]
        }
    });
