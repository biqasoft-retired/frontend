'use strict';

angular.module('app.userAccount.groups', ['ngRoute', 'LocalStorageModule'])

    .controller('AllUserAccountsGroupsCtrl', ['$scope', '$rootScope', 'UserAccountGroupService',
        function ($scope, $rootScope, UserAccountGroupService) {

            $scope.allUsersGroups = [];
            $scope.newUserGroups = {};

            UserAccountGroupService.getAllUserAccountGroups().then(function (data) {
                $scope.allUsersGroups = data;
            });

            $scope.addNewGroup = function () {
                UserAccountGroupService.addNewUserAccountGroup($scope.newUserGroups).then(function (data) {
                    $scope.allUsersGroups.push(data);
                    $scope.newUserGroups = {};
                });
            };

        }])

    .controller('UserAccountGroupsDetailsCtrl', ['$scope', '$rootScope', 'UserService', '$route', 'logger', '$mdDialog',
        'UserAccountGroupService', '$location', 'SweetAlert', '$translate',
        function ($scope, $rootScope, UserService, $route, logger, $mdDialog,
                  UserAccountGroupService, $location, SweetAlert, $translate) {

            $scope.currentGroups = {};

            UserAccountGroupService.getUserAccountGroupById($route.current.params.id).then(function (data) {
                $scope.currentGroups = data;
                $rootScope.title = data.name;
            });

            $scope.updateGroup = function () {
                UserAccountGroupService.updateUserAccountGroup($scope.currentGroups).then(function (data) {
                    logger.logSuccess($translate.instant('APP.COMMON.TOASTS.UPDATED.SUCCESS'));
                });
            };

            $scope.deleteGroup = function () {
                UserAccountGroupService.deleteUserAccountGroupById($scope.currentGroups.id).then(function () {
                    logger.logSuccess($translate.instant('APP.COMMON.TOASTS.DELETED.SUCCESS'));
                    $location.path('/user_account/groups');
                });
            };

            $scope.deleteUserGroupModal = function () {
                SweetAlert.swal({
                        title: $translate.instant('USERACCOUNT.GROUP.DETAILS.MODAL.DELETE.P1') + ":" + $scope.currentGroups.name + " " + $translate.instant('USERACCOUNT.GROUP.DETAILS.MODAL.DELETE.P2'),
                        text: "",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: $translate.instant('APP.COMMON.MODAL.CONFIRM'),
                        cancelButtonText: $translate.instant('APP.COMMON.MODAL.CANCEL'),
                        closeOnConfirm: true,
                        closeOnCancel: true
                    },
                    function (isConfirm) {
                        if (isConfirm) {
                            $scope.deleteGroup();
                        } else {
                            SweetAlert.swal("", "error");
                        }
                    }
                )
            };
        }]);

