'use strict';

angular.module('app.realCall', ['ngRoute', 'LocalStorageModule'])

    .controller('RealCallCtrl', ['$scope', function ($scope) {

        var initialized = false, // SDK загружено
            loggedIn = false, // пользователь авторизован
            connected = false, // получено соединение с VoxImplant сервером
            voxImplant = VoxImplant.getInstance();

        // добавляем прослушивателей основных событий
        // событие загрузки SDK
        voxImplant.addEventListener(VoxImplant.Events.SDKReady, handleSDKReady);

        // событие установки соединения с сервером VoxImplant
        voxImplant.addEventListener(VoxImplant.Events.ConnectionEstablished, handleConnectionEstablished);

        // событие авторизации пользователя на сервере VoxImplant
        voxImplant.addEventListener(VoxImplant.Events.AuthResult, handleAuthResult);

        // SDK загружен, соединяемся с VoxImplant сервером
        function handleSDKReady() {
            initialized = true;
            voxImplant.connect();
        }

        // соединились с VoxImplant сервером успешно, авторизуем юзера
        function handleConnectionEstablished() {
            connected = true;
            login();
        }

        // проверяем статус авторизации
        function handleAuthResult(e) {
            if (e.result) {
                // Авторизовались успешно
                loggedIn = true;
                makeCall();
            }
        }

        // проводим авторизацию
        function login() {
            // данные созданного пользователя и приложения
            voxImplant.login("nbakaev@firstapp.nbakaev.voximplant.com", "__");
        }

        function makeCall() {
            var call = voxImplant.call($scope.telephoneToCall); // ваш номер для дозвона
        };

        $scope.testCall = function () {
            // если SDK не инициализирован - проводим процесс
            if (!initialized) voxImplant.init();
            else {
                // если не установлено соединение с сервером VoxImplant - устанавливаем
                if (!voxImplant.connected()) voxImplant.connect();
                else {
                    // если юзер не авторизован - авторизуем, если авторизован - звоним
                    if (!loggedIn) login();
                    else makeCall();
                }
            }
        };

        $scope.telephoneToCall = "";
        $(document).ready(function () {

            $('.num').click(function () {
                var num = $(this);
                var text = $.trim(num.find('.txt').clone().children().remove().end().text());
                $scope.telephoneToCall += text;
            });

        });

    }])
