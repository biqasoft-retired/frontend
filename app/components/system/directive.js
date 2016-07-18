/**
 * Created Nikita Bakaev, ya@nbakaev.ru on 1/9/2016.
 * All Rights Reserved
 */
'use strict';

angular.module('app.directivesmy', ['ngRoute', 'ui.tree', 'LocalStorageModule', 'ngMaterial'])

/**
 * redraw scope/template on event
 */
    .directive('relinkEvent', ['$rootScope', function ($rootScope) {
        return {
            transclude: 'element',
            restrict: 'A',
            link: function (scope, element, attr, ctrl, transclude) {
                var previousContent = null;

                var triggerRelink = function () {
                    if (previousContent) {
                        previousContent.remove();
                        previousContent = null;
                    }

                    transclude(function (clone) {
                        console.log('relinking');
                        element.parent().append(clone);
                        previousContent = clone;
                    });

                };

                triggerRelink();
                $rootScope.$on(attr.relinkEvent, triggerRelink);

            }
        };

    }])

    .directive('jsonPrinter', function () {
        return {
            restrict: 'EA',
            scope: {
                result: "="
            },
            templateUrl: 'templates/json_printer.html',
            controller: ['$scope', '$rootScope', function ($scope, $rootScope) {

            }]
        }
    })

    /**
     * Show & edit JSON in textarea
     */
    .directive('jsonText', function () {
        return {
            restrict: 'A', // only activate on element attribute
            require: 'ngModel', // get a hold of NgModelController
            link: function (scope, element, attrs, ngModelCtrl) {

                var lastValid;

                // push() if faster than unshift(), and avail. in IE8 and earlier (unshift isn't)
                ngModelCtrl.$parsers.push(fromUser);
                ngModelCtrl.$formatters.push(toUser);

                // clear any invalid changes on blur
                element.bind('blur', function () {
                    element.val(toUser(scope.$eval(attrs.ngModel)));
                });

                // $watch(attrs.ngModel) wouldn't work if this directive created a new scope;
                // see http://stackoverflow.com/questions/14693052/watch-ngmodel-from-inside-directive-using-isolate-scope how to do it then
                scope.$watch(attrs.ngModel, function (newValue, oldValue) {
                    lastValid = lastValid || newValue;

                    if (newValue != oldValue) {
                        ngModelCtrl.$setViewValue(toUser(newValue));

                        // TODO avoid this causing the focus of the input to be lost..
                        ngModelCtrl.$render();
                    }
                }, true); // MUST use objectEquality (true) here, for some reason..

                function fromUser(text) {
                    // Beware: trim() is not available in old browsers
                    if (!text || text.trim() === '') {
                        return {};
                    } else {
                        try {
                            lastValid = angular.fromJson(text);
                            ngModelCtrl.$setValidity('invalidJson', true);
                        } catch (e) {
                            ngModelCtrl.$setValidity('invalidJson', false);
                        }

                        return lastValid;
                    }
                }

                function toUser(object) {
                    // better than JSON.stringify(), because it formats + filters $$hashKey etc.
                    return angular.toJson(object, true);
                }
            }
        };
    });

