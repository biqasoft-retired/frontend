/**
 * Created Nikita Bakaev, ya@nbakaev.ru on 5/18/2016.
 * All Rights Reserved
 */
angular.module('app.services.api')
    .service('asyncService', ['serverRequestService', 'configurationServiceDate', '$timeout', 'localStorageService', 'authService',
        function (serverRequestService, configurationServiceDate, $timeout, localStorageService, authService) {

            var self = this;

            self.socket = null;

            self.connected = {};

            // prevent concurrent rewrite connection    
            self.connected.initSocketLock = false;

            self.nextTryOnerrorMillias = 1000;

            self.connected.connectTries = 0;

            self.subscribers = [];

            configurationServiceDate.onlineStatus.connectedToAsyncServer = false;

            self.baseUrl = configurationServiceDate.serversURLs.asyncAPIserverURL + "/ws";

            /**
             * Internal method to connect to server to anync via websocket
             *
             * if we already have connection - close and set up new
             */
            self.initSocket = function () {

                if (self.connected.initSocketLock) {
                    return;
                }
                self.connected.initSocketLock = true;

                if (self.socket != null) {
                    self.socket.close();
                }

                self.socket = null;
                self.socket = new SockJS(self.baseUrl + "/?token=" + authService.getAuthAPItokenWithoutBasic());

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
                    console.log('open');
                    configurationServiceDate.onlineStatus.connectedToAsyncServer = true;

                    var testObject = {};
                    testObject.id = new ObjectId().toString();
                    testObject.data = "TEST_DATA_FROM_CLIENT";
                    self.socket.send(JSON.stringify(testObject));
                };

                self.socket.onclose = function (e) {
                    configurationServiceDate.onlineStatus.connectedToAsyncServer = false;
                    console.log('close websocket', e);
                    self.reconnectOnError();
                };

                self.connected.initSocketLock = false;
            };

            self.subscribeToAllEvents = function (recieverArray, options) {
                var _options = options || {scope: null};

                var resiever = function (obj) {
                    recieverArray.push(JSON.parse(obj.data));

                    if (_options.scope != null) {
                        _options.scope.$applyAsync();
                    }
                };

                self.subscribers.push(resiever);

                if (self.socket == null) {
                    self.initSocket();
                }
            };

            self.reconnectOnError = function () {
                clearInterval(self.connected.reconnectWindow);

                self.tryToRecconect = function () {
                    if (configurationServiceDate.onlineStatus.connectedToAsyncServer == true) {
                        clearInterval(self.connected.reconnectWindow);
                        return;
                    }

                    $timeout(function () {
                        console.warn("Trying to reconnect to WS, URL", self.baseUrl);
                        self.initSocket();
                        self.nextTryOnerrorMillias += 1000;
                        self.connected.connectTries++;

                        clearInterval(self.connected.reconnectWindow);
                        self.connected.reconnectWindow = window.setInterval(self.tryToRecconect, self.nextTryOnerrorMillias);
                    }, self.nextTryOnerrorMillias);

                };
                self.connected.reconnectWindow = window.setInterval(self.tryToRecconect, self.nextTryOnerrorMillias);
            };

        }]);