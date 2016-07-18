'use strict';

/**
 * API requests to server
 */
angular.module('app.services.api', ['LocalStorageModule', 'ngRoute', 'app.services'])

    .service('widgetService', ['serverRequestService', function (serverRequestService) {

        // dashboards
        this.getAllDashboards = function () {
            return serverRequestService.get('widgets/dashboard');
        };

        this.addNewDashboard = function (widget) {
            return serverRequestService.post("widgets/dashboard/", widget);
        };

        this.updateOneDashboard = function (widget) {
            return serverRequestService.put('widgets/dashboard', widget);
        };

        this.deleteDashboardById = function (widget) {
            return serverRequestService.delete('widgets/dashboard/' + widget);
        };

        this.updateAllDashBoards = function (widget) {
            return serverRequestService.put('widgets/dashboard/all', widget);
        };

        this.getAllBackgroundWidgets = function () {
            return serverRequestService.get('widgets/background/all');
        };

        // widgets
        this.addWidget = function (widget) {
            return serverRequestService.post('widgets', widget);
        };

        this.updateWidget = function (widget) {
            return serverRequestService.put('widgets/', widget);
        };

        this.deleteWidgetById = function (widget) {
            return serverRequestService.delete('widgets/' + widget);
        };

    }])
    .service('storageService', ['serverRequestService', '$rootScope', function (serverRequestService, $rootScope) {

        this.updateDocuments = function (obj) {
            return serverRequestService.put('storage', obj);
        };

        this.sendMetaInformation = function (data) {
            return serverRequestService.post('storage/upload/send_meta_information', data);
        };

        this.deleteFile = function (data) {
            return serverRequestService.post('storage/delete', data);
        };

        this.filter = function (data) {
            return serverRequestService.post('storage/filter', data);
        };

        this.getDocumentURLById = function (id) {
            return serverRequestService.get('storage/get_document_url_by_id/' + id);
        };

        this.getAllProviders = function (data) {
            return serverRequestService.post('storage/providers', data);
        };

        this.downloadFileEveyType = function (file) {
            serverRequestService.post('storage/download_file', file, {responseType: 'arraybuffer'}).then(function (data) {

                $rootScope.downloadFile(
                    {
                        file: data, type: file.mimeType,
                        filename: file.name
                    })

            });
        };

        /**
         * File object which will be downloaded from server and start audio
         * @param file
         */
        this.listenAudioDownloaded = function (file) {

            // optimisation - get direct link from amazon s3 to browser
            // not download file through backend server
            if (file.uploadStoreType === "DEFAULT" || file.uploadStoreType === "S3") {

                serverRequestService.get('storage/get_document_url_by_id/' + file.id).then(function (c) {
                    var a = {};
                    a.url = c.data;
                    a.title = file.name;

                    $rootScope.addAudioToPlay(a);
                });

                // if backend do not support get direct downloadable link for this storage
                // get BLOB data (bytes)    
            } else {
                serverRequestService.post('storage/download_file', file, {responseType: 'arraybuffer'}).then(function (data) {

                    $rootScope.downloadFileListen(
                        {
                            file: data, type: file.mimeType,
                            filename: file.name
                        })
                });
            }

        };

        this.downloadFile = function (id) {
            serverRequestService.get('storage/get_document_url_by_id/' + id).then(function (c) {
                console.log(c.data);

                var link = document.createElement("a");
                link.href = c.data;
                link.click();
            });
        };

    }])

    .service('UserService', ['serverRequestService', function (serverRequestService) {

        this.getAllUsers = function () {
            return serverRequestService.get('account');
        };

        this.getAccountById = function (id) {
            return serverRequestService.get('account/' + id);
        };

        this.updateUserAccount = function (customer) {
            return serverRequestService.put('account', customer);
        };

        this.changePassword = function (customer) {
            return serverRequestService.put('account/change_password', customer);
        };

        this.getCurrentUser = function () {
            return serverRequestService.get("myaccount");
        };

        this.createNewCredentials = function () {
            return serverRequestService.post("myaccount/oauth/create_new_credentials", {});
        };

        this.createNewCredentialsWithRoles = function (roles) {
            return serverRequestService.post("myaccount/oauth/create_new_credentials", roles);
        };

        this.getOAuthTokens = function () {
            return serverRequestService.get("myaccount/oauth/tokens");
        };

        this.deleteOAuthTokens = function (id) {
            return serverRequestService.post("myaccount/oauth/tokens/delete", {username: id});
        };

        this.setCurrentUserOnline = function () {
            return serverRequestService.get("myaccount/set_online", {cache: "disable"});
        };

        this.setPersonalSettings = function (personalSettings) {
            return serverRequestService.put("myaccount/personal_settings", personalSettings, {cache: "disable"});
        };

        this.updateCurrentUser = function (account) {
            return serverRequestService.put("myaccount", account);
        };

    }])

    .service('objectsHistoryService', ['serverRequestService', '$rootScope', function (serverRequestService, $rootScope) {

        this.getObjectHistoryChangesByTypeAndId = function (id, type) {
            return serverRequestService.get('diff/history/objects/class/' + type + '/id/' + id);
        };

    }])

    .service('customerService', ['serverRequestService', '$rootScope', function (serverRequestService, $rootScope) {

        this.isCustomerHaveStaticSegment = function (customer, segmentID) {
            if (!customer || !customer.staticSegmentsIDs) return false;

            for (var i = 0; i < customer.staticSegmentsIDs.length; i++) {
                if (customer.staticSegmentsIDs[i] === segmentID) return true
            }

            return false;
        };
        $rootScope.isCustomerHaveStaticSegment = this.isCustomerHaveStaticSegment;

        this.getCustomerOrLeadChangesStringedById = function (id) {
            return serverRequestService.get('diff/history/objects/class/CUSTOMER/id/' + id);
        };

        this.getCustomerOrLeadByIdDetails = function (id) {
            return serverRequestService.get('customer/details/' + id);
        };

        this.getAllCustomerByBuilder = function (customerAndLeadGetRequestCriteriaDao) {
            return serverRequestService.post('customer/filter', customerAndLeadGetRequestCriteriaDao, {cache: "enable"});
        };

        this.getAllCompanyByBuilder = function (customerAndLeadGetRequestCriteriaDao) {
            return serverRequestService.post('company/filter', customerAndLeadGetRequestCriteriaDao, {cache: "enable"});
        };

        this.getExcelByFilter = function (customerAndLeadGetRequestCriteriaDao) {
            return serverRequestService.post('customer/filter/excel', customerAndLeadGetRequestCriteriaDao, {responseType: 'arraybuffer'});
        };

        this.addCustomer = function (customer) {
            return serverRequestService.post('customer', customer);
        };

        this.addCustomerList = function (customer) {
            return serverRequestService.post('customer/list', customer);
        };

        this.updateCustomer = function (customer) {
            return serverRequestService.put('customer', customer);
        };

        // segments
        this.getStaticSegmentById = function (id) {
            return serverRequestService.get('segment/static/' + id);
        };

        this.getAllStaticSegments = function () {
            return serverRequestService.get('segment/static');
        };

        this.getAllDynamicSegments = function () {
            return serverRequestService.get('segment/dynamic');
        };

        this.getCustomersByStaticSegment = function (id) {
            return serverRequestService.get('segment/static/' + id + '/customers');
        };

        this.getStatsByStaticSegment = function (id) {
            return serverRequestService.get('segment/static/' + id + '/stats');
        };

        // dynamic segments
        this.addDynamicSegment = function (segment) {
            return serverRequestService.post('segment/dynamic', segment);
        };

        this.updateDynamicSegment = function (segment) {
            return serverRequestService.put('segment/dynamic', segment);
        };

        this.getStatsByDynamicSegment = function (id) {
            return serverRequestService.get('segment/dynamic/' + id + '/stats');
        };

        this.getDynamicSegmentById = function (id) {
            return serverRequestService.get('segment/dynamic/' + id);
        };

        //this.getCustomersByDynamicSegment = function(id) {
        //    return serverRequestService.get('segment/dynamic/' + id + '/customers');
        //};

        this.addDynamicSegment = function (dynamic) {
            return serverRequestService.post('segment/dynamic', dynamic);
        };

        this.addStaticSegment = function (staticSegmetn) {
            return serverRequestService.post('segment/static', staticSegmetn);
        };

        this.updateDynamicSegment = function (dynamic) {
            return serverRequestService.put('segment/dynamic', dynamic);
        };

        this.updateStaticSegment = function (staticSegmetn) {
            return serverRequestService.put('segment/static', staticSegmetn);
        };

    }])

    .service('analyticsService', ['serverRequestService', function (serverRequestService) {

        this.getCallStatsToday = function (id) {
            return serverRequestService.get('indicators/callers/today');
        };

        this.getManagerCreatedByCustomerAndLeads = function (data) {
            return serverRequestService.post('indicators/manager/kpis/created_leads_and_customers', data, {cache: "enable"});
        };

        this.getAllWebCounters = function (id) {
            return serverRequestService.get('analytics/web/counters');
        };

        this.getWebCounterById = function (id) {
            return serverRequestService.get('analytics/web/counter/' + id);
        };

        this.updateWebCounter = function (a) {
            return serverRequestService.put('analytics/web/counter', a);
        };

        this.getAllAnalyticRecordsByCounterId = function (id) {
            return serverRequestService.get('analytics/web/records_by_counter_id/all/' + id);
        };

        this.getAllAnalyticRecordsByCookiesIds = function (a) {
            return serverRequestService.post('analytics/web/analytics_record/by_cookies_ids', a);
        };

        this.addNewWebCounter = function () {
            return serverRequestService.post('analytics/web/counter', {});
        };

    }])
    .service('opportunityService', ['serverRequestService', function (serverRequestService) {

        this.addNewOpportunity = function (customer) {
            return serverRequestService.post('opportunity', customer);
        };

        this.saveExistingOpportunity = function (customer) {
            return serverRequestService.put('opportunity/', customer);
        };

        this.deleteExistingOpportunity = function (customer) {
            return serverRequestService.delete('opportunity/' + customer.id);
        };

        this.getOpportunityByBuilder = function (filterObj) {
            return serverRequestService.post('opportunity/filter', filterObj, {cache: "enable"});
        };

    }])

    .service('customObjectsService', ['serverRequestService', function (serverRequestService) {

        this.getCustomObjectsMetaById = function (id) {
            return serverRequestService.get('objects/custom/metadata/' + id);
        };

        this.addCustomObjectMeta = function (customer) {
            return serverRequestService.post('objects/custom/metadata', customer);
        };

        this.getCustomObjectMetaByBuilder = function (customer) {
            return serverRequestService.post('objects/custom/metadata/filter', customer);
        };

        this.updateCustomObjectMeta = function (customer) {
            return serverRequestService.put('objects/custom/metadata', customer);
        };

        this.deleteCustomObjectMeta = function (customer) {
            return serverRequestService.delete('objects/custom/metadata/' + customer.id);
        };

    }])

    .service('customObjectsDataService', ['serverRequestService', function (serverRequestService) {

        this.getExcelByFilter = function (customerAndLeadGetRequestCriteriaDao) {
            return serverRequestService.post('objects/custom/data/filter/excel', customerAndLeadGetRequestCriteriaDao, {responseType: 'arraybuffer'});
        };

        this.getPrintableBuilder = function (customerAndLeadGetRequestCriteriaDao) {
            return serverRequestService.post('objects/custom/data/filter/printable', customerAndLeadGetRequestCriteriaDao, {responseType: 'arraybuffer'});
        };

        this.getCustomObjectsDataById = function (object) {
            return serverRequestService.get('objects/custom/data/id/' + object.id + '/collection_id/' + object.collectionId);
        };

        this.addCustomObjectData = function (customer) {
            return serverRequestService.post('objects/custom/data', customer);
        };

        this.getCustomObjectDataByBuilder = function (customer) {
            return serverRequestService.post('objects/custom/data/filter', customer);
        };

        this.updateCustomObjectData = function (customer) {
            return serverRequestService.put('objects/custom/data', customer);
        };

        this.deleteCustomObjectData = function (object) {
            return serverRequestService.delete('objects/custom/data/id/' + object.id + '/collection_id/' + object.collectionId);
        };

        this.addSegment = function (segment) {
            return serverRequestService.post('objects/custom/data/segments', segment);
        };

        this.updateSegment = function (segment) {
            return serverRequestService.put('objects/custom/data/segments', segment);
        };

        this.getAllSegment = function () {
            return serverRequestService.get('objects/custom/data/segments');
        };

        this.deleteSegment = function (id) {
            return serverRequestService.delete('objects/custom/data/segments/' + id);
        };

    }])

    .service('weatherRepositoryService', ['serverRequestService', function (serverRequestService) {

        this.getWeatherByPlaceId = function (id) {
            return serverRequestService.get("weather/place/" + id);
        };

    }])

    .service('currencyExchangeRepositoryService', ['serverRequestService', function (serverRequestService) {

        this.getExchangesRates = function (first, second) {
            return serverRequestService.get("currency/" + first + "/" + second);
        };

    }])

    .service('statsRepositoryService', ['serverRequestService', function (serverRequestService) {

        this.getBasicStats = function () {
            return serverRequestService.get('indicators/basic_stats');
        };

    }])

    .service('leadRepositoryService', ['serverRequestService', function (serverRequestService) {
        this.getAllLeadGenMethod = function () {
            return serverRequestService.get("lead_gen_method");
        };

    }])

    .service('timeService', function () {

        this.returnTimeDifferenceBetweenDate = function (first) {
            var now = new Date();
            var res = first - now;
            if (res < 0){
                return null;
            }

            res = Math.round((res) / 1000 / 60 / 60);
            return res;
        };

        this.getDayFromTime = function (time) {
            return new Date(time).getDate();
        };

        this.getMonthFromTime = function (time) {
            return new Date(time).getMonth() + 1;
        };

        this.getYearFromTime = function (time) {
            return new Date(time).getFullYear();
        };

        this.getHoursFromTime = function (time) {
            return new Date(time).getHours();
        };

        this.getMinutesFromTime = function (time) {
            return new Date(time).getMinutes();
        };

        this.getAllDateExpression = function () {
            var a = [
                {
                    "value": "%CURRENT_DAY_START%",
                    "name": "APP.DATE.CURRENT_DAY_START"
                },

                {
                    "value": "%CURRENT_DAY_END%",
                    "name": "APP.DATE.CURRENT_DAY_END"
                },

                {
                    "value": "%CURRENT_MONTH_START%",
                    "name": "APP.DATE.CURRENT_MONTH_START"
                },

                {
                    "value": "%CURRENT_MONTH_END%",
                    "name": "APP.DATE.CURRENT_MONTH_END"
                }

            ];
            return a;
        };

    })

    .service('SystemService', ['$rootScope', function ($rootScope) {//
        this.buildDataObjectBuilder = function (buildQuery) {
            var resultData = buildQuery;

            if (resultData.fullTextSearchRequest && resultData.fullTextSearchRequest.length > 0) {
                resultData.useFullTextSearch = true;
            } else {
                resultData.useFullTextSearch = false;
            }

            return resultData;

        };

        /**
         * generate unic mongoDB Id
         * @returns {*}
         */

        //this.generateBsonId = function() {
        //    return serverRequestService.get("constants/generateId");
        //};

        this.getListOfIDsFromArrayObjects = function (array) {
            if (!array) return null;
            var resultArrayIDs = [];
            for (var i = 0; i < array.length; i++) {
                if (array[i] && array[i].id)
                    resultArrayIDs.push(array[i].id);
            }

            return resultArrayIDs;
        };

        this.universalResolver = function (allDataArray, currentID) {
            if (isUndefinedOrNull(allDataArray) || isUndefinedOrNull(currentID)) return null;
            for (var i = 0; i < allDataArray.length; i++) {
                if (allDataArray[i].id === currentID) return allDataArray[i];
            }

            return null;
        };

        this.universalResolverWithField = function (allDataArray, currentID, fieldName) {
            if (!allDataArray || !allDataArray.length) return null;
            for (var i = 0; i < allDataArray.length; i++) {
                if (allDataArray[i][fieldName] === currentID) return allDataArray[i];
            }

            return null;
        };

        this.getNumberOfuniversalResolverWithField = function (allDataArray, currentID, fieldName) {
            if (isUndefinedOrNull(allDataArray) || isUndefinedOrNull(currentID) || isUndefinedOrNull(fieldName)) return null;
            for (var i = 0; i < allDataArray.length; i++) {
                if (allDataArray[i][fieldName] === currentID) return i;
            }

            return null;
        };
        $rootScope.universalResolverWithField = this.universalResolver;
        $rootScope.getNumberOfuniversalResolverWithField = this.getNumberOfuniversalResolverWithField;

        this.getBasisBuilder = function () {

            var filter = {};

            filter.useRelativeCreatedDateFrom = false;
            filter.useRelativeCreatedDateTo = false;

            filter.relativeCreatedDateFrom = "";
            filter.relativeCreatedDateTo = "";

            filter.sortDESCbyCreatedDate = true;

            return filter;
        };

        this.customFieldTypes = [
            {
                "name": "CUSTOM_FIELDS.TYPES.INTEGER.NAME",
                "value": "INTEGER"
            },
            {
                "name": "CUSTOM_FIELDS.TYPES.DOUBLE.NAME",
                "value": "DOUBLE"
            },
            {
                "name": "CUSTOM_FIELDS.TYPES.STRING.NAME",
                "value": "STRING"
            },
            {
                "name": "CUSTOM_FIELDS.TYPES.DATE.NAME",
                "value": "DATE"
            },

            //{
            //    "name":"CUSTOM_FIELDS.TYPES.MAP.NAME",
            //    "value":"MAP"
            //},
            {
                "name": "CUSTOM_FIELDS.TYPES.DICTIONARY.NAME",
                "value": "DICTIONARY"
            },
            {
                "name": "CUSTOM_FIELDS.TYPES.BOOLEAN.NAME",
                "value": "BOOLEAN"
            },
            {
                "name": "CUSTOM_FIELDS.TYPES.DOCUMENT_FILE.NAME",
                "value": "DOCUMENT_FILE"
            }
            ,
            {
                "name": "CUSTOM_FIELDS.TYPES.STRING_LIST.NAME",
                "value": "STRING_LIST"
            },
            {
                "name": "CUSTOM_FIELDS.TYPES.USER_ACCOUNTS.NAME",
                "value": "USER_ACCOUNTS"
            }

        ];

        this.customFieldStringStyles = [
            {
                "name": "CUSTOM_FIELDS.TYPES.STRING.STYLES.STRING_AUTO.NAME",
                "value": "STRING_AUTO"
            },
            {
                "name": "CUSTOM_FIELDS.TYPES.STRING.STYLES.STRING_CONFIRM.NAME",
                "value": "STRING_CONFIRM"
            },
            {
                "name": "CUSTOM_FIELDS.TYPES.STRING.STYLES.TEXTAREA.NAME",
                "value": "TEXTAREA"
            },
            {
                "name": "CUSTOM_FIELDS.TYPES.STRING.STYLES.STRING_RICH_TEXT.NAME",
                "value": "STRING_RICH_TEXT"
            }

        ];

        this.customFieldDateStyles = [
            {
                "name": "CUSTOM_FIELDS.TYPES.DATE.STYLES.DATE_WITH_TIME.NAME",
                "value": "DATE_WITH_TIME"
            },
            {
                "name": "CUSTOM_FIELDS.TYPES.DATE.STYLES.DATE_ONLY_DATE.NAME",
                "value": "DATE_ONLY_DATE"
            }
        ];

        this.allCurrency = [
            {
                "name": "Рубль",
                "value": "RUB",
                "series": ["рубль", "рубля", "рублей"]
            },
            {
                "name": "Belarussian Ruble",
                "value": "BYR"
            },
            {
                "name": "EUR",
                "value": "EUR"
            },
            {
                "name": "USD",
                "value": "USD"
            },
            {
                "name": "Гривна",
                "value": "UAH"
            }

        ];

    }])

    .service('AuthService', ['serverRequestService', function (serverRequestService) {

        // get meta info about application
        this.getOauthApplicationById = function (id) {
            return serverRequestService.get("oauth/application/" + id);
        };

        this.deleteOauthApplicationById = function (id) {
            return serverRequestService.delete("oauth/application/" + id);
        };

        this.getOauthApplicationSecretCodeById = function (id) {
            return serverRequestService.get("oauth/application/" + id + "/secret_code");
        };

        this.getAllPublicOauthApplications = function () {
            return serverRequestService.get("oauth/application/list/public");
        };

        this.getAllOauthApplicationsInDomain = function () {
            return serverRequestService.get("oauth/application/list/domain");
        };

        this.authoriseNewApplicationToUser = function (obj) {
            return serverRequestService.post("myaccount/oauth/get_new_token", obj);
        };

        this.createNewOAuthApplication = function (obj) {
            return serverRequestService.post("oauth/application", obj);
        };

        this.updateOAuthApplication = function (obj) {
            return serverRequestService.put("oauth/application", obj);
        };

    }])

    .service('SalesFunnelService', ['serverRequestService', '$rootScope', function (serverRequestService, $rootScope) {

        this.translateDataSourcesArrayToHighchartsSeries = function (dataSourcesArray) {
            var res = [];

            for (var i = 0; i < dataSourcesArray.length; i++) {
                var a = [dataSourcesArray[i].id, parseFloat($rootScope.getResolvedOneData(dataSourcesArray[i]))];
                res.push(a);
            }

            return res;
        };

        this.allWidgetsTemplates = [
            {
                "name": "DATA_SOURCE_ONE_DATA_STYLE1",
                "url": "templates/widgets/DATA_SOURCE_ONE_DATA_STYLE_1.html"
            },
            {
                "name": "IFRAME",
                "url": "templates/widgets/IFRAME.html"
            },
            {
                "name": "MANAGER_LEADS_CUSTOMERS_BAR",
                "url": "templates/widgets/MANAGER_LEADS_CUSTOMERS_BAR.html"
            },
            {
                "name": "DATA_SOURCE_ONE_DATA_STYLE2",
                "url": "templates/widgets/DATA_SOURCE_ONE_DATA_STYLE_2.html"
            },
            {
                "name": "DATA_SOURCE_COMPLEX_DATA_PIE",
                "url": "templates/widgets/DATA_SOURCE_COMPLEX_DATA_PIE.html"
            },
            {
                "name": "DATA_SOURCE_COMPLEX_DATA_COLUMN",
                "url": "templates/widgets/DATA_SOURCE_COMPLEX_DATA_COLUMN.html"
            },
            {
                "name": "TASKS_MINI",
                "url": "templates/widgets/TASKS_MINI.html"
            },
            {
                "name": "LEADS_LASTS",
                "url": "templates/widgets/LEADS_LASTS.html"
            },
            {
                "name": "COLD_CALL",
                "url": "templates/widgets/COLD_CALL.html"
            },
            {
                "name": "COMPANY_AIM_GAUGE",
                "url": "templates/widgets/COMPANY_AIM_GAUGE.html"
            },
            {
                "name": "MANAGER_PAYMENTS_BUBBLE",
                "url": "templates/widgets/MANAGER_PAYMENTS_BUBBLE.html"
            },
            {
                "name": "MANAGER_PAYMENTS_PIE",
                "url": "templates/widgets/MANAGER_PAYMENTS_PIE.html"
            }

        ];

        this.widgetsLocations = [
            {
                "name": "WIDGETS.LOCATIONS.DASHBOARD",
                "value": "DASHBOARD"
            },
            {
                "name": "WIDGETS.LOCATIONS.BACKGROUND",
                "value": "BACKGROUND"
            }
        ];

        this.getAllDataSourceControllers = [
            {
                "name": "DATA_SOURCE.CONTROLLERS.CUSTOMERS_OR_LEADS_NUMBER_BY_SALES_FUNNEL_STATUS.NAME",
                "value": "CUSTOMERS_OR_LEADS_NUMBER_BY_SALES_FUNNEL_STATUS"
            }, {
                "name": "DATA_SOURCE.CONTROLLERS.INSIDE_VALUE.NAME",
                "value": "INSIDE_VALUE"
            }, {
                "name": "DATA_SOURCE.CONTROLLERS.CUSTOMERS_BY_DYNAMIC_SEGMENT_ID.NAME",
                "value": "CUSTOMERS_BY_DYNAMIC_SEGMENT_ID"
            }, {
                "name": "DATA_SOURCE.CONTROLLERS.SAFE_JS_CODE_EXECUTE.NAME",
                "value": "SAFE_JS_CODE_EXECUTE"
            }

        ];

        this.getAlldataSource = function () {
            return serverRequestService.get("data_source");
        };

        this.getDataSourceByBuilder = function (newSalesFunnel) {
            return serverRequestService.post("data_source/filter", newSalesFunnel);
        };

        this.getDataSourceIntegerIndicators = function (newSalesFunnel) {
            return serverRequestService.post("indicators/filter/data_source/kpi/integer", newSalesFunnel);
        };

        this.getDataSourceById = function (id) {
            return serverRequestService.get("data_source/" + id);
        };

        this.updateDataSource = function (data) {
            return serverRequestService.put("data_source", data);
        };

        this.deleteDataSource = function (id) {
            return serverRequestService.delete("data_source/" + id);
        };

        this.addDataSource = function (newSalesFunnel) {
            return serverRequestService.post("data_source", newSalesFunnel);
        };

        this.getExcelByFilter = function (customerAndLeadGetRequestCriteriaDao) {
            return serverRequestService.post('data_source/filter/excel', customerAndLeadGetRequestCriteriaDao, {responseType: 'arraybuffer'});
        };

    }])

    .service('SearchService', ['serverRequestService', function (serverRequestService) {

        this.allSearch = function (text) {
            var a = {};
            a.text = text;
            return serverRequestService.post("search", a);
        };
    }])

    .service('PaymentsService', ['serverRequestService', function (serverRequestService) {

        // this.getKPIByLeadGenMethodId = function(id) {
        //     return serverRequestService.get("indicators/lead_gen_method/" + id);
        // };

        // this.getKPIByLeadGenMethodIdBuilder = function(newSalesFunnel) {
        //     return serverRequestService.post("indicators/filter/lead_gen_method", newSalesFunnel);
        // };

        //this.getKPIByLeadGenProjectId = function(id) {
        //    return serverRequestService.get("indicators/lead_gen_project/" + id);
        //};
        //
        //this.getAllCustomerDeals = function() {
        //    return serverRequestService.get("payments/customer_deal");
        //};

        this.getDealsByBuilder = function (filterObj) {
            return serverRequestService.post('payments/customer_deal/filter', filterObj, {cache: "enable"});
        };

        this.getCostsByBuilder = function (filterObj) {
            return serverRequestService.post('payments/company_cost/filter', filterObj, {cache: "enable"});
        };

        this.getAllManagerStatsFromBuilder = function (filter) {
            return serverRequestService.post("indicators/manager/payment/filter", filter, {cache: "enable"});
        };

        //this.getAllCompanyCost = function() {
        //    return serverRequestService.get("payments/company_cost");
        //};

        this.addCompanyCost = function (newSalesFunnel) {
            return serverRequestService.post("payments/company_cost", newSalesFunnel);
        };

        //this.getAllCompanyCostByLeadGenProjectId = function(id) {
        //    return serverRequestService.get("payments/company_cost/all/byLeadGenProjectId/" + id);
        //};
        //
        //this.getAllDealsByCustomerId = function(id) {
        //    return serverRequestService.get('payments/customer_deal/byCustomerId/' + id);
        //};

        this.addNewDeal = function (customer) {
            return serverRequestService.post('payments/customer_deal', customer);
        };

        this.addNewDealFromOpportunity = function (id) {
            return serverRequestService.post('payments/customer_deal/deal_from_opportunity/' + id, {});
        };

        this.saveExistingDeal = function (customer) {
            return serverRequestService.put('payments/customer_deal', customer)
        };

        this.deleteExistingDeal = function (customer) {
            return serverRequestService.delete('payments/customer_deal/' + customer.id);
        };

    }])

    .service('LeadGenService', ['serverRequestService', function (serverRequestService) {

        this.getExcelByFilter = function (customerAndLeadGetRequestCriteriaDao) {
            return serverRequestService.post('lead_gen_method/filter/excel', customerAndLeadGetRequestCriteriaDao, {responseType: 'arraybuffer'});
        };

        this.getLeadGenKPIs = function (filter) {
            return serverRequestService.post('indicators/filter/lead_gen_method/kpi', filter);
        };

        this.getAllLeadGenMethods = function () {
            return serverRequestService.get("lead_gen_method");
        };

        this.getAllLeadGenMethodById = function (id) {
            return serverRequestService.get("lead_gen_method/id/" + id);
        };

        this.addNewLeadGenMethods = function (newLead) {
            return serverRequestService.post("lead_gen_method", newLead);
        };

        this.addNewLeadGenProject = function (newLead) {
            return serverRequestService.post("lead_gen_method/lead_gen_project", newLead);
        };

        this.getAllLeadGenProjects = function () {
            return serverRequestService.get("lead_gen_method/lead_gen_project");
        };

        this.updateLeadGenLeadGenMethod = function (newLead) {
            return serverRequestService.put("lead_gen_method", newLead);
        };

        this.updateLeadGenProject = function (newLead) {
            return serverRequestService.put("lead_gen_method/lead_gen_project", newLead);
        };

        this.getLeadGenProjectById = function (id) {
            return serverRequestService.get("lead_gen_method/lead_gen_project/id/" + id);
        };

        this.getLeadGenMethodByPromoCodeId = function (id) {
            return serverRequestService.get("lead_gen_method/promo_codes/" + id);
        };

        this.getLeadGenProjectByPromoCodeId = function (id) {
            return serverRequestService.get("lead_gen_method/lead_gen_project/promo_codes/" + id);
        };

        this.geAllPromoCodes = function (id) {
            return serverRequestService.get("lead_gen_method/lead_gen_project/promo_codes");
        };

    }])

    .service('NotificationsService', ['serverRequestService', function (serverRequestService) {

        this.getAllNotificationsAccess = function () {
            return serverRequestService.get("notification/push/android");
        };

        this.testAndroidPush = function (androidIdPush, message) {
            return serverRequestService.post("/notification/sendPushToDevice/" + androidIdPush, message);
        };

        this.pushAccess = function (newPushAccess) {
            return serverRequestService.post("notification/push/access", newPushAccess);
        };

    }])

    .service('companyService', ['serverRequestService', function (serverRequestService) {
        this.addCompany = function (customer) {
            return serverRequestService.post("company", customer);
        };

        this.getAllCompanies = function () {
            return serverRequestService.get("company");
        };

        this.getCompanyById = function (id) {
            return serverRequestService.get("company/" + id);
        };

        this.updateCompany = function (customer) {
            return serverRequestService.put("company", customer);
        };

    }])

    .service('domainService', ['serverRequestService', function (serverRequestService) {
        this.getMyDomainSettings = function () {
            return serverRequestService.get("domain_settings/my");
        };

        this.getMyDomainInfo = function () {
            return serverRequestService.get("domain_settings/info");
        };

        this.updateDomainSettings = function (customer) {
            return serverRequestService.put("domain_settings", customer);
        };

        this.getDatabaseCredentials = function () {
            return serverRequestService.post("admin/database/credentials", {});
        };

        this.getAllUsersInDomainDataBase = function () {
            return serverRequestService.get("admin/database/users");
        };

        this.dropUserDataBase = function (username) {
            return serverRequestService.delete("admin/database/users/" + username);
        };

        this.executeDatabaseCommand = function (command) {
            return serverRequestService.post("admin/database/command/execute", command);
        };

        this.serverHealthRoot = function () {
            return serverRequestService.get("/");
        };

    }])

    .service('bpmnService', ['serverRequestService', function (serverRequestService) {

        this.executeJavaScriptRaw = function (command) {
            return serverRequestService.post("bpmn/safejs/execute/raw", command);
        };

    }])

    .service('TaskService', ['serverRequestService', function (serverRequestService) {

        this.getAllTaskTemplate = function () {
            return serverRequestService.get('task/template');
        };

        this.getTaskTemplateByCustomerId = function (id) {
            return serverRequestService.get("task/template/id/" + id);
        };

        this.addTaskTemplate = function (customer) {
            return serverRequestService.post('task/template/', customer);
        };

        this.addTask = function (customer) {
            return serverRequestService.post('task', customer);
        };

        this.getTaskById = function (id) {
            return serverRequestService.get("task/id/" + id);
        };

        this.getAllTasksWithTaskBuilder = function (taskBuilderDao) {
            return serverRequestService.post("task/filter", taskBuilderDao, {cache: "enable"});
        };

        this.getAllTasksForController = function () {
            return serverRequestService.get("task");
        };

        this.getAllTasksByCustomerId = function (id) {
            var taskBuilderDao = {};
            taskBuilderDao.useConnectedCustomerId = true;
            taskBuilderDao.connectedCustomerId = id;

            return serverRequestService.post("task/filter", taskBuilderDao, {cache: "enable"});
        };

        this.updateTask = function (customer) {
            return serverRequestService.put('task', customer);
        };

        this.deleteTask = function (taskId) {
            return serverRequestService.delete("task/" + taskId);
        };

        // task project
        this.addProject = function (customer) {
            return serverRequestService.post('task/project', customer);
        };

        this.deleteProjectById = function (id) {
            return serverRequestService.delete("task/project/" + id);
        };

        this.getAllTaskProjects = function () {
            return serverRequestService.get("task/project");
        };

        this.getAllTaskProjectsWithTasks = function () {
            return serverRequestService.get("task/project/all/with_tasks");
        };

        this.getTaskProjectById = function (id) {
            return serverRequestService.get("task/project/" + id);
        };

        this.updateTaskProject = function (customer) {
            return serverRequestService.put('task/project', customer);
        };

    }])

    .service('userAccountService', ['serverRequestService', function (serverRequestService) {
        this.addAccount = function (customer) {
            return serverRequestService.post('account', customer);
        };
    }])

    .service('UserAccountGroupService', ['serverRequestService', function (serverRequestService) {

        this.addNewUserAccountGroup = function (group) {
            return serverRequestService.post('account/groups', group);
        };

        this.getAllUserAccountGroups = function () {
            return serverRequestService.get('account/groups');
        };

        this.getUserAccountGroupById = function (id) {
            return serverRequestService.get('account/groups/' + id);
        };

        this.updateUserAccountGroup = function (group) {
            return serverRequestService.put('account/groups', group);
        };

        this.deleteUserAccountGroupById = function (id) {
            return serverRequestService.delete('account/groups/' + id);
        };
    }])

    .service('tokenService', ['serverRequestService', function (serverRequestService) {
        this.getAllYandexTokens = function () {
            return serverRequestService.get('token/accounts/yandex/direct');
        };

        this.getDefaultDirectoryListing = function (tokenID, path) {
            return serverRequestService.get('storage/listing/?path=' + path + '&tokenID=' + tokenID);
        };

        this.getAllAccounts = function () {
            return serverRequestService.get('token/accounts');
        };

        this.getYandexDirectRedirectLink = function () {
            return serverRequestService.get('external_services/yandex/direct/redirectLink');
        };

        this.getGoogleDriveRedirectLink = function () {
            return serverRequestService.get('token/gdrive/redirect_link');
        };

        this.getTokenById = function (id) {
            return serverRequestService.get("token/" + id);
        };

        this.postDropboxAccessCodeToServer = function (id, state) {
            return serverRequestService.get("token/dropbox/oauth2/code/" + id + "/state/" + state);
        };

        this.postGoogleDriveAccessCodeToServer = function (id) {
            return serverRequestService.get("token/gdrive/oauth2/code/?code=" + id);
        };

        this.getDropboxRequestToConnectNewAccount = function () {
            return serverRequestService.get("token/dropbox/oauth2/request_to_connect_new_account");
        };

        this.obtainYandexDirectCode = function (token) {
            return serverRequestService.post('external_services/yandex/direct/obtain_code/' + token, {});
        };

        this.updateToken = function (tokenObj) {
            return serverRequestService.put("token", tokenObj);
        };

        this.addToken = function (tokenObj) {
            return serverRequestService.post("token", tokenObj);
        };

        this.deleteTokenById = function (id) {
            return serverRequestService.delete("token/" + id);
        };

    }])

    .service('allDirectCampaignsService', ['serverRequestService', function (serverRequestService) {
        this.allCompaigns = function (tokenId) {
            return serverRequestService.get('external_services/yandex/direct/campaigns/all/' + tokenId);
        };

        this.getClientInfo = function (tokenId) {
            return serverRequestService.get('external_services/yandex/direct/client/info/' + tokenId);
        };
        this.getBannersByCompaigns = function (tokenId, compaignId) {
            return serverRequestService.get('external_services/yandex/direct/banners/token/' + tokenId + '/compaigns/' + compaignId);
        };

        this.getBannersByCompaignsHistory = function (id, realCampaignId, tokenId) {
            return serverRequestService.get('external_services/yandex/direct/history/banners/campaign/historyId/' + id + '/realCampaignId/' + realCampaignId + '/token/' + tokenId);
        };

        this.getAllCompaignsHistory = function (historyId, tokenId) {
            return serverRequestService.get('external_services/yandex/direct/history/campaign/historyId/' + historyId + '/' + tokenId);
        };

        this.getAllHistoryCampaigns = function (tokenId) {
            return serverRequestService.get('external_services/yandex/direct/history/campaigns/all/' + tokenId);
        };

        this.addToken = function (token) {
            var a = {};
            return serverRequestService.post('token/yandex/direct/accounts', a);
        };

    }])

;
