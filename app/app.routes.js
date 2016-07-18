angular.module('app.routes', ['ngRoute', 'LocalStorageModule'])
    .config(['$routeProvider', function ($routeProvider) {

        $routeProvider.when('/analytics/web/counters', {
            controller: 'WebAnalyticsCtrl',
            templateUrl: 'app/components/analytics/web/counters/all.html',
            title: 'APP.PAGES.TITLES.ANALYTICS.ALL_WEB_COUNTERS'
        })

            .when('/dashboard', {
                controller: 'DashboardCtrl',
                templateUrl: 'app/components/dashboard/dashboard.html',
                title: 'APP.PAGES.TITLES.DATA_SOURCE.DASHBOARDS'
            })

            .when('/developers/database', {
                controller: 'DatabaseAdminCtrl',
                templateUrl: 'app/components/system/database/database.html',
                title: 'APP.PAGES.TITLES.DATA_BASE.DIRECT_CONNECT'
            })

            .when('/developers/bpmn/ide', {
                controller: 'bpmnEditorIDECtrl',
                templateUrl: 'app/components/bpmn/ide/editor_all.html',
                title: 'BPMN IDE'
            })

            .when('/developers/database/admin/execute', {
                controller: 'DatabaseCtrl',
                templateUrl: 'app/components/system/database/execute.html',
                title: 'APP.PAGES.TITLES.DATA_BASE.EXECUTE'
            })

            .when('/bpmn/raw/execute', {
                controller: 'bpmnDeveloperCtrl',
                templateUrl: 'app/components/bpmn/execute.html',
                title: 'APP.PAGES.TITLES.BPMN.EXECUTE'
            })

            .when('/developers/oauth2/apps', {
                controller: 'Oauth2AllCtrl',
                templateUrl: 'app/components/system/oauth2/apps_all.html',
                title: 'APP.PAGES.TITLES.OAUTH2.ALL_APPS'
            })

            .when('/developers/oauth2/app/details/:id', {
                controller: 'Oauth2AppCtrl',
                templateUrl: 'app/components/system/oauth2/apps_details.html'
            })

            .when('/developers/oauth2/auth', {
                controller: 'Oauth2AppGrantCtrl',
                templateUrl: 'app/components/system/oauth2/apps_grant.html',
                title: 'APP.PAGES.TITLES.OAUTH2.GRANT_ACCESS_REQUEST_FOR_APP'
            })

            .when('/analytics/web/counters/allRecordsById/:id', {
                controller: 'AllRecordsByCounterId',
                templateUrl: 'app/components/analytics/web/records_by_counter_id.html',
                title: 'APP.PAGES.TITLES.ANALYTICS.RECORDS_IN_COUNTER'
            })

            .when('/analytics/web/counters/details/:id', {
                controller: 'WebCounterDetails',
                templateUrl: 'app/components/analytics/web/counters/details.html',
                title: 'APP.PAGES.TITLES.ANALYTICS.COUNTER.DETAILS'
            })

            .when('/dialer', {
                controller: 'RealCallCtrl',
                templateUrl: 'app/components/dialer/real_call.html',
                title: 'APP.PAGES.TITLES.CALL.REAL_CALL_DIALER'
            })

            .when('/company/details/:id', {
                controller: 'CompanyDetailsCtrl',
                templateUrl: 'app/components/company/details.html'
            })
            .when('/company/all', {
                controller: 'CompanyAllCtrl',
                templateUrl: 'app/components/company/all.html',
                title: 'APP.PAGES.TITLES.COMPANY.ALL'
            })

            .when('/objects/custom/data/details/:id', {
                controller: 'CustomObjectsDataAllCtrl',
                templateUrl: 'app/components/objects/data/all.html'
            })

            .when('/objects/custom/data/object/details/id/:id/collectionId/:collectionId', {
                controller: 'CustomObjectsDataDetailsCtrl',
                templateUrl: 'app/components/objects/data/details.html'
            })

            .when('/objects/custom/meta/all', {
                controller: 'CustomObjectsMetaAllCtrl',
                templateUrl: 'app/components/objects/meta/all.html',
                title: 'APP.PAGES.TITLES.CUSTOM_OBJECT.META.ALL'
            })

            .when('/objects/custom/meta/details/:id', {
                controller: 'CustomObjectsMetaDetailsCtrl',
                templateUrl: 'app/components/objects/meta/details.html'
            })

            .when('/customer/all', {
                controller: 'CustomerAllCtrl',
                templateUrl: 'app/components/customer/all.html',
                title: 'APP.PAGES.TITLES.CUSTOMERS.ALL'
            })

            .when('/opportunity/all', {
                controller: 'OpportunityAllCtrl',
                templateUrl: 'app/components/opportunity/all.html',
                title: 'APP.PAGES.TITLES.OPPORTUNITY.ALL'
            })

            .when('/customer_deal/all', {
                controller: 'CustomerDealAllCtrl',
                templateUrl: 'app/components/customer_deal/all.html',
                title: 'APP.PAGES.TITLES.DEALS.ALL'
            })

            .when('/company_cost/all', {
                controller: 'CompanyCostAllCtrl',
                templateUrl: 'app/components/company_cost/all.html',
                title: 'APP.PAGES.TITLES.COSTS.ALL'
            })

            .when('/customer/mass/excel', {
                controller: 'CustomerMassExcelCtrl',
                templateUrl: 'app/components/customer/mass/excel.html',
                title: 'APP.PAGES.TITLES.CUSTOMERS.EXCEL'
            })

            .when('/segment/static/all', {
                controller: 'AllStaticSegments',
                templateUrl: 'app/components/segments/static/all.html',
                title: 'APP.PAGES.TITLES.SEGMENTS.STATIC.ALL'
            })

            .when('/segment/dynamic/all', {
                controller: 'AllDynamicSegments',
                templateUrl: 'app/components/segments/dynamic/all.html',
                title: 'APP.PAGES.TITLES.SEGMENTS.DYNAMIC.ALL'
            })

            .when('/segment/static/details/:id', {
                controller: 'StaticSegmentDetailsCtrl',
                templateUrl: 'app/components/segments/static/details.html',
            })

            .when('/segment/dynamic/details/:id', {
                controller: 'DynamicSegmentDetailsCtrl',
                templateUrl: 'app/components/segments/dynamic/details.html',
            })

            .when('/customer/details/:id', {
                controller: 'CustomerDetailsCtrl',
                templateUrl: 'app/components/customer/details.html'
            })

            .when('/lead/all', {
                controller: 'CustomerAllCtrl',
                templateUrl: 'app/components/customer/all.html',
                title: 'APP.PAGES.TITLES.LEADS.ALL'
            })

            .when('/storage', {
                controller: 'DocumentsAllCtrl',
                templateUrl: 'app/components/storage/all.html',
                title: 'APP.PAGES.TITLES.STORAGE'
            })

            .when('/domain/my/settings', {
                controller: 'DomainCtrl',
                templateUrl: 'app/components/domain/settings.html',
                title: 'APP.PAGES.TITLES.DOMAIN.SETTINGS'
            })

            .when('/domain/my/settings/biqa_objects_custom_fields', {
                controller: 'DomainCustomFieldsCtrl',
                templateUrl: 'app/components/domain/biqa_objects_custom_fields.html',
                title: 'APP.PAGES.TITLES.DOMAIN.CUSTOM_FIELDS_FOR_BIQA_OBJECTS'
            })

            .when('/external_services', {
                controller: 'ExternalServicesAllCtrl',
                templateUrl: 'app/components/external_services/all.html',
                title: 'APP.PAGES.TITLES.EXTERNAL_SERVICES.ALL'
            })

            .when('/external_services/details/:id', {
                controller: 'ExternalServicesDetailsCtrl',
                templateUrl: 'app/components/external_services/details.html'
            })

            .when('/external_services/dropbox/oauth2/redirected/code/', {
                controller: 'DropboxOauth2RedirectedCtrl',
                templateUrl: 'app/components/external_services/redirected_wait.html'
            })

            .when('/external_services/gdrive/oauth2/redirected/code/', {
                controller: 'GoogleOauth2RedirectedCtrl',
                templateUrl: 'app/components/external_services/redirected_wait.html'
            })

            .when('/marketing/lead_gen_methods', {
                controller: 'AllLeadGenMethodsCtrl',
                templateUrl: 'app/components/lead_gen/method/lead_gen_method_all.html',
                title: 'APP.PAGES.TITLES.LEAD_GEN_METHODS.ALL'
            })

            .when('/marketing/lead_gen_methods/id/:id', {
                controller: 'LeadGenMethodsByIdCtrl',
                templateUrl: 'app/components/lead_gen/method/lead_gen_method_details.html'
            })
            .when('/marketing/lead_gen_methods/lead_gen_project/id/:id', {
                controller: 'LeadGenProjectByIdCtrl',
                templateUrl: 'app/components/lead_gen/project/lead_gen_project_details.html'
            })

            .when('/login/login', {
                controller: 'LoginCtrl',
                templateUrl: 'app/components/login/login.html',
                title: 'APP.PAGES.TITLES.LOGIN'
            })

            .when('/notifications/settings', {
                controller: 'NotificationsSettingsCtrl',
                templateUrl: 'app/components/notifications/settings.html'
            })

            .when('/debug', {
                controller: 'DebugCtrl',
                templateUrl: 'app/components/system/debug.html'
            })

            .when('/system/overview', {
                controller: 'SystemOverviewCtrl',
                templateUrl: 'app/components/system/overview.html'
            })

            .when('/reports/sellers', {
                controller: 'MotivationDeskCtrl',
                templateUrl: 'app/components/reports/sellers_motivation_desk.html',
                title: 'APP.PAGES.TITLES.REPORTS.SELLER_MOTIVATION_DESK'
            })

            .when('/data_source/all', {
                controller: 'DataSourceCtrl',
                templateUrl: 'app/components/data_source/all.html',
                title: 'APP.PAGES.TITLES.DATA_SOURCE.ALL'
            })

            .when('/data_source/details/:id', {
                controller: 'DataSourceDetailsCtrl',
                templateUrl: 'app/components/data_source/details.html'
            })

            .when('/task/details/:id', {
                controller: 'TasksDetailsCtrl',
                templateUrl: 'app/components/task/details.html'
            })
            .when('/task/planning', {
                controller: 'TasksPlanningCtrl',
                templateUrl: 'app/components/task/planning.html',
                title: 'APP.PAGES.TITLES.TASK.PLANNING'
            })

            .when('/task', {
                controller: 'TaskAllCtrl',
                templateUrl: 'app/components/task/all.html',
                title: 'APP.PAGES.TITLES.TASK.ALL'
            })

            .when('/task/projects/all', {
                controller: 'ProjectsAllCtrl',
                templateUrl: 'app/components/task/projects/all.html',
                title: 'APP.PAGES.TITLES.TASK.PROJECT.ALL'
            })

            .when('/task/projects/details/:id', {
                controller: 'ProjectDetailsCtrl',
                templateUrl: 'app/components/task/projects/details.html'
            })

            .when('/user_account/details/:id', {
                controller: 'UserAccountDetailsCtrl',
                templateUrl: 'app/components/user_account/details.html'
            })
            .when('/myaccount', {
                controller: 'MyAccountCtrl',
                templateUrl: 'app/components/user_account/myaccount.html',
                title: 'APP.PAGES.TITLES.USERACCOUNT.MYACCOUNT'
            })

            .when('/user_account/all', {
                controller: 'AllUserAccountsCtrl',
                templateUrl: 'app/components/user_account/all.html',
                title: 'APP.PAGES.TITLES.USERACCOUNT.ALL'
            })

            .when('/user_account/new', {
                controller: 'UserAccountNewCtrl',
                templateUrl: 'app/components/user_account/new.html',
                title: 'APP.PAGES.TITLES.USERACCOUNT.NEW'
            })

            .when('/user_account/groups', {
                controller: 'AllUserAccountsGroupsCtrl',
                templateUrl: 'app/components/user_account/groups/all.html',
                title: 'APP.PAGES.TITLES.USERACCOUNT.GROUPS.ALL'
            })

            .when('/user_account/groups/details/:id', {
                controller: 'UserAccountGroupsDetailsCtrl',
                templateUrl: 'app/components/user_account/groups/details.html'
            })

            .when('/widgets/create/custom', {
                controller: 'CustomWidgetCreator',
                templateUrl: 'app/components/widgets/create/custom.html',
                title: 'APP.PAGES.TITLES.WIDGET.CREATOR.CUSTOM'
            })

            .when('/widgets/create/predefined', {
                controller: 'PredefinedWidgetCreator',
                templateUrl: 'app/components/widgets/create/predefined.html',
                title: 'APP.PAGES.TITLES.WIDGET.CREATOR.PREDEFINED'
            })

            .when('/yandex/direct/banners/compaigns/:id/token/:tokenId', {
                controller: 'BannersCompaignsCtrl',
                templateUrl: 'app/components/yandex/direct/banners_by_campaigns.html'
            })
            .when('/yandex/direct/history/banners/compaigns/:id/token/:tokenId/realCampaignId/:realCampaignId', {
                controller: 'BannersCompaignsHistoryCtrl',
                templateUrl: 'app/components/yandex/direct/history/banners_by_campaigns.html'
            })

            .when('/yandex/direct/allCompaigns/token/:id', {
                controller: 'DirectTokenCampaigns',
                templateUrl: 'app/components/yandex/direct/campaigns_by_token.html'
            })
            .when('/yandex/direct/history/allCompaigns/token/:id/historyId/:historyId', {
                controller: 'DirectTokenCampaignsHistory',
                templateUrl: 'app/components/yandex/direct/history/campaigns_by_token.html'
            })

        ;
    }]);
