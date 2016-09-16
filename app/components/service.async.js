/**
 * Created Nikita Bakaev, ya@nbakaev.ru on 5/18/2016.
 * All Rights Reserved
 */
angular.module('app.services.api')
    .service('asyncService', ['serverRequestService', 'configurationServiceDate', '$timeout', 'localStorageService', 'authService', 'systemSettingsGatewayService',
        function (serverRequestService, configurationServiceDate, $timeout, localStorageService, authService, systemSettingsGatewayService) {

            var self = this;

            // WebSocket object
            self.socket = null;

            self.connected = {};

            // prevent concurrent rewrite connection    
            self.connected.initSocketLock = false;
            self.connected.connectTries = 0;

            // pause between retry on fail
            self.nextTryOnerrorMillias = 1000;
            self.nextTryOnerrorMilliasProgressStep = 1000;

            // array of functions which will be executed on every message from server
            // todo: observer
            self.subscribers = [];

            configurationServiceDate.onlineStatus.connectedToAsyncServer = false;

            // WebSocket url
            self.baseUrl = null;
            self.haveBaseUrlRequest = false;

            self.tryResolveBaseUrl = function () {
                if (!isUndefinedOrNullOrEmpty(self.baseUrl)) {
                    return self.baseUrl;
                }

                if (self.haveBaseUrlRequest) {
                    return;
                }
                self.haveBaseUrlRequest = true;

                systemSettingsGatewayService.getAsyncUrl().then(function (data) {
                    self.baseUrl = data.asyncGateway;
                    console.info("ASYNC Address: " + self.baseUrl);
                    console.info("------------------------------");
                    self.haveBaseUrlRequest = false;
                });
            };

            self.tryResolveBaseUrl();

            /**
             * Internal method to connect to server to anync via websocket
             *
             * if we already have connection - close and set up new
             */
            self.initSocket = function () {

                if (self.connected.initSocketLock || configurationServiceDate.onlineStatus.connectedToAsyncServer) {
                    if (self.connected.reconnectWindow != null) {
                        clearInterval(self.connected.reconnectWindow);
                    }
                    return;
                }

                if (self.baseUrl === null) {
                    self.tryResolveBaseUrl();
                    self.reconnectOnError();
                    return;
                }

                self.connected.initSocketLock = true;

                if (self.socket !== null) {
                    self.socket.close();
                }

                self.socket = new WebSocket(self.baseUrl + "?token=" + authService.getAuthAPItokenWithoutBasic());

                self.socket.onmessage = function (e) {
                    console.log('message', e.data);
                    configurationServiceDate.onlineStatus.connectedToAsyncServer = true;

                    // process all subscribers
                    if (self.subscribers && self.subscribers.length > 0) {
                        self.subscribers.forEach(function (obj) {
                            if (typeof obj === 'function') {
                                obj(e);
                            }
                        });
                    }
                };

                self.socket.onopen = function (e) {
                    self.connected.initSocketLock = false;

                    console.log('open websocket');
                    configurationServiceDate.onlineStatus.connectedToAsyncServer = true;

                    var testObject = {};
                    testObject.id = new ObjectId().toString();
                    testObject.data = "TEST_DATA_FROM_CLIENT";
                    self.socket.send(JSON.stringify(testObject));
                };

                self.socket.onclose = function (e) {
                    self.connected.initSocketLock = false;
                    configurationServiceDate.onlineStatus.connectedToAsyncServer = false;
                    console.log('close websocket', e);
                    self.reconnectOnError();
                };

            };

            self.subscribeToAllEvents = function (receiverArray, options) {
                var _options = options || {scope: null};

                var receiver = function (obj) {
                    receiverArray.push(JSON.parse(obj.data));

                    if (_options.scope !== null) {
                        _options.scope.$applyAsync();
                    }
                };

                self.subscribers.push(receiver);

                if (self.socket === null) {
                    self.initSocket();
                }
            };

            self.reconnectOnError = function () {
                clearInterval(self.connected.reconnectWindow);

                self.tryToReconnect = function () {
                    if (configurationServiceDate.onlineStatus.connectedToAsyncServer == true) {
                        clearInterval(self.connected.reconnectWindow);
                        return;
                    }

                    $timeout(function () {
                        if (configurationServiceDate.onlineStatus.connectedToAsyncServer) {
                            clearInterval(self.connected.reconnectWindow);
                            return;
                        } else {
                            self.connected.reconnectWindow = window.setInterval(self.tryToReconnect, self.nextTryOnerrorMillias);
                        }

                        if (self.connected.connectTries === 0) {
                            console.warn("Trying to connect to WS, URL", self.baseUrl);
                        } else {
                            console.warn("Trying to reconnect to WS, URL", self.baseUrl);
                        }

                        self.initSocket();
                        self.nextTryOnerrorMillias += self.nextTryOnerrorMilliasProgressStep;
                        self.connected.connectTries++;

                        if (configurationServiceDate.onlineStatus.connectedToAsyncServer) {
                            clearInterval(self.connected.reconnectWindow);
                        } else {
                            self.connected.reconnectWindow = window.setInterval(self.tryToReconnect, self.nextTryOnerrorMillias);
                        }

                    }, self.nextTryOnerrorMillias);

                };
                self.tryToReconnect();
            };

        }]);