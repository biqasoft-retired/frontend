'use strict';

angular.module('app.login', ['ngRoute', 'LocalStorageModule'])

    .controller('LoginCtrl', ['$scope', '$rootScope', 'localStorageService', 'UserService', 'logger', 'configurationService',
        function ($scope, $rootScope, localStorageService, UserService, logger, configurationService) {

            $scope.EnterpriseApiURL = "http://";
            $scope.userName = "";
            $scope.useEnterprise = false;

            $scope.allUserAccounts = localStorageService.get('allUserAccounts');

            $scope.update = function () {
                localStorageService.set('useEnterprise', false);

                if ($scope.useEnterprise) {
                    localStorageService.set('useEnterprise', true);

                    console.log($scope.EnterpriseApiURL);
                    localStorageService.set('EnterpriseApiURL', $scope.EnterpriseApiURL);
                }

                configurationService.authentificateUserWithLoginAndPassword($scope.userName, $scope.userPassword);

                UserService.createNewCredentials().then(function (data) {
                    console.log(data);
                    configurationService.authentificateUserWithLoginAndPassword(data.username, data.password);
                    window.location = window.location.pathname;

                }, function (data) {
                    logger.logError("Неправильный логин или пароль!");
                });

            };

            $scope.selectAccount = function (account) {
                console.log(account);
                configurationService.authentificateUserWithLoginAndPassword(account.username, account.password);
            };

            $scope.isCurrentUserActive = function (account) {
                if (account.username === localStorageService.get('userName')) return true;
                return false;
            };

            $scope.EnterpriseClicked = function () {
                $scope.useEnterprise = true;
            };

            $scope.CloudClicked = function () {
                $scope.useEnterprise = false;
            };

            $scope.chooseAnotherAccount = function () {
                window.location = window.location.pathname;
            };

        }])
;

