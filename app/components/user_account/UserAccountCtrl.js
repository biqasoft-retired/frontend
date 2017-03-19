'use strict';

angular.module('app.userAccount.details', ['ngRoute', 'LocalStorageModule'])

    .controller('UserAccountNewCtrl', ['$scope', '$rootScope', 'userAccountService', 'logger', '$translate',
        function ($scope, $rootScope, userAccountService, logger, $translate) {

            $scope.newUserAccount = {};
            $scope.newUserAccount.username = "";
            $scope.sendWelcomeEmail = true;

            $scope.newUserAccount.roles = ["ROLE_ALLOW_ALL_DOMAIN_BASED"];

            $scope.usernameChanged = function () {
                $scope.newUserAccount.email = $scope.newUserAccount.username;
            };

            $scope.addUserAccountController = function () {
                var objToSend = {};
                objToSend.sendWelcomeEmail = $scope.sendWelcomeEmail;
                objToSend.userAccount = $scope.newUserAccount;
                objToSend.password = $scope.password;

                userAccountService.addAccount(objToSend).then(function (data) {
                    logger.logSuccess($translate.instant('USERACCOUNT.NEW.ADD_SUCCESSED'));
                }, function (data) {
                    console.log(data);
                    if (data.data.message === 'USER WITH THIS USERNAME ALREADY EXIST') {
                        logger.logError(data.data.message);
                    }
                });
            }
        }])

    .controller('AllUserAccountsCtrl', ['$scope', '$rootScope', '$translate',
        function ($scope, $rootScope, $translate) {

            $scope.viewTypes = [
                {name: $translate.instant('APP.VIEW_TYPES.CARDS'), value: 'cards'},
                {name: $translate.instant('APP.VIEW_TYPES.TABLE'), value: 'table'}
            ];

            $scope.viewType = $scope.viewTypes[0];
        }])

    .controller('UserAccountDetailsCtrl', ['$scope', '$rootScope', 'UserService', '$route', 'logger', '$mdDialog', '$translate',
        function ($scope, $rootScope, UserService, $route, logger, $mdDialog, $translate) {
            $scope.allRoles = [];
            $scope.account = {};

            $scope.objectHistoryResultHolder = [];

            UserService.getAccountById($route.current.params.id).then(function (e) {
                $scope.account = e;
                $rootScope.title = e.firstname + " " + e.lastname;
            });

            $scope.showEffectiveRoles = false;

            //change password
            $scope.changePassword = function () {
                UserService.changePassword($scope.account).then(function (e) {
                    $scope.newPasswordRecieved = e.username;
                });
            };

            $scope.updateProfile = function () {
                logger.logSuccess($translate.instant('USERACCOUNT.DETAILS.UPDATE.SUCCESSED'));
                UserService.updateUserAccount($scope.account);
            };

            $scope.showProfileOverview = function (ev) {
                $mdDialog.show({
                    scope: $scope,
                    preserveScope: true,
                    templateUrl: 'app/components/user_account/modal/change_password_for_hr.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true
                })
                    .then(function () {
                    }, function () {
                    });
            };

        }])

    .controller('MyAccountCtrl', ['$scope', '$rootScope', 'logger', 'UserService', 'ColorService', '$mdDialog', '$translate', 'authService',
        function ($scope, $rootScope, logger, UserService, ColorService, $mdDialog, $translate, authService) {

            var self = this;

            $scope.updateCurrentProfile = function () {
                UserService.updateCurrentUser($rootScope.currentUser).then(function (data) {
                    logger.logSuccess($translate.instant('USERACCOUNT.MYACCOUNT.UPDATE.SUCCESSED'));

                    // update settings AFTER updating profile to avoid 
                    // concurrency - rewrite
                    $rootScope.updatePersonalSettings();
                });
            };

            $scope.mainColor = "#2196F3";

            $scope.newAuth = {};
            $scope.newAuth.roles = [];

            $scope.allOauthTokens = [];

            $scope.currentActiveToken = authService.getLocalStorageUserCredentials().username;

            $scope.try_add_2step_auth_response = "";
            $scope.twoStepConfirmationCode = "";

            $scope.tryToAdd2StepAuthButton = function () {
                UserService.requestSecretCode().then(function (data) {
                    $scope.try_add_2step_auth_response = data.image;
                });
            };

            $scope.enableTwoStepAuthButton = function () {
                UserService.enableTwoStepAuth($scope.twoStepConfirmationCode).then(function (data) {
                    logger.logError($translate.instant('USERACCOUNT.MYACCOUNT.PERSONAL_SETTINGS.SECURITY.TWO_STEP_AUTH.CONNECTED.SUCCESSFULLY'));
                },function (data) {

                });
            };

            $scope.disableTwoStepAuthAuthButton = function () {
                UserService.disableTwoStepAuth().then(function (data) {
                    $rootScope.currentUser.twoStepEnabled = false;
                });
            };

            self.getAllTokens = function () {
                UserService.getOAuthTokens().then(function (data) {
                    $scope.allOauthTokens = data;
                });
            };
            self.getAllTokens();

            $scope.deleteToken = function (tokenId, index) {
                UserService.deleteOAuthTokens(tokenId).then(function (data) {
                    $scope.allOauthTokens.splice(index, 1);
                });
            };

            // add plus sign to timezone view
            $scope.timeZone = new Date().getTimezoneOffset() / -60;
            if ($scope.timeZone > 0) {
                $scope.timeZone = "+" + $scope.timeZone;
            }

            $scope.setColor = function () {
                ColorService.setColor($scope.mainColor);
                $rootScope.personalSettings.colors.mainColor = $scope.mainColor;
            };

            $scope.createHttpToken = function () {
                UserService.createNewCredentialsWithRoles($scope.newAuth).then(function (data) {

                    $scope.newAuth.username = data.username;
                    $scope.newAuth.password = data.password;
                    $scope.newAuth.token = Base64.encode(data.username + ":" + data.password);

                    self.getAllTokens();
                }, function (data) {
                    logger.logError($translate.instant('APP.COMMON.ERROR.REQUEST'));
                });
            };

            $scope.generateCredentials = function (ev) {
                $mdDialog.show({
                    scope: $scope,
                    preserveScope: true,
                    templateUrl: 'app/components/user_account/modal/generate_credentials.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true
                })
                    .then(function (answer) {
                    }, function () {
                    });
            };

        }])
;

