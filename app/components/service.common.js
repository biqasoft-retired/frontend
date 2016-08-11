/**
 * Created Nikita Bakaev, ya@nbakaev.ru on 5/18/2016.
 * All Rights Reserved
 */
angular.module('app.services.api')
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
        //    return serverRequestService.get('v1/constants/generateId');
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

            filter.relativeCreatedDateFrom = '';
            filter.relativeCreatedDateTo = '';

            filter.sortDESCbyCreatedDate = true;

            return filter;
        };

        this.customFieldTypes = [
            {
                'name': 'CUSTOM_FIELDS.TYPES.INTEGER.NAME',
                'value': 'INTEGER'
            },
            {
                'name': 'CUSTOM_FIELDS.TYPES.DOUBLE.NAME',
                'value': 'DOUBLE'
            },
            {
                'name': 'CUSTOM_FIELDS.TYPES.STRING.NAME',
                'value': 'STRING'
            },
            {
                'name': 'CUSTOM_FIELDS.TYPES.DATE.NAME',
                'value': 'DATE'
            },

            //{
            //    'name':'CUSTOM_FIELDS.TYPES.MAP.NAME',
            //    'value':'MAP'
            //},
            {
                'name': 'CUSTOM_FIELDS.TYPES.DICTIONARY.NAME',
                'value': 'DICTIONARY'
            },
            {
                'name': 'CUSTOM_FIELDS.TYPES.BOOLEAN.NAME',
                'value': 'BOOLEAN'
            },
            {
                'name': 'CUSTOM_FIELDS.TYPES.DOCUMENT_FILE.NAME',
                'value': 'DOCUMENT_FILE'
            }
            ,
            {
                'name': 'CUSTOM_FIELDS.TYPES.STRING_LIST.NAME',
                'value': 'STRING_LIST'
            },
            {
                'name': 'CUSTOM_FIELDS.TYPES.USER_ACCOUNTS.NAME',
                'value': 'USER_ACCOUNTS'
            }

        ];

        this.customFieldStringStyles = [
            {
                'name': 'CUSTOM_FIELDS.TYPES.STRING.STYLES.STRING_AUTO.NAME',
                'value': 'STRING_AUTO'
            },
            {
                'name': 'CUSTOM_FIELDS.TYPES.STRING.STYLES.STRING_CONFIRM.NAME',
                'value': 'STRING_CONFIRM'
            },
            {
                'name': 'CUSTOM_FIELDS.TYPES.STRING.STYLES.TEXTAREA.NAME',
                'value': 'TEXTAREA'
            },
            {
                'name': 'CUSTOM_FIELDS.TYPES.STRING.STYLES.STRING_RICH_TEXT.NAME',
                'value': 'STRING_RICH_TEXT'
            }

        ];

        this.customFieldDateStyles = [
            {
                'name': 'CUSTOM_FIELDS.TYPES.DATE.STYLES.DATE_WITH_TIME.NAME',
                'value': 'DATE_WITH_TIME'
            },
            {
                'name': 'CUSTOM_FIELDS.TYPES.DATE.STYLES.DATE_ONLY_DATE.NAME',
                'value': 'DATE_ONLY_DATE'
            }
        ];

        this.allCurrency = [
            {
                'name': 'Рубль',
                'value': 'RUB',
                'series': ['рубль', 'рубля', 'рублей']
            },
            {
                'name': 'Belarussian Ruble',
                'value': 'BYR'
            },
            {
                'name': 'EUR',
                'value': 'EUR'
            },
            {
                'name': 'USD',
                'value': 'USD'
            },
            {
                'name': 'Гривна',
                'value': 'UAH'
            }

        ];

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
                    'value': '%CURRENT_DAY_START%',
                    'name': 'APP.DATE.CURRENT_DAY_START'
                },

                {
                    'value': '%CURRENT_DAY_END%',
                    'name': 'APP.DATE.CURRENT_DAY_END'
                },

                {
                    'value': '%CURRENT_MONTH_START%',
                    'name': 'APP.DATE.CURRENT_MONTH_START'
                },

                {
                    'value': '%CURRENT_MONTH_END%',
                    'name': 'APP.DATE.CURRENT_MONTH_END'
                }

            ];
            return a;
        };

    })

