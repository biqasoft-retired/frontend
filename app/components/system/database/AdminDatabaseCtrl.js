'use strict';
angular.module('app.admin', ['ngRoute', 'LocalStorageModule', 'ngMaterial'])

    .controller('DatabaseCtrl', ['$scope', '$rootScope', 'domainService', 'logger', 'SweetAlert',
        function($scope, $rootScope, domainService, logger, SweetAlert) {

            $scope.executeDatabaseCommandRequest = {};
            
            $scope.prettyShowResult = true;

            $scope.result = {};

            $scope.executeDatabaseCommand = function() {
                domainService.executeDatabaseCommand($scope.executeDatabaseCommandRequest).then(function(data) {
                    $scope.result = data;
                });
            };

            $scope.exampleTask = function() {
                $scope.executeDatabaseCommandRequest.command = '{\r\n "insert":"task", \r\n "documents":[\r\n   {"name":"Новая задача, созданная через запрос к базе данных ","completed":false, "archived":false, \r\n "createdInfo": { "createdDate": {"$date": "'+new Date().toISOString()+'" } },  \r\n    "responsibles":{"userAccountsIDs":["' + $rootScope.currentUser.id + '"]} \r\n } \r\n ] \r\n }';
            };

            $scope.exampleGetAllCustomers = function() {
                $scope.executeDatabaseCommandRequest.command = "{ \r\n find : 'customer' \r\n}";
            };

            $scope.exampleGetAllCustomers();

            $scope.editorOptions = {
                lineWrapping: true,
                lineNumbers: true,
                indentWithTabs: true,
                mode: 'javascript',
                extraKeys: {"Ctrl-Space": "autocomplete",
                    "F11": function(cm) {
                        cm.setOption("fullScreen", !cm.getOption("fullScreen"));
                    },
                    "Esc": function(cm) {
                        if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
                    }},
                viewportMargin: Infinity
            };

        }])

;

