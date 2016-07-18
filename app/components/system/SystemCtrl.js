'use strict';
angular.module('app.system', ['ngRoute', 'LocalStorageModule', 'ngMaterial'])

/**
 * add hoverClass to some DOM element on mouse hover
 */
    .directive('hoverClass', function () {
        return {
            restrict: 'A',
            scope: {
                hoverClass: '@'
            },
            link: function (scope, element) {
                element.on('mouseenter', function() {
                    element.addClass(scope.hoverClass);
                });
                element.on('mouseleave', function() {
                    element.removeClass(scope.hoverClass);
                });
            }
        };
    })
/**
 * Change UI (CSS) color
 */
    .service('ColorService', [function () {
        var self = this;

        self.setColor = function (color) {
            var mainColor = color;

            changecss(".panel-primary > .panel-heading", "background-color", mainColor);
            changecss(".btn-primary", "background-color", mainColor);
            changecss(".badge-info", "background-color", mainColor);
            changecss(".header-container > .top-header .logo", "background-color", mainColor);
            changecss(".background-input-color", "background-color", mainColor + " !important");
            changecss(".panel-primary", "border-color", mainColor);
        };
    }])

    /**
     * Show connection to server status and build version. For debug only
     */
    .controller('SystemOverviewCtrl', ['$scope', '$rootScope', 'domainService', 'configurationServiceDate', 'asyncService',
        function ($scope, $rootScope, domainService, configurationServiceDate, asyncService) {

            $scope.serverHealth = {};
            $scope.asyncServerHealth = {};

            domainService.serverHealthRoot().then(function (data) {
                $scope.serverHealth = data;
            });

            $scope.build = {};
            $scope.build.isCordova = GLOBAL_CONSTANTS.MOBILE_CORDOVA;
            $scope.build.gitRevision = GLOBAL_CONSTANTS.GIT_REVISION;

            $scope.serversURL = configurationServiceDate.serversURLs;

            // get server async status every second
            $scope.updateAsyncTry = function () {
                $scope.asyncServerHealth.connectTries = asyncService.connected.connectTries;
                $scope.asyncServerHealth.nextTryOnerrorMillias = asyncService.nextTryOnerrorMillias;
            };
            $scope.updateAsyncTryLoop = setInterval($scope.updateAsyncTry, 1000);

            $rootScope.$on("$locationChangeStart", function () {
                console.log("leave page");
                clearInterval($scope.updateAsyncTryLoop);
            });

            $scope.dbStats = {};
            $scope.executeDatabaseCommandRequest = {};
            $scope.executeDatabaseCommandRequest.command = "{ \n dbStats : 1\n}";

            domainService.executeDatabaseCommand($scope.executeDatabaseCommandRequest).then(function (data) {
                $scope.dbStats = data.result;
            });

        }])

    /**
     * Test page
     */
    .controller('DebugCtrl', ['$scope', 'ColorService',
        function ($scope, ColorService) {

            $scope.selectedId = '5623e074f9510f3308620fb1';
            $scope.mainColor = "#2196F3";

            $scope.setColor = function () {
                ColorService.setColor($scope.mainColor);
            };

            //$scope.date = '%CURRENT_DAY_END%';
            $scope.date = '2015-12-16T06:45:00.000Z';

            $scope.files = [];
            $scope.allObjects = [];
        }])

    /**
     * Database control
     */
    .controller('DatabaseAdminCtrl', ['$scope', '$rootScope', 'domainService', 'logger', 'SweetAlert',
        function ($scope, $rootScope, domainService, logger, SweetAlert) {

            $scope.allUsers = [];
            var self = this;

            $scope.getAllUser = function () {
                domainService.getAllUsersInDomainDataBase().then(function (data) {
                    $scope.allUsers = data.users;
                });
            };
            $scope.getAllUser();

            self.generateURIFromDataBaseResponse = function (data) {
                var quickURI;

                var host = "db-public-gateway.biqasoft.com";
                var port = 27017;

                // var uri = 'mongodb://user%3An%40me:p%40ssword@host:1234/d%40tabase?authSource=%40dmin';
                // mongodb://H7sXKfNiJOoBPByF:X5hQ8Kx9KQZ9165.mongolab.com:39165/hishop
                // quickURI = "mongodb://" + data.login + ":" + data.password + "@" + host + ":" + port + "/" + $rootScope.currentUser.domain;
                // quickURI = encodeURI(quickURI);
                return null;
            };

            $scope.addNewUser = function () {
                domainService.getDatabaseCredentials().then(function (response) {
                    response.quickURI = self.generateURIFromDataBaseResponse(response);
                    $scope.allUsers.push(response);
                });
            };

            $scope.deleteUserByName = function (name) {
                domainService.dropUserDataBase(name).then(function (data) {
                    $scope.getAllUser();
                });
            };

            $scope.deleteDomainServiceConfirmation = function (name) {
                SweetAlert.swal({
                        title: "Удалить пользователя в базе данных?",
                        text: "Данное действие удалит объект безвозвратно!",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Да, удалить!",
                        cancelButtonText: "Отмена",
                        closeOnConfirm: true,
                        closeOnCancel: true
                    },
                    function (isConfirm) {
                        if (isConfirm) {
                            SweetAlert.swal("Удален!", "", "success");

                            $scope.deleteUserByName(name);

                        } else {
                            SweetAlert.swal("Отмена", "error");
                        }
                    }
                )
            };
        }]);

