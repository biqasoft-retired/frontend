(function () {
    'use strict';
    angular.module('app.controllers', [])
        .controller('AppCtrl', [
            '$scope', '$rootScope', 'UserService', '$location', 'configurationServiceDate',
            'localStorageService', '$timeout', 'statsRepositoryService', 'timeService', 'domainService',
            'SalesFunnelService', 'widgetService', 'SystemService', 'logger', 'NotificationsService',
            'customerService', 'companyService', 'hotkeys', '$modal', '$translate', 'commonService', '$mdDialog', 'customObjectsService',
            '$sce', 'storageService', '$filter', 'ColorService', 'asyncService', 'HistoryLocationService', 'globalHotkeys', 'timeAgoSettings', 'authService', 'BPMNCodeExecutorService',
            function ($scope, $rootScope, UserService, $location, configurationServiceDate,
                      localStorageService, $timeout, statsRepositoryService, timeService, domainService,
                      SalesFunnelService, widgetService, SystemService, logger, NotificationsService,
                      customerService, companyService, hotkeys, $modal, $translate, commonService, $mdDialog, customObjectsService, $sce,
                      documentsService, $filter, ColorService, asyncService, HistoryLocationService, globalHotkeys, timeAgoSettings, authService, BPMNCodeExecutorService) {

                console.log('AppCtrl - header');
                var self = this;

                // list or mp3 files that currently can be played in player
                // format: {title: "", url: ""}
                $scope.longList = [];

                $rootScope.tableClasses = null;
                $rootScope.customFieldsTableClasses = null;

                $rootScope.applicationSettings = {};
                $rootScope.applicationSettings.showMediaPlayer = false;
                $rootScope.applicationSettings.audioPlayFiles = 0;

                $rootScope.addAudioToPlay = function (file) {
                    $scope.longList.push({
                        title: file.title,
                        // trust because urls can have blob://prefix in link
                        url: $sce.trustAsResourceUrl(file.url)
                    });
                    $rootScope.applicationSettings.showMediaPlayer = true;
                    self.countMediaFiles();
                };

                self.countMediaFiles = function () {
                    $rootScope.applicationSettings.audioPlayFiles = $scope.longList.length;
                };

                self.isDebugMode = function () {
                    return localStorageService.get('debugMode') === 'true';
                };
                $rootScope.debugMode = self.isDebugMode();
                $rootScope.cacheMode = false;


                if ($rootScope.debugMode){
                    $rootScope.allAsyncMessages = [];
                    asyncService.subscribeToAllEvents($rootScope.allAsyncMessages, {scope: $rootScope});
                }

                $scope.pageTransitionOpts = [
                    {
                        name: 'Scale up',
                        'class': ''
                    }
                ];

                // some data that should not be in scope
                window.biqaConfig = {};

                $rootScope.personalSettings = {};

                $rootScope.configuration = configurationServiceDate.onlineStatus;

                // array of widget locations
                $rootScope.allWidgetsLocations = SalesFunnelService.widgetsLocations;

                // array of currencies money
                $rootScope.allCurrency = SystemService.allCurrency;

                $rootScope.universalResolver = SystemService.universalResolver;
                $rootScope.universalResolverWithField = SystemService.universalResolverWithField;

                $rootScope.buildDataObjectBuilder = SystemService.buildDataObjectBuilder;

                // auto save some objects, such as tasks (details), customer (details) etc
                $rootScope.autoSaveObjects = true;

                $rootScope.allResolvedUsers = [];
                $rootScope.allUserAccounts = [];

                $rootScope.domainInfo = {};
                $rootScope.domainSettings = {};
                $rootScope.domainSettings.logoText = 'biqasoft';

                // here will be stats, such as all task & leads/customers numbers etc
                $rootScope.globalDomainStats = {};

                // auto update time for view
                self.fireDigestEverySecond = function () {
                    $rootScope.getDatetime = new Date();
                    // or use $interval
                    $rootScope.$evalAsync();
                };
                setInterval(self.fireDigestEverySecond, 1000);

                domainService.getMyDomainSettings().then(function (e) {
                    $rootScope.domainSettings = e;
                    if (e.logoText != '' && e.logoText != null) {
                        $rootScope.domainSettings.logoText = e.logoText;
                    } else {
                        $rootScope.domainSettings.logoText = 'biqasoft';
                    }
                });

                /**
                 * Show text when field is empty (print translated message that fields is empty)
                 * @returns {string|Object}
                 */
                $rootScope.printEmptyField = function () {
                    return $translate.instant('APP.COMMON.EMPTY_STRING_FIELDS_VALUE');
                };

                /**
                 * Set language in whole application
                 * Note update to server
                 * If you want to save to server new language use $rootScope.switchLanguage()
                 * @param key
                 */
                self.setLanguage = function (key) {
                    timeAgoSettings.overrideLang = key;
                    $translate.use(key);
                };

                self.initCurrentUser = function () {
                    UserService.getCurrentUser().then(function (myaccount) {
                        $rootScope.currentUser = myaccount;

                        var appLanguage = $rootScope.currentUser.language;

                        if (isUndefinedOrNullOrEmpty(appLanguage)) {
                            appLanguage = GLOBAL_CONSTANTS.LANGUAGE;
                        }

                        self.setLanguage(appLanguage);

                        var parsed = $rootScope.currentUser.personalSettings;

                        if (!isUndefinedOrNullOrEmpty(parsed)) {
                            $rootScope.personalSettings = parsed;
                        }

                        // date format print
                        if (isUndefinedOrNullOrEmpty($rootScope.personalSettings.dateFormat)) {
                            // or american format yyyy-MM-dd HH:mm
                            $rootScope.personalSettings.dateFormat = "dd.MM.yyyy HH:mm";
                        }

                        // colors
                        if (!isUndefinedOrNullOrEmpty($rootScope.personalSettings.colors)) {
                            if (!isUndefinedOrNullOrEmpty($rootScope.personalSettings.colors.enable) && $rootScope.personalSettings.colors.enable) {

                                $timeout(function () {
                                    ColorService.setColor($rootScope.personalSettings.colors.mainColor);
                                }, 1000);
                            }
                        } else {
                            $rootScope.personalSettings.colors = {};
                            $rootScope.personalSettings.colors.enable = false;
                        }

                        // table UI
                        if (isUndefinedOrNullOrEmpty($rootScope.personalSettings.ui)) {
                            $rootScope.personalSettings.ui = {};
                        }

                        if (isUndefinedOrNullOrEmpty($rootScope.personalSettings.ui.table)) {
                            $rootScope.personalSettings.ui.table = {};
                            $rootScope.personalSettings.ui.table.modern = true;
                        }

                        if (isUndefinedOrNullOrEmpty($rootScope.personalSettings.ui.modernCustomFields)) {
                            $rootScope.personalSettings.ui.modernCustomFields = true;
                        }

                        // css classes for table
                        if ($rootScope.personalSettings.ui.table.modern) {
                            $rootScope.tableClasses = "table table-condensed table-stripped table-hover";
                        } else {
                            $rootScope.tableClasses = "table table-bordered table-hover table-striped";
                        }

                        if ($rootScope.personalSettings.ui.modernCustomFields) {
                            $rootScope.customFieldsTableClasses = "table table-condensed table-stripped table-hover";
                        } else {
                            $rootScope.customFieldsTableClasses = "table table-bordered table-hover table-striped";
                        }

                        UserService.getAllUsers().then(function (data) {
                            $rootScope.allUserAccounts = data;
                        });
                        self.initCloudSettings($rootScope.currentUser);
                        BPMNCodeExecutorService.executeFirstRunCode();
                    }, function (error) {
                        // on error make request to server
                        // for example we have not connected to backend
                        // we should manually init some params, such as language

                        self.setLanguage(GLOBAL_CONSTANTS.LANGUAGE);
                        BPMNCodeExecutorService.executeFirstRunCode();
                    });
                };
                self.initCurrentUser();

                // some global functions for templates using
                $rootScope.resolveUser = commonService.resolveUser;
                $rootScope.getAvatarUrlByUser = commonService.getAvatarUrlByUser;
                $rootScope.printUser = commonService.printUser;
                $rootScope.hasRole = commonService.hasRole;
                $rootScope.downloadFile = commonService.downloadFile;

                /**
                 * Print Date in template or JS depend on user personal settings
                 * or if user not set - use default format
                 *
                 * https://docs.angularjs.org/api/ng/filter/date
                 * @param date
                 * @returns {*}
                 */
                $rootScope.printDate = function (date) {
                    if (isUndefinedOrNull(date)) return null;

                    var format = $rootScope.personalSettings.dateFormat;
                    if (isUndefinedOrNullOrEmpty(format)) format = "medium";
                    return $filter('date')(date, format);
                };

                self.initCloudSettings = function (cm) {
                    var c = angular.copy(cm);
                    authService.authorize(c);

                    var allUserAccounts = localStorageService.get('allUserAccounts');

                    if (isUndefinedOrNull(allUserAccounts) || allUserAccounts.length === 0) {
                        allUserAccounts = [];
                        c.password = localStorage['ls.userPassword'];
                        c.username = localStorage['ls.userName'];
                        allUserAccounts.push(c);
                    } else {
                        var hasThisAccount = false;
                        for (var i = 0; i < allUserAccounts.length; i++) {
                            if (allUserAccounts[i].id === c.id) {
                                allUserAccounts[i] = c;

                                // OAUTH2_ is a special prefix for all oauth created tokens by backend
                                if (!localStorage['ls.userName'].startsWith('OAUTH2_')) {
                                    allUserAccounts[i].password = localStorage['ls.userPassword'];
                                    hasThisAccount = true;
                                } else {
                                    allUserAccounts[i].username = localStorage['ls.userName'];
                                    allUserAccounts[i].password = localStorage['ls.userPassword'];
                                    hasThisAccount = true;
                                }
                                break;
                            }
                        }

                        if (!hasThisAccount) {
                            c.password = localStorage['ls.userPassword'];
                            c.username = localStorage['ls.userName'];

                            if (c.password) {
                                allUserAccounts.push(c);
                            }
                        }
                    }
                    localStorageService.set('allUserAccounts', allUserAccounts);
                };

                // get basic stats from server
                // with some delay
                $timeout(function () {
                    statsRepositoryService.getBasicStats().then(function (e) {
                        $rootScope.globalDomainStats = e;
                    });

                    domainService.getMyDomainInfo().then(function (e) {
                        $rootScope.domainInfo = e;
                    });
                }, 4000);

                /**
                 * Download file and add to audio queue
                 * @param data
                 */
                $rootScope.downloadFileListen = function (data) {
                    var arr = data.file;
                    var byteArray = new Uint8Array(arr);
                    var a = {};

                    a.url = window.URL.createObjectURL(new Blob([byteArray], {type: data.type}));
                    a.title = data.filename;

                    $rootScope.addAudioToPlay(a);
                };

                $rootScope.listenAudioDownloadedAdd = function (documentFile) {
                    documentsService.listenAudioDownloaded(documentFile);
                };

                // when we change page - see if we have unsaved data and ask user to leave page
                // and do not save data or remain on current page
                self.confirmLeavePage = function (e) {
                    // if search pop-up is open - close it
                    var selector = $('#search');
                    if (selector.hasClass('open')) {
                        selector.removeClass('open');
                    }

                    var confirmed;
                    if ($rootScope.hasUnsavedEdits) {
                        confirmed = window.confirm($translate.instant('APP.UNSAVED_CHANGES'));
                        if (e && !confirmed) {
                            e.preventDefault();
                        }
                    } else {
                    }
                };
                $rootScope.$on('$locationChangeStart', self.confirmLeavePage);

                // some action when we change page
                window.onbeforeunload = function () {
                    if ($rootScope.hasUnsavedEdits) {
                        return $translate.instant('APP.UNSAVED_CHANGES');
                    }
                };
                ///////////////////////////////////////////////

                // add current page to history of all viewed pages in current session
                $rootScope.$on('$routeChangeSuccess', function () {
                    $timeout(function () {
                        HistoryLocationService.allLocations.push({
                            title: $rootScope.title,
                            location: $location.path(),
                            date: new Date()
                        });
                    }, 3000);

                    $rootScope.hasUnsavedEdits = false;
                    window.changedTimes = 0;
                });

                /**
                 * if we ave `dataSource` object with one data
                 * we want to get this data
                 * @param project
                 * @returns {*}
                 */
                $rootScope.getResolvedOneData = function (project) {
                    var errorResponse = 'ERROR';
                    if (!project || !project.resolved) {
                        if (project && !project.lastUpdate) return 'WAIT_PLEASE';

                        return errorResponse;
                    }

                    if (project.returnType === 'STRING') {
                        if (isUndefinedOrNull(project.values) || isUndefinedOrNull(project.values.stringVal)) return errorResponse;
                        return project.values.stringVal;
                    }

                    if (project.returnType === 'INTEGER') {
                        if (isUndefinedOrNull(project.values) || isUndefinedOrNull(project.values.intVal)) return errorResponse;
                        return project.values.intVal;
                    }
                };

                /**
                 * Get CSS color for KPI
                 * @param project
                 * @returns {*}
                 */
                $rootScope.getColorForDataSource = function (project) {
                    var defaultColorDanger = '#e9422e';
                    var defaultColorWarning = '#fac552';
                    var defaultColorSuccess = '#3cbc8d';

                    var result = $rootScope.getResolvedOneData(project);
                    if (result === 'WAIT_PLEASE') return 'grey';
                    if (result === 'ERROR') {
                        if (project.lights && project.lights.error && project.lights.error.color) {
                            return project.lights.error.color || defaultColorDanger;
                        } else {
                            return defaultColorDanger;
                        }
                    }

                    if (isUndefinedOrNull(project.lights) || isUndefinedOrNull(project.lights.currentLight)) return defaultColorSuccess;

                    switch (project.lights.currentLight) {
                        case 'SUCCESS':
                            return project.lights.success.color || defaultColorSuccess;

                        case 'WARNING':
                            return project.lights.warning.color || defaultColorWarning;

                        case 'ERROR':
                            return project.lights.error.color || defaultColorDanger;
                    }
                };

                /**
                 * watch current object for changes and show pop-up about unsaved data
                 * @param $scope2
                 * @param modelName
                 * @param params
                 * @returns {*|(function())}
                 */
                $rootScope.defineUnsavedData = function ($scope2, modelName, params) {
                    // console.log("NEW DEFINE UNSAVED", $scope, modelName);
                    if (isUndefinedOrNull(params)) {
                        params = {};
                        params.timesBefore = 0;
                    }

                    window.biqaConfig.unsavedDataConfig = params;
                    var obj = $scope2.$watch(modelName, function () {
                        if (window.changedTimes > window.biqaConfig.unsavedDataConfig.timesBefore) {
                            $rootScope.hasUnsavedEdits = true;
                            console.log('OBJECT' + modelName + ' EDITED!: ' + window.changedTimes + ' times !');

                            if ($rootScope.autoSaveObjects) {
                                params.autoSaveFunction();
                            }
                        }
                        window.changedTimes++;
                    }, true);

                    return obj;
                };

                /**
                 * show object ID (such as customer ID...) in some pages
                 * @returns {boolean}
                 */
                $rootScope.showObjectIDs = function () {
                    return $rootScope.debugMode;
                };

                // auto mark(set) current user as online,
                // sending request to server every minute
                self.setOnlineCurrentUserFunction = function () {
                    UserService.setCurrentUserOnline();
                    console.log('set current user online');
                };
                self.setOnlineCurrentUserFunctionUpdater = setInterval(self.setOnlineCurrentUserFunction, 60000);

                // add some delay to force load
                // first requests which is more important
                $timeout(self.setOnlineCurrentUserFunction, 30000);

                $rootScope.allCustomObjectsMeta = [];
                customObjectsService.getCustomObjectMetaByBuilder({}).then(function (data) {
                    // $scope.projects = e.resultedObjects;
                    // $scope.allCustomersCount = e.entityNumber;
                    // $scope.lastRequestCount = e.entityNumber;
                    // $scope.pagesNumbers = Math.ceil($scope.allCustomersCount / $scope.itemsPerPage);
                    $rootScope.allCustomObjectsMeta = data.resultedObjects;
                });

                /**
                 * update current user settings
                 * such as UI / buttons...
                 */
                $rootScope.updatePersonalSettings = function () {
                    var obj = $rootScope.personalSettings;
                    // obj.ui = JSON.stringify(obj.personalSettings.ui);

                    UserService.setPersonalSettings(obj).then(function () {
                        self.initCurrentUser();
                    });
                };

                /**
                 * log out from current user
                 */
                $rootScope.logout = function () {
                    localStorage.clear();
                    authService.deauthorize();
                    $.removeCookie('biqaUserService', {domain: domain, path: '/'});
                    window.location.reload();
                    logger.logSuccess($translate.instant('APP.USERACCOUNT.EXIT_SUCCESSED'));
                };

                /**
                 * show right end of word
                 * @example { declOfNum (allCustomersCount, ['клиент', 'клиента', 'клиентов']  )
                 * @param number - number of records (objects)
                 * @param titles - просклонять для [1,3,5], например ['клиент', 'клиента', 'клиентов']
                 * @returns {*}
                 */
                $rootScope.declOfNum = function (number, titles) {
                    var cases = [2, 0, 1, 1, 1, 2];
                    return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
                };

                /**
                 * return array of [ amount, 'printable currency' ]
                 * @param amount
                 * @returns {*}
                 */
                $rootScope.printCurrencyPrintable = function (amount) {
                    if (!$rootScope.domainSettings.currency) return amount;
                    return [amount, $rootScope.declOfNum(amount, SystemService.universalResolverWithField($rootScope.allCurrency, $rootScope.domainSettings.currency, 'value').series)];
                };

                /**
                 * return currency with text
                 * @param amount
                 * @returns {*}
                 */
                $rootScope.printCurrency = function (amount) {
                    if (!$rootScope.domainSettings || !$rootScope.domainSettings.currency) return amount;

                    var currency = SystemService.universalResolverWithField($rootScope.allCurrency, $rootScope.domainSettings.currency, 'value');

                    if (!currency || !currency.series) return amount;
                    var curResult = $rootScope.printCurrencyPrintable(amount);
                    var result = curResult[0] + ' ' + curResult[1];

                    return result;
                };

                /**
                 * change to new language and save to server
                 * @param key - which language use
                 */
                $rootScope.switchLanguage = function (key) {
                    self.setLanguage(key);
                    $rootScope.currentUser.language = key;
                    UserService.updateCurrentUser($rootScope.currentUser).then(function (data) {
                        logger.logSuccess($translate.instant('APP.SET_NEW_LANGUAGE') + key);
                    });
                };

                $rootScope.debugModeOn = function () {
                    localStorageService.set('debugMode', true);
                    logger.logSuccess('Debug mode ON');
                    window.location.reload();
                };

                $rootScope.debugModeOff = function () {
                    localStorageService.set('debugMode', false);
                    logger.logSuccess('Debug mode OFF');
                    window.location.reload();
                };

                $rootScope.forceCacheOn = function () {
                    localStorageService.set('cacheMode', true);
                    logger.logSuccess('Cache mode ON');
                    $rootScope.cacheMode = true;
                };

                $rootScope.forceCacheOff = function () {
                    localStorageService.set('cacheMode', false);
                    logger.logSuccess('Cache mode OFF');
                    $rootScope.cacheMode = false;
                };

                $scope.admin = {
                    layout: 'wide',
                    menu: 'vertical',
                    fixedHeader: true,
                    fixedSidebar: true,
                    pageTransition: $scope.pageTransitionOpts[0]
                };

                // angular-material dropdown menus
                var originatorEv;
                $rootScope.openMenu = function ($mdOpenMenu, ev) {
                    originatorEv = ev;
                    $mdOpenMenu(ev);
                };

            }
        ])

        .service('HistoryLocationService', [function () {
            var self = this;

            // saved history location of users URLs in `alt` button
            self.allLocations = [];
        }])

        .controller('HistoryLocationCtrl', ['$scope', '$rootScope', 'SearchService', 'logger', '$timeout', 'storageService', 'HistoryLocationService',
            function ($scope, $rootScope, SearchService, logger, $timeout, documentsService, HistoryLocationService) {
                $scope.allLocations = HistoryLocationService.allLocations;
            }])

        .controller('HeaderCtrl', ['$scope', '$rootScope', 'SearchService', 'logger', '$timeout', 'storageService', 'Fullscreen',
            function ($scope, $rootScope, SearchService, logger, $timeout, documentsService, Fullscreen) {

                var self = this;

                // hack to show/hide search bar for mobile devices
                $scope.showSearchBox = false;
                self.hiddenSearchClasses = "visible-lg hidden-md";

                $scope.showSearchBoxClicked = function () {
                    if (!$scope.showSearchBox) {
                        $("#search-box-li").removeClass(self.hiddenSearchClasses);
                    } else {
                        $("#search-box-li").addClass(self.hiddenSearchClasses);
                    }
                    $scope.showSearchBox = !$scope.showSearchBox;
                };

                // search result from server
                $scope.searchResult = {};

                $scope.downloadFile = function (documentFile) {
                    documentsService.downloadFile(documentFile.id);
                };

                $scope.clear = function () {
                    $scope.searchResult = {};
                    $rootScope.showDisplay = true;
                    $scope.lll = '';
                };
                $scope.clear();

                $scope.goFullscreen = function () {
                    if (Fullscreen.isEnabled())
                        Fullscreen.cancel();
                    else
                        Fullscreen.all();

                    // Set Fullscreen to a specific element (bad practice)
                    // Fullscreen.enable( document.getElementById('img') )
                };

                /**
                 * search text box in the head of page - called in when text is changed
                 */
                $scope.seaechClicked = function () {
                    $scope.searchResult = {};
                    $rootScope.showDisplay = false;

                    if ($scope.lll.length === 0) {
                        logger.logWarning($translate.instant('APP.SEARCH.EMPTY_REQUEST'));
                        return;
                    }

                    self.searchBlockSelector = $('#search');
                    self.searchBlockSelector.addClass('open');
                    self.searchBlockSelector.find('> form > input[type="search"]').focus();

                    console.log("Search:" + $scope.lll);
                    SearchService.allSearch($scope.lll).then(function (data) {
                        $scope.searchResult = data;

                        if (data.resultNumber > 0) {
                            $rootScope.showDisplay = false;
                        } else {
                            $rootScope.showDisplay = true;
                        }

                    });
                };

                $rootScope.closeSearchTimeout = function () {
                    $timeout(function () {
                        $rootScope.showDisplay = true;
                        $scope.searchResult = {};
                        $scope.lll = '';
                    }, 1500);
                };


                $scope.allBookmarks = [];
                $scope.allBookmarks.push({name: "name1", link: "/customer/all"});
                $scope.allBookmarks.push({name: "name2", link: "/customer/all"});
                $scope.allBookmarks.push({name: "name3", link: "/customer/all"});
                $scope.allBookmarks.push({name: "name4", link: "/customer/all"});
                $scope.allBookmarks.push({name: "name5", link: "/customer/all"});


            }]);

}).call(this);
