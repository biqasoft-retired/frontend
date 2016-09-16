angular.module('app.services')

    .service('serverRequestService', ['localStorageService', 'configurationService', '$q', '$http', 'cacheService', 'logger', '$rootScope',
        function (localStorageService, configurationService, $q, $http, cacheService, logger, $rootScope) {
            $http.defaults.headers.common["Accept"] = "application/json";
            $http.defaults.headers.common["Content-Type"] = "application/json";

            var self = this;

            $rootScope.isCacheMode = function () {
                return localStorageService.get('cacheMode') === "true";
            };
            var defaultCacheMode = $rootScope.isCacheMode();
            $rootScope.cacheMode = defaultCacheMode;

            self.baseUrl = configurationService.returnAPIhost();

            // count server connection number
            // to show on page
            $rootScope.serversConnectionsActive = 0;

            /**
             * HTTP biqa API 'GET' METHOD
             *  by default
             * HTTP 'GET' methods _can be_ cached
             * to disable, you should pass object with {"cache":"disable"}
             */
            this.get = function (relUrl, params) {

                var promise;

                // key to cache HashMap is url
                var key = relUrl;

                // do we want to load from server
                var forceLoadFromServer = false;

                if (params) {
                    if (params.cache) {
                        if (params.cache === "disable") forceLoadFromServer = true;
                    }
                }

                // do we ave this key ( url ) in cache
                if ($rootScope.cacheMode && cacheService.haveCached(key) && cacheService.getByKey(key) != "WAIT_RESOLVE" && !forceLoadFromServer) {
                    promise = $q(function (resolve, reject) {
                        resolve(cacheService.getByKey(key));
                    });
                    console.info("Get: " + key + " from cache");

                    if ($rootScope.debugMode) {
                        var currentDate = new Date();
                        var cachedDate = new Date(cacheService.getOjectCachedTime(key));
                        logger.logSuccess("Из кэша от: " + (Math.round((currentDate - cachedDate) / 1000)) + " сек. назад");
                    }

                } else {
                    $rootScope.serversConnectionsActive++;

                    // var hash = cacheService.haveCached(key) ? cacheService.getObjectWithMetaData(key).md5Hash : "";

                    var config = {};
                    config.headers = {};
                    // config.headers = {
                    //     'X-biqa-Version-Hash': hash
                    // };

                    config.headers['X-Date'] = new Date().toUTCString();

                    promise = $http.get(self.baseUrl + "/" + relUrl, config).then(function (response) {
                        $rootScope.serversConnectionsActive--;

                        // see trick on  'leadGenMethod/all' on server
                        // if (response.headers("X-biqa-Object-Equals-Hash") != null && response.headers("X-biqa-Object-Equals-Hash") === "TRUE") {
                        //     return cacheService.getObjectWithMetaData(key).data;
                        // } else {
                        //     cacheService.setObjectByKey(key, response.data, response.headers('X-biqa-Version-Hash'));
                        return response.data;
                        // }
                    });
                    console.info("Get: " + key + " from server");
                }

                // Return the promise to the controller
                return promise;
            };

            this.put = function (relUrl, object) {
                $rootScope.serversConnectionsActive++;
                var promise = $http.put(self.baseUrl + "/" + relUrl, object).then(function (response) {
                    // The then function here is an opportunity to modify the response
                    //console.log(response);
                    // The return value gets picked up by the then in the controller.
                    $rootScope.serversConnectionsActive--;
                    return response.data;
                });

                // Return the promise to the controller
                return promise;
            };

            /**
             * by default
             * HTTP 'POST' methods _do not_ cached
             * to enable, you should pass object with {"cache":"enable"}
             * for example, if you just pass some 'builder' - filter for objecs set
             * if you create new objects with 'POST' method, you SHOULD not cache it!
             */
            this.post = function (relUrl, object, params) {
                var promise;
                var key = relUrl + JSON.stringify(object).hashCode();
                var forceLoadFromServer = true;
                var optionsParams = {};

                if (params) {
                    if (params.cache) {
                        if (params.cache === "enable") forceLoadFromServer = false;
                    }

                    if (params.responseType) optionsParams.responseType = params.responseType;
                }

                if (cacheService.haveCached(key) && $rootScope.cacheMode && cacheService.getByKey(key) != "WAIT_RESOLVE" && !forceLoadFromServer) {
                    promise = $q(function (resolve, reject) {
                        resolve(cacheService.getByKey(key));
                    });
                    console.info("Get: " + key + " from cache");
                    var currentDate = new Date();
                    var cachedDate = new Date(cacheService.getOjectCachedTime(key));

                    if ($rootScope.debugMode) {
                        logger.logSuccess("From cache: " + (Math.round((currentDate - cachedDate) / 1000)) + " sec. ago");

                    }

                } else {
                    $rootScope.serversConnectionsActive++;
                    cacheService.setEmptyKey(key);

                    if (optionsParams.responseType) {
                        var promise = $http.post(self.baseUrl + "/" + relUrl, object, optionsParams).then(function (response) {
                            if ($rootScope.cacheMode) cacheService.setObjectByKey(key, response.data);
                            $rootScope.serversConnectionsActive--;
                            return response.data;
                        });

                    } else {
                        var promise = $http.post(self.baseUrl + "/" + relUrl, object).then(function (response) {
                            if ($rootScope.cacheMode) cacheService.setObjectByKey(key, response.data);
                            $rootScope.serversConnectionsActive--;

                            return response.data;
                        });
                    }

                    console.info("Get: " + key + " from server");
                }

                // Return the promise to the controller
                return promise;
            };

            this.delete = function (relUrl) {
                $rootScope.serversConnectionsActive++;

                var promise = $http.delete(self.baseUrl + "/" + relUrl).then(function (response) {
                    // The then function here is an opportunity to modify the response
                    //console.log(response);
                    // The return value gets picked up by the then in the controller.
                    $rootScope.serversConnectionsActive--;

                    return response.data;
                });

                // Return the promise to the controller
                return promise;
            };

        }])

    // intercept some errors
    .factory('authHttpResponseInterceptor', ['$q', '$location', 'configurationServiceDate', '$translate', 'authService', 'logger',
        function ($q, $location, configurationServiceDate, $translate, authService, logger) {
            var self = this;
            self.lastShowAuthError = null;

            return {
                response: function (response) {
                    configurationServiceDate.onlineStatus.connectedToApiServer = true;
                    return response || $q.when(response);
                },
                responseError: function (rejection) {
                    console.warn(rejection);

                    if (rejection.status === 401) {
                        console.log("Response Error 401", rejection);

                        if (rejection && rejection.config && rejection.config.url && rejection.config.url.endsWith("v1/myaccount/set_online")) {
                        } else {
                            if (rejection && rejection.data && rejection.data.message) {
                                if (self.lastShowAuthError === null || ((new Date() - self.lastShowAuthError) > 1500)) {
                                    logger.logError(rejection.data.code + "<br>" + rejection.data.message);
                                    self.lastShowAuthError = new Date();
                                    return;
                                }
                            }
                        }

                        if (rejection && rejection.data && rejection.data.idErrorMessage === "auth.exception.failed.limit") {
                            // do not deauthorize (delete localstorage & cookie) on password fail error
                            // because we can open in another browser, get limit error(for example by IP), and will have reset auth in first browser
                            // where all is OK
                        } else {
                            authService.deauthorize();
                        }

                        // redirect to login page
                        $location.path('login/login').search('returnTo', $location.path());
                    }

                    if (rejection.status === 403) {
                        console.log("Response Error 403", rejection);
                        logger.logError($translate.instant('APP.RESPONSE.ERROR.ACCESS_DENY'));
                    }

                    if (rejection.status === 400) {
                        console.log("Response Error 400", rejection);
                        logger.logError($translate.instant('APP.RESPONSE.ERROR.INVALID_REQUEST'));
                    }

                    if (rejection.status === 503 || rejection.status === -1) {
                        console.log("Response Error 503", rejection);

                        if (rejection && rejection.config && rejection.config.url && rejection.config.url.endsWith("v1/myaccount/set_online")) {
                        } else {
                            $location.path('pages/503').search('returnTo', $location.path());
                        }

                        configurationServiceDate.onlineStatus.connectedToApiServer = false;
                    }

                    if (rejection.status === 500) {
                        var errorMessageException = '';
                        var errorMessage = '';

                        if (!isUndefinedOrNullOrEmpty(rejection.data.exception)) {
                            errorMessageException = rejection.data.exception;
                        }

                        if (!isUndefinedOrNullOrEmpty(rejection.data.errorMessage)) {
                            errorMessage = rejection.data.errorMessage;
                        }

                        logger.logError($translate.instant('APP.RESPONSE.ERROR.SERVER_INTERNAL_ERROR') + "<br>" + errorMessageException + "<br>" + errorMessage + "<br>" + rejection.config.url);
                    }

                    if (rejection.status === 422) {
                        logger.logError($translate.instant('APP.RESPONSE.ERROR.INVALID_REQUEST') + "<br><br>" + rejection.data.message);
                    }

                    if (rejection.status === 404) {
                        logger.logWarning($translate.instant('APP.RESPONSE.ERROR.NO_404'));
                    }

                    return $q.reject(rejection);
                }
            }
        }]);
