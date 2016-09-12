'use strict';

angular.module('app.externalServices', ['ngRoute', 'LocalStorageModule'])

    .controller('ExternalServicesDetailsCtrl', ['$scope', '$rootScope', 'logger', 'tokenService', '$route', '$location',
        function ($scope, $rootScope, logger, tokenService, $route, $location) {

            $scope.currentTokenId = $route.current.params.id;
            $scope.currentToken = tokenService.getTokenById($scope.currentTokenId).then(function (data) {
                $scope.currentToken = data;
            });

            $scope.updateToken = function () {
                tokenService.updateToken($scope.currentToken);
                logger.logSuccess("Данные по сервису обновлены!");
            };

            $scope.deleteToken = function () {
                tokenService.deleteTokenById($scope.currentTokenId).then(function (data) {
                    $location.path('/external_services');
                });
                logger.logError("Привязка к сервису удалена!")
            };
        }])

    .controller('DropboxOauth2RedirectedCtrl', ['$scope', '$rootScope', 'logger', 'tokenService', '$route', '$location',
        function ($scope, $rootScope, logger, tokenService, $route, $location) {

            $scope.currentTokenId = $location.search().code;
            $scope.currentTokenState = $location.search().state;

            tokenService.postDropboxAccessCodeToServer($scope.currentTokenId, $scope.currentTokenState).then(function (data) {
                $location.path('/external_services/details/' + data.id);
            });
        }])

    .controller('GoogleOauth2RedirectedCtrl', ['$scope', '$rootScope', 'logger', 'tokenService', '$route', '$location',
        function ($scope, $rootScope, logger, tokenService, $route, $location) {

            $scope.currentTokenId = $location.search().code;
            $scope.currentTokenState = $location.search().state;

            tokenService.postGoogleDriveAccessCodeToServer($scope.currentTokenId).then(function (data) {
                $location.path('/external_services/details/' + data.id);
            });
        }])

    .controller('ExternalServicesAllCtrl', ['$scope', '$rootScope', 'logger', 'tokenService', '$timeout', '$modal', '$mdDialog',
        function ($scope, $rootScope, logger, tokenService, $timeout, $modal, $mdDialog) {

            $scope.tokens = [];

            tokenService.getAllAccounts().then(function (a) {
                $scope.tokens = a;
            });

            $scope.yandexClientId = "";

            $scope.connectYandexDirect = function (ev) {
                tokenService.getYandexDirectRedirectLink().then(function (a) {
                    $scope.yandexClientId = a.url;
                });

                $mdDialog.show({
                    scope: $scope,
                    preserveScope: true,
                    templateUrl: 'app/components/external_services/modal/direct_add_modal.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true
                })
                    .then(function (answer) {
                    }, function () {
                        $scope.status = 'You cancelled the dialog.';
                    });
            };

            $scope.addWebdav = function (ev) {
                $mdDialog.show({
                    scope: $scope,
                    preserveScope: true,
                    templateUrl: 'app/components/external_services/modal/webdav_new.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true
                })
                    .then(function (answer) {

                    }, function () {
                    });

                $scope.newToken = {};
                $scope.newToken.name = "Новый WebDav";
                $scope.newToken.server = "https://example.com";
                $scope.newToken.type = "WEBDAV";
            };

            $scope.addYandexDisc = function (ev) {
                $mdDialog.show({
                    scope: $scope,
                    preserveScope: true,
                    templateUrl: 'app/components/external_services/modal/webdav_new.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true
                })
                    .then(function (answer) {
                    }, function () {
                    });

                $scope.newToken = {};
                $scope.newToken.name = "Новый Яндекс Диск";
                $scope.newToken.server = "https://webdav.yandex.ru";
                $scope.newToken.type = "WEBDAV";
            };

            $scope.addWebdavToServer = function () {
                tokenService.addToken($scope.newToken);
            };

            $scope.sameSise = function () {
                var sameHeightTop = $(".modify_parent");
                if (sameHeightTop.length !== 0) {
                    sameHeightTop.each(function () {
                        var tallest = 0;
                        var sameHeightChildren = $(this).find(".modify_child");
                        sameHeightChildren.each(function () {
                            var thisHeight = $(this).height();
                            if (thisHeight > tallest) {
                                tallest = thisHeight;
                            }
                        });
                        sameHeightChildren.height(tallest);
                    });
                }
            };

            // with `approval_prompt=force` we will always get `refresh token ` from server
            // even server already gave it us earlier
            // which need
            $scope.getGoogleDriveRequestToConnectNewAccount = function () {
                tokenService.getGoogleDriveRedirectLink().then(function (data) {
                    window.location = data.url;
                });
            };

            $scope.getDropboxRequestToConnectNewAccount = function () {
                tokenService.getDropboxRequestToConnectNewAccount().then(function (data) {
                    window.location = data.url;
                });
            };

        }]);
