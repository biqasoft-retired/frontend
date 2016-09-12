angular.module('app.hotkeys', [])

/**
 * bind hotkeys to change page
 */
    .service('globalHotkeys', ['$location', 'logger', '$rootScope', 'hotkeys', '$mdDialog', 'customerService', 'companyService', '$translate',
        function ($location, logger, $rootScope, hotkeys, $mdDialog, customerService, companyService, $translate) {

            var self = this;

            hotkeys.add({
                combo: 'shit+L',
                description: '',
                callback: function () {
                    $rootScope.addNewTempCustomer({lead: true});
                }
            });

            hotkeys.add({
                combo: 'shit+C',
                description: '',
                callback: function () {
                    $rootScope.addNewTempCustomer({customer: true});
                }
            });

            hotkeys.add({
                combo: 'shit+T',
                description: '',
                callback: function () {
                    $rootScope.showNewTaskFoo();
                }
            });

            hotkeys.add({
                combo: 'shit+D',
                description: '',
                callback: function () {
                    $location.path('/dashboard');
                }
            });

            hotkeys.add({
                combo: 'shit+E',
                description: '',
                callback: function () {
                    $location.path('/storage');
                }
            });

            $rootScope.showHistoryDialog = function () {
                $mdDialog.show({
                    controller: 'HistoryLocationCtrl',
                    preserveScope: false,
                    templateUrl: 'templates/modal/history.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: true
                }).then(function () {
                }, function () {
                });
            };

            $rootScope.showNewTaskFoo = function (ev) {
                $mdDialog.show({
                    controller: 'TaskNewCtrl',
                    templateUrl: 'app/components/task/modal/add_new_task.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true
                }).then(function () {
                }, function () {
                });
            };

            $rootScope.addNewTempCustomer = function (params) {
                var newCustomer = {};

                if (params) newCustomer = params;

                customerService.addCustomer(newCustomer).then(function (addedBuilding) {
                    logger.logSuccess($translate.instant('CUSTOMER.ADD.SUCCESSFULLY.TOAST'));
                    $location.path('/customer/details/' + addedBuilding.id);
                }, function () {
                    logger.logError($translate.instant('APP.COMMON.ERROR.ADD.TOAST'));
                });
            };

            $rootScope.addNewTempCompany = function (params) {
                var newCustomer = {};

                if (params) newCustomer = params;

                companyService.addCompany(newCustomer).then(function (addedBuilding) {
                    logger.logSuccess($translate.instant('COMPANY.ADD.SUCCESSFULLY.TOAST'));
                    $location.path('/company/details/' + addedBuilding.id);
                }, function () {
                    logger.logError($translate.instant('APP.COMMON.ERROR.ADD.TOAST'));
                });
            };

            hotkeys.add({
                combo: 'alt',
                description: '',
                callback: function () {
                    $rootScope.showHistoryDialog();
                }
            });

        }]);