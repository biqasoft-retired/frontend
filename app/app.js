(function () {
    'use strict';
    angular.module('app', [
        'ngRoute',
        'ngAnimate',
        'templates',

        'ui.bootstrap',
        'angularUtils.directives.dirPagination',
        'ui.tree',
        'filters',
        'duScroll',
        'ui.codemirror',
        'xeditable',
        'colorpicker.module',
        'angular-loading-bar',
        'ngclipboard',
        'FBAngular',
        'ngMaterial',
        'angularMoment',
        'pascalprecht.translate',
        'ui.sortable',
        'formstamp',
        'gridster',
        'angular.filter',
        'ui.bootstrap.datetimepicker',
        'yaru22.angular-timeago',
        'cfp.hotkeys',
        'oitozero.ngSweetAlert',
        'angularFileUpload',

        'app.historyobjects',
        'app.dashboard',
        'app.routes',
        'app.controllers',
        'app.localization',
        'app.nav',
        'app.ui.services',
        'app.ui.form.directives',
        'app.services',
        'app.services.api',
        'app.services.draw',
        'app.services.test',
        'app.company.all',
        'app.login',
        'app.widgets.custom',
        'app.widgets.predefined',
        'app.services.widget',
        'app.oauth',
        'app.customer.new',
        'app.customer.details',
        'app.leadGenMethod.projectById',
        'app.leadGenMethod.methodById',
        'app.leadGenMethod.methodsAll',
        'app.realCall',
        'app.externalServices',
        'app.datasource',
        'app.task.all',
        'app.task.project',
        'app.notifications',
        'app.userAccount.details',
        'app.documents.all',
        'app.token.new',
        'app.analytics',
        'app.yandex.banners',
        'app.domain.system',
        'app.desks',
        'app.segments',
        'app.opportunity',
        'app.deals',
        'app.costs',
        'app.system',
        'app.custom.objects.meta',
        'app.custom.objects.data',
        'app.admin',
        'app.bpmn',
        'app.userAccount.groups',
        'app.directivesmy',
        'app.hotkeys',
        'app.resetPassword',

        'textAngular',
        'jsonFormatter',
        'mdWavesurfer',

        // 'uiGmapgoogle-maps'
        //'ngCordova',
        //'ngMap',
        //'angular-intro',
    ])
        .run((['$location', '$rootScope', 'editableOptions', 'amMoment', '$translate', function ($location, $rootScope, editableOptions, amMoment, $translate) {

            // bootstrap3 theme
            editableOptions.theme = 'bs3';

            $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {

                // this is 'undefined' on error (404 pages)
                if (!isUndefinedOrNull(current.$$route) && !isUndefinedOrNull(current.$$route.title)) {
                    $translate(current.$$route.title).then(function (translation) {
                        $rootScope.title = $translate.instant(translation);
                    });
                }
            });

            amMoment.changeLocale(GLOBAL_CONSTANTS.LANGUAGE);
        }]))

        .config(['$routeProvider', '$httpProvider', 'paginationTemplateProvider', '$locationProvider', '$provide', '$translateProvider', 'JSONFormatterConfigProvider', 'timeAgoSettings',
            function ($routeProvider, $httpProvider, paginationTemplateProvider, $locationProvider, $provide, $translateProvider, JSONFormatterConfigProvider, timeAgoSettings) {

                // cordova do not support html5 history
                // use hash prefix 
                if (!GLOBAL_CONSTANTS.MOBILE_CORDOVA) {
                    $locationProvider.html5Mode(true);
                    $locationProvider.hashPrefix('!');
                }

                // enable the hover preview feature
                JSONFormatterConfigProvider.hoverPreviewEnabled = true;

                // default i18n
                $translateProvider.useStaticFilesLoader({
                    prefix: 'assets/i18n/locale-',
                    suffix: '.json'
                });
                timeAgoSettings.overrideLang = GLOBAL_CONSTANTS.LANGUAGE;

                $httpProvider.interceptors.push('authHttpResponseInterceptor');
                var routes, setRoutes;

                paginationTemplateProvider.setPath('node_modules/angular-utils-pagination/dirPagination.tpl.html');

                $provide.decorator("$exceptionHandler", ['$delegate', function ($delegate) {
                    return function (exception, cause) {
                        $delegate(exception, cause);
                        processError(exception);
                    };
                }]);

                routes = [
                    'ui-framework/ui/typography',
                    'ui-framework/ui/buttons',
                    'ui-framework/ui/icons',
                    'ui-framework/ui/grids',
                    'ui-framework/ui/widgets',
                    'ui-framework/ui/components',
                    'ui-framework/ui/timeline',
                    'ui-framework/ui/pricing-tables',
                    'ui-framework/ui/maps',
                    'ui-framework/tables/static',
                    'ui-framework/forms/elements',
                    'ui-framework/forms/layouts',
                    'ui-framework/forms/validation',
                    'pages/404',
                    'pages/403',
                    'pages/500',
                    'pages/503',
                    'pages/profile',
                    'ui-framework/mail/compose',
                    'ui-framework/mail/inbox',
                    'ui-framework/mail/single',
                    'ui-framework/tasks/tasks',

                    'yandex/direct/auth_code',
                    'yandex/direct/accounts',
                    'yandex/direct/tokens'
                ];

                setRoutes = function (route) {
                    var config, url;
                    url = '/' + route;
                    config = {
                        templateUrl: 'app/components/' + route + '.html'
                    };
                    $routeProvider.when(url, config);
                    return $routeProvider;
                };
                routes.forEach(function (route) {
                    return setRoutes(route);
                });
                return $routeProvider.when('/', {
                    redirectTo: '/dashboard'
                }).when('/404', {
                    templateUrl: 'app/components/pages/404.html'
                }).otherwise({
                    redirectTo: '/404'
                });
            }

        ])
        .value('duScrollOffset', 90);

}).call(this);

// Include a comment about why this seemingly unused module exists
// this is for gulp angular templates
angular.module('templates', []);
