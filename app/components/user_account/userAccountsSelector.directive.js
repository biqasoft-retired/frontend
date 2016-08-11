/**
 * Created Nikita Bakaev, ya@nbakaev.ru on 2/25/2016.
 * All Rights Reserved
 */
angular.module('app.directivesmy')
    .directive('userAccountsSelector', function () {
        return {
            restrict: 'EA',
            require: '^ngModel',
            scope: {
                ngModel: '=',
                accountOptions: '=?',
                ngChange: "&"
            },
            templateUrl: 'templates/user_accounts_selector.html',
            controller: ['$scope', '$rootScope', 'timeService', 'UserService', 'commonService', '$timeout', 'logger',
                function ($scope, $rootScope, timeService, UserService, commonService, $timeout, logger) {
                    $scope.allContacts = [];
                    $scope.contacts = [];
                    $scope.filterSelected = true;

                    $scope.showAllUsers = false;

                    $scope.userAccountsFilter = {};
                    $scope.userAccountsFilter.filter = "";

                    if (isUndefinedOrNull($scope.accountOptions)) {
                        $scope.accountOptions = {};
                        $scope.accountOptions.addCurrentUser = true;
                        $scope.accountOptions.editMode = true;
                    }

                    /**
                     * Search for contacts.
                     */
                    $scope.querySearch = function (query) {
                        var results = query ?
                            $scope.allContacts.filter($scope.createFilterFor(query)) : [];
                        return results;
                    };
                    /**
                     * Create filter function for a query string
                     */
                    $scope.createFilterFor = function (query) {
                        var lowercaseQuery = angular.lowercase(query);
                        return function filterFn(contact) {
                            return (contact._lowername.indexOf(lowercaseQuery) != -1);
                            ;
                        };
                    };

                    $scope.prepareContact = function (cont) {
                        var obj = cont;
                        obj.name = commonService.printUser(cont);
                        obj.image = commonService.getAvatarUrlByUser(cont);

                        if (typeof obj.name === 'undefined') {
                            obj.name = obj.username;
                        }

                        obj._lowername = obj.name.toLowerCase();
                        return obj;
                    };

                    function addContactsFromModelInit() {
                        $scope.ngModel.forEach(function (data) {
                                if (!data || isUndefinedOrNull(data)) return;
                                $scope.contacts.push(
                                    $scope.allContacts.filter(function (er) {
                                        if (er.id === data) {
                                            return true;
                                        }
                                    })[0]
                                )
                            }
                        )
                    }

                    $scope.continueLoad = function (data) {
                        $scope.allContacts = data.map(function (cont) {
                            return $scope.prepareContact(cont);
                        });

                        if (typeof $scope.ngModel === 'undefined') {
                            $timeout(function () {
                                $scope.continueLoad(data);
                            }, 1000);
                            return;
                        }

                        // if we have users in `ng-model` - add current user
                        if ($scope.ngModel.length === 0) {
                            if (!$scope.accountOptions.addCurrentUser) {
                                $scope.contacts = [];
                                return;
                            }

                            if (!$rootScope.currentUser || !$rootScope.currentUser.id) {
                                UserService.getCurrentUser().then(function (myaccount) {
                                    $scope.contacts = [$scope.prepareContact(myaccount)];
                                });
                            } else {
                                $scope.contacts = [$scope.prepareContact($rootScope.currentUser)];
                            }
                        } else {
                            addContactsFromModelInit();
                        }
                    };

                    $scope.loadContacts = function () {
                        if ($rootScope.allUserAccounts.length === 0) {
                            UserService.getAllUsers().then(function (data) {
                                $scope.continueLoad(data);
                            });
                        } else {
                            $scope.continueLoad($rootScope.allUserAccounts);
                        }
                    };
                    $scope.loadContacts();

                    $scope.$watch('contacts', function () {

                        var prepared = $scope.contacts.filter(function (data) {
                            if (data && data.id) return true;
                        });

                        $scope.ngModel = prepared.map(function (data) {
                            return data.id;
                        });
                    }, true);
                }]
        }
    })