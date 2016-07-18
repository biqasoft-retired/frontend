/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
window.app = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        var pushNotification;


        function successHandler(result) {
            //alert('result = ' + result);
            console.log("resultHandler");
            console.log(result);
        }

        function errorHandler(result) {
            //alert('errorHandler = ' + result);
            console.log("errorHandler");
            console.log(result);
        }


        function tokenHandler(result) {
            // Your iOS push server needs to know the token before it can push to this device
            // here is where you might want to send it the token for later use.
            console.log("device token");
            console.log(result);
        }

        pushNotification = window.plugins.pushNotification;
        console.log('registering ' + device.platform);
        //$("#app-status-ul").append('<li>registering ' + device.platform + '</li>');

        if (device.platform == 'android' || device.platform == 'Android' || device.platform == "amazon-fireos") {
            pushNotification.register(
                successHandler,
                errorHandler,
                {
                    "senderID": "428281173433",
                    "ecb": "onNotification"
                });
        } else if (device.platform == 'blackberry10') {
            pushNotification.register(
                successHandler,
                errorHandler,
                {
                    invokeTargetId: "replace_with_invoke_target_id",
                    appId: "replace_with_app_id",
                    ppgUrl: "replace_with_ppg_url", //remove for BES pushes
                    ecb: "pushNotificationHandler",
                    simChangeCallback: replace_with_simChange_callback,
                    pushTransportReadyCallback: replace_with_pushTransportReady_callback,
                    launchApplicationOnPush: true
                });
        } else {
            pushNotification.register(
                tokenHandler,
                errorHandler,
                {
                    "badge": "true",
                    "sound": "true",
                    "alert": "true",
                    "ecb": "onNotificationAPN"
                });
        }


        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {
        //var parentElement = document.getElementById(id);
        //var listeningElement = parentElement.querySelector('.listening');
        //var receivedElement = parentElement.querySelector('.received');

        //listeningElement.setAttribute('style', 'display:none;');
        //receivedElement.setAttribute('style', 'display:block;');

        //console.log('Received Event: ' + id);
    }
};
