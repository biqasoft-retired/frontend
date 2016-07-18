(function () {
    'use strict';
    angular.module('app.localization', [])
        .controller('LangCtrl', ['$scope', '$translate', function ($scope, $translate) {
            return $scope.getFlag = function () {
                var lang;

                lang = $translate.use();
                switch (lang) {
                    case 'en':
                        return 'flags-american';
                    case 'ru':
                        return 'flags-russia';

                    //case 'Español':
                    //    return 'flags-spain';
                    //case '日本語':
                    //    return 'flags-japan';
                    //case '中文':
                    //    return 'flags-china';
                    //case 'Deutsch':
                    //    return 'flags-germany';
                    //case 'français':
                    //    return 'flags-france';
                    //case 'Italiano':
                    //    return 'flags-italy';
                    //case 'Portugal':
                    //    return 'flags-portugal';
                    //case '한국어':
                    //    return 'flags-korea';
                }
            };
        }
        ]);

}).call(this);

