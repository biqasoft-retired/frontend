angular.module('filters', [])

/**
 * Trust for iframe in widgets
 */
    .filter('trusted', ['$sce', function ($sce) {
        return function (url) {
            return $sce.trustAsResourceUrl(url);
        };
    }])

    .directive('ngBindHtmlUnsafe', ['$sce', function ($sce) {
        return {
            scope: {
                ngBindHtmlUnsafe: '='
            },
            template: "<div ng-bind-html='trustedHtml'></div>",
            link: function ($scope, iElm, iAttrs, controller) {
                $scope.updateView = function () {
                    $scope.trustedHtml = $sce.trustAsHtml($scope.ngBindHtmlUnsafe);
                };

                $scope.$watch('ngBindHtmlUnsafe', function (newVal, oldVal) {
                    $scope.updateView(newVal);
                });
            }
        };
    }])

    .filter('millSecondsToTimeString', function () {
        return function (seconds) {
            var minutes = Math.floor(seconds / 60);
            var seconds = seconds - minutes * 60;
            return minutes + "min " + seconds + " sec";
        }
    })

    .filter('reverse', function () {
        return function (items) {
            if (typeof items != 'undefined')
                return items.slice().reverse();

            return [];
        };
    })

    .filter('bytes', function () {
        return function (bytes, precision) {
            if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
            if (typeof precision === 'undefined') precision = 1;
            var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
                number = Math.floor(Math.log(bytes) / Math.log(1024));
            return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
        }
    })

    .filter('to_trusted', ['$sce', function ($sce) {
        return function (text) {
            return $sce.trustAsHtml(text);
        };
    }])

;
