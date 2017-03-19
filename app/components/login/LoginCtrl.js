'use strict';

angular.module('app.login', ['ngRoute', 'LocalStorageModule'])

    .controller('LoginCtrl', ['$scope', '$rootScope', 'localStorageService', 'UserService', 'logger', 'configurationService', 'serverRequestService',
        function ($scope, $rootScope, localStorageService, UserService, logger, configurationService, serverRequestService) {
            $scope.EnterpriseApiURL = "http://";
            $scope.userName = "";
            $scope.useEnterprise = false;
            $scope.require2StepAuth = false;

            // all users that login in browser
            $scope.allUserAccounts = localStorageService.get('allUserAccounts');

            // if we have username and password in GET location (?username=..& password=...) - delete from url
            // to prevent override
            $scope.chooseAnotherAccount = function () {
                window.location = window.location.pathname;
            };

            // try to auth user
            $scope.update = function () {
                if ($scope.useEnterprise) {
                    localStorageService.set('useEnterprise', true);
                    localStorageService.set('EnterpriseApiURL', $scope.EnterpriseApiURL);
                    serverRequestService.baseUrl = $scope.EnterpriseApiURL;
                } else {
                    localStorageService.set('useEnterprise', false);
                }

                // auth with login and password in REST API
                configurationService.authentificateUserWithLoginAndPassword($scope.userName, $scope.userPassword);

                if ($scope.require2StepAuth){
                    configurationService.authentificateUserWithLoginAndPasswordAndTwoStepCode($scope.userName, $scope.userPassword, $scope.twoStepAuthCode);
                }

                if ($scope.userName.startsWith("OAUTH2")){
                    configurationService.authentificateUserWithLoginAndPassword($scope.userName, $scope.userPassword);
                    $scope.chooseAnotherAccount();
                }else{
                    // we do not want to auth with login and password futher (it's slower) -> get token from server
                    UserService.createNewCredentials().then(function (data) {
                        configurationService.authentificateUserWithLoginAndPassword(data.username, data.password);
                        $scope.chooseAnotherAccount();
                    }, function (data) {
                        if (data.data.idErrorMessage === 'auth.exception.two_step_require'){
                            $scope.require2StepAuth = true;
                        }
                        // error will be processed by global error interceptor factory (for 401 code)
                        // and will be shown message
                    });
                }
            };

            $scope.selectAccount = function (account) {
                console.log("Selected account", account);
                configurationService.authentificateUserWithLoginAndPassword(account.username, account.password);
            };

            $scope.isCurrentUserActive = function (account) {
                if (!account || !$rootScope.currentUser){
                    return false;
                }

                if (account.username === $rootScope.currentUser.username) return true;
                return false;
            };

            $scope.EnterpriseClicked = function () {
                $scope.useEnterprise = true;
            };

            $scope.CloudClicked = function () {
                $scope.useEnterprise = false;
            };


        }])
;

