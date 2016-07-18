'use strict';
angular.module('app.oauth', ['ngRoute', 'LocalStorageModule', 'ngMaterial'])

    .controller('Oauth2AllCtrl', ['$scope', '$rootScope', 'domainService', 'logger', 'AuthService',
        function($scope, $rootScope, domainService, logger, AuthService) {

            $scope.newApp = {};
            $scope.apps = [];

            $scope.viewTypes = [
                {name: "Приложения в домене", value: 'domainApps'},
                //{name: 'Публичные приложения', value: 'publicApps'}
            ];
            $scope.viewType = $scope.viewTypes[0];

            if ($rootScope.debugMode){
                $scope.viewTypes.push({name: 'Публичные приложения', value: 'publicApps'});
            }

            $scope.changedView = function() {
                if ($scope.viewType.value === 'domainApps') {
                    $scope.getDomainApps();
                } else {
                    $scope.getAllPublicOauthApplications();
                }
            };

            $scope.getDomainApps = function() {
                AuthService.getAllOauthApplicationsInDomain().then(function(data) {
                    $scope.apps = data;
                });
            };
            $scope.getDomainApps();

            $scope.getAllPublicOauthApplications = function() {
                AuthService.getAllPublicOauthApplications().then(function(data) {
                    $scope.apps = data;
                });
            };

            $scope.addNewUser = function() {
                AuthService.createNewOAuthApplication($scope.newApp).then(function(data) {
                    console.log(data);
                    $scope.apps.push(data);
                })
            };

            $scope.deleteUserByName = function(name) {
                domainService.dropUserDataBase(name).then(function(data) {
                    logger.logWarning(data);
                    $scope.getAllUser();
                })
            }

        }])

    .controller('Oauth2AppCtrl', ['$scope', '$rootScope', 'domainService', 'logger', 'AuthService', '$route', 'SweetAlert', '$location',
        function($scope, $rootScope, domainService, logger, AuthService, $route, SweetAlert, $location) {

            $scope.app = {};
            $scope.appSecretCode = "";

            AuthService.getOauthApplicationById($route.current.params.id).then(function(data) {
                $scope.app = data;
            });

            $scope.saveApp = function() {
                AuthService.updateOAuthApplication($scope.app).then(function(data) {
                })
            };

            $scope.getAppSecretCode = function() {
                AuthService.getOauthApplicationSecretCodeById($scope.app.id).then(function(data) {
                    $scope.appSecretCode = data;
                })
            };

            $scope.deleteApp = function() {
                AuthService.deleteOauthApplicationById($scope.app.id).then(function(data) {
                    $location.path('/developers/oauth2/apps');
                })
            };

            $scope.deleteUserByName = function(name) {
                domainService.dropUserDataBase(name).then(function(data) {
                    logger.logWarning(data);
                    $scope.getAllUser();
                })
            };

            $scope.deleteAppConfirmation = function() {
                SweetAlert.swal({
                        title: "Удалить приложение?",
                        text: "Данное действие удалит объект безвозвратно!",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Да, удалить!",
                        cancelButtonText: "Отмена",
                        closeOnConfirm: true,
                        closeOnCancel: true
                    },
                    function(isConfirm) {
                        if (isConfirm) {
                            SweetAlert.swal("Удален!", "", "success");

                            $scope.deleteApp ();

                        } else {
                            SweetAlert.swal("Отмена", "error");
                        }
                    }

                )
            };

        }])

    .controller('Oauth2AppGrantCtrl', ['$scope', '$rootScope', 'domainService', 'logger', 'AuthService', '$route', '$location',
        function($scope, $rootScope, domainService, logger, AuthService, $route, $location) {

            //http://localhost:8080/oauth/authorize?response_type=code&client_id=acme&redirect_uri=http://example.com
            $scope.app = {};
            $scope.givedRoles = [];

            var appID = $location.search().client_id;

            $scope.giveAccess = function() {
                var obj = {};
                obj.roles = $scope.app.roles;
                obj.clientApplicationID = $scope.app.id;

                AuthService.authoriseNewApplicationToUser(obj).then(function(data) {
                    window.location = data.redirectUri;
                }, function() {

                })
            };

            if (typeof appID !== 'undefined') {
                AuthService.getOauthApplicationById(appID).then(function(data) {
                    $scope.app = data;
                    $scope.givedRoles = data.roles;

                    if ($scope.app.giveAccessWithoutPrompt) {
                        $scope.giveAccess();
                    }
                });
            }

            $scope.deniedAccess = function() {
                window.close();
            };

        }])
;

