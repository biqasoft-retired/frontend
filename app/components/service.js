'use strict';
angular.module('app.services', ['LocalStorageModule', 'ngRoute'])

/**
 * store data for api
 */
    .service('configurationServiceDate', [function () {
        // TODO: offline feature
        this.onlineStatus = {
            "connectedToStaticServer": true,
            "connectedToApiServer": true
        };

        this.serversURLs = {
            "restAPIserverURL": null,
            "asyncAPIserverURL": null
        };

    }])

    .service('authService', ['localStorageService', function (localStorageService) {
        var self = this;
        $.cookie.json = true;

        this.wrapUserNameAndPasswordToToken = function (username, password) {
            return Base64.encode(username + ":" + password);
        };

        this.getAuthAPItoken = function () {
            return localStorageService.get('token');
        };

        this.getAuthAPItokenWithoutBasic = function () {
            return self.wrapUserNameAndPasswordToToken(localStorageService.get('userName'), localStorageService.get('userPassword'));
        };


        /**
         * deauthorize user.
         * Do not delete any saved credentials to localstorage
         */
        this.deauthorize = function () {
            var m = {};
            m.logged = false;
            var domain = document.domain;
            domain = domain.replace("cloud.", "");

            $.removeCookie("biqaUserService");
            $.cookie('biqaUserService', m, {expires: 365, path: '/', domain: domain});
        };

        this.authorize = function (c) {
            var m = {};
            m.username = c.username;
            m.firstname = c.firstname;
            m.lastname = c.lastname;
            m.email = c.email;
            m.logged = true;
            var domain = document.domain.replace('cloud.', '');

            $.removeCookie("biqaUserService");
            $.cookie('biqaUserService', m, {expires: 365, path: '/', domain: domain});
            console.log('biqa Cloud: Cookie refreshed');

        };

    }])

    .service('configurationService', ['localStorageService', '$http', '$location', 'configurationServiceDate', 'authService',
        function (localStorageService, $http, $location, configurationServiceDate, authService) {
            var obj = this;

            /**
             * authenticate to API with login and password
             * using base auth http headers
             * @param username
             * @param password
             */
            this.authentificateUserWithLoginAndPassword = function (username, password) {
                localStorageService.set('userName', username);
                localStorageService.set('userPassword', password);

                var basicAuth = "Basic " + authService.wrapUserNameAndPasswordToToken(username, password);
                localStorageService.set('token', basicAuth);
                $http.defaults.headers.common.Authorization = authService.getAuthAPItoken();
            };

            /**
             * Get REST API URL
             * @returns {string}
             */
            this.returnAPIhost = function () {
                var apiURL = "";

                // if in URL we have 'username' and 'password' - set it as current user
                // login. Used when we get trial from Landing Page
                // TODO: check referrer
                if ($location.search().username && $location.search().password) {
                    obj.authentificateUserWithLoginAndPassword(Base64.decode($location.search().username), Base64.decode($location.search().password));
                }

                // default Authentication method
                // Base Auth with plain-text login and  password
                $http.defaults.headers.common.Authorization = authService.getAuthAPItoken();

                // if we set that we don't use cloud version
                if (localStorageService.get('useEnterprise') === "true") {
                    apiURL = localStorageService.get('EnterpriseApiURL');
                } else {

                    // otherwise - try to find correct url for
                    // production and development environment
                    switch (window.location.origin) {
                        case "http://localhost":
                            window.productionMode = false;
                            apiURL = "http://localhost:8080";
                            break;

                        case "http://cloud.biqasoft.com.dev":
                            window.productionMode = false;
                            apiURL = "http://localhost:8080";
                            break;

                        // case "http://gulp.cloud.biqasoft.com.dev":
                        //     window.productionMode = false;
                        //     apiURL = "http://localhost:8080";
                        //     break;

                        case "https://cloud.biqasoft.com.dev":
                            window.productionMode = false;
                            apiURL = "http://localhost:8080";
                            break;

                        default:
                            window.productionMode = true;
                            apiURL = "https://api.biqasoft.ru";
                            break;
                    }
                }

                // hide loading screen and show UI
                if (!window.apiServerDefined) window.loading_screen.finish();
                window.apiServerDefined = true;
                return apiURL;
            };

            /**
             * Get ASYNC WEBSOCKET API URL
             * @returns {string}
             */
            this.returnAsyncAPIhost = function () {

                var apiURL = "";

                // if we set that we don't use cloud version
                if (localStorageService.get('useEnterprise') === "true") {
                    apiURL = localStorageService.get('EnterpriseAsyncApiURL');
                    return apiURL;
                }

                // otherwise - try to find correct url for
                // production and development environment
                switch (window.location.origin) {
                    case "http://localhost":
                        window.productionMode = false;
                        apiURL = "http://localhost:9096";
                        break;

                    case "http://cloud.biqasoft.com.dev":
                        window.productionMode = false;
                        apiURL = "http://localhost:9096";
                        break;

                    case "http://gulp.biqasoft.com.dev":
                        window.productionMode = false;
                        apiURL = "http://localhost:9096";
                        break;

                    case "https://cloud.biqasoft.com.dev":
                        window.productionMode = false;
                        apiURL = "http://localhost:9096";
                        break;

                    case "192.168.1.198":
                        window.productionMode = false;
                        apiURL = "http://localhost:9096";
                        break;

                    default:
                        window.productionMode = true;
                        apiURL = "https://async.api.biqasoft.com";
                        break;
                }

                return apiURL;
            };

            this.getOnlineStatus = function () {
                configurationServiceDate.serversURLs.restAPIserverURL = this.returnAPIhost();
                configurationServiceDate.serversURLs.asyncAPIserverURL = this.returnAsyncAPIhost();
            };
            this.getOnlineStatus();

            console.info("------------------------------");
            console.info("       CONNECTED TO SERVERS");
            console.info("API: " + configurationServiceDate.onlineStatus.connectedToApiServer);
            console.info("STATIC: " + configurationServiceDate.onlineStatus.connectedToStaticServer);
            console.info("       API SERVER ADDRESS");
            console.info("Address: " + this.returnAPIhost());
            console.info("ASYNC Address: " + configurationServiceDate.serversURLs.asyncAPIserverURL);
            console.info("------------------------------");
        }])

    .service('commonService', ['localStorageService', '$rootScope', 'UserService', function (localStorageService, $rootScope, UserService) {

        /**
         * if we have byte[]
         * and we want to download in browser
         * @param data
         */
        this.downloadFile = function (data) {
            var arr = data.file;
            var byteArray = new Uint8Array(arr);
            var a = window.document.createElement('a');

            a.href = window.URL.createObjectURL(new Blob([byteArray], {type: data.type}));
            a.download = data.filename;

            // Append anchor to body.
            document.body.appendChild(a);
            a.click();

            // Remove anchor from body
            document.body.removeChild(a);
        };

        /**
         * get userAccount by id
         * @param id
         * @returns {*}
         */
        this.resolveUser = function (id) {
            if (!id) return;

            if ($rootScope.allUserAccounts && $rootScope.allUserAccounts.length) {
                var res = $rootScope.allUserAccounts.filter(function (data) {
                    if (data.id && data.id === id) return true;
                });

                if (res.length === 1) return res[0];
            }

            var stringed = id.toString();
            if (!$rootScope.allResolvedUsers[stringed]) {
                $rootScope.allResolvedUsers[stringed] = {};
                UserService.getAccountById(id).then(function (e) {
                    $rootScope.allResolvedUsers[stringed] = e;
                    return e;
                });
            } else {
                return $rootScope.allResolvedUsers[stringed];
            }
        };

        /**
         * get avatar url by userAccount object
         * @param user
         * @returns {*}
         */
        this.getAvatarUrlByUser = function (user) {
            if (!user) return "assets/img/no-avatar.png";
            if (!isUndefinedOrNullOrEmpty(user.avatarUrl)) {
                return user.avatarUrl;
            }

            return "assets/img/no-avatar.png";
        };

        /**
         * normal print user in template view
         * @param user
         * @returns {*}
         */
        this.printUser = function (user) {
            if (!user) return;

            if (user.firstname && !user.lastname) return user.firstname;
            if (!user.firstname && user.lastname) return user.lastname + " " + user.username;
            if (user.firstname && user.lastname) return user.firstname + " " + user.lastname;
            if (!user.firstname && !user.lastname) return user.email;
        };

        /**
         * does current user has some role
         * Usage STRING (one) role hasRole("ROLE_ADMIN")
         * Usage ARRAY (any) hasRole(["ROLE_ADMIN", "ROLE_CALLER"])
         * @param role
         * @returns {boolean}
         */
        this.hasRole = function (role) {
            if (typeof $rootScope.currentUser === 'undefined') return false;

            var rolesArray = [];

            if (typeof role === 'string') {
                rolesArray.push(role);
            } else if (typeof role === 'object') {
                rolesArray = role;
            }

            var arrayLength = $rootScope.currentUser.roles.length;

            for (var i = 0; i < rolesArray.length; i++) {
                for (var j = 0; j < arrayLength; j++) {
                    if ($rootScope.currentUser.roles[j] === rolesArray[i]) {
                        return true;
                    }
                }
            }
        };

    }])

    .service('cacheService', ['localStorageService', '$rootScope', function (localStorageService, $rootScope) {
        var self = this;
        this.init = function () {
        };

        this.getNumberCachced = function () {
            return 0;
        };

        this.clearCache = function () {
            var allObjects = Object.keys(window.localStorage);
            for (var i = 0; i < allObjects.length; i++) {
                if (allObjects[i].startsWith("ls.cacheServiceData.")) {
                    localStorage.removeItem(allObjects[i]);
                }
            }
        };
        $rootScope.clearCache = this.clearCache;
        $rootScope.cachedNumber = this.getNumberCachced;

        this.haveCached = function (key) {
            if (localStorageService.get('cacheServiceData.' + key)) return true;
            return false;
        };

        this.getOjectCachedTime = function (key) {
            return localStorageService.get('cacheServiceData.' + key).date;
        };

        this.getObjectWithMetaData = function (key) {
            return localStorageService.get('cacheServiceData.' + key);
        };

        this.getByKey = function (key) {
            return localStorageService.get('cacheServiceData.' + key).data;
        };

        this.setEmptyKey = function (key) {
            if (!$rootScope.cacheMode) return;

            return localStorageService.set('cacheServiceData.' + key, {data: "WAIT_RESOLVE"});
        };

        this.setObjectByKey = function (key, data, hash, timeout) {
            if (!$rootScope.cacheMode) return;
            var q = {};

            //timeout = timeout || 5000;

            q.date = new Date();
            q.data = data;
            q.key = key;

            //q.md5Hash =  md5( JSON.stringify(q.data) );
            q.md5Hash = hash;
            localStorageService.set('cacheServiceData.' + q.key, q);
        };
        this.init();
    }])

;
