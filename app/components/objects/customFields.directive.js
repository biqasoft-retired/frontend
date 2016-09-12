/**
 * Created Nikita Bakaev, ya@nbakaev.ru on 2/25/2016.
 * All Rights Reserved
 */
angular.module('app.directivesmy')

    .directive('customFieldsSelector', function () {
        return {
            restrict: 'EA',
            require: '^ngModel',
            scope: {
                ngModel: '=',
                ngChange: "&"
            },
            templateUrl: 'templates/custom_fields/custom_fields.html',
            controller: ['$scope', '$rootScope', '$http', 'timeService', '$timeout', 'SystemService',
                function ($scope, $rootScope, $http, timeService, $timeout, SystemService) {

                    $scope.currentCompany = {};
                    $scope.currentCompany.customFields = [];

                    $scope.customFieldTypes = SystemService.customFieldTypes;
                    $scope.customFieldStringStyles = SystemService.customFieldStringStyles;
                    $scope.customFieldDateStyles = SystemService.customFieldDateStyles;
                    $scope.debugMode = $rootScope.debugMode;

                    // this need to work if we change object (in controller -> this will change object reference)
                    $scope.$watch('ngModel', function () {
                        $scope.currentCompany.customFields = $scope.ngModel;
                        $scope.ngChange();
                    });

                    // Angular map
                    //
                    // angular.extend($scope, {
                    //     map: {
                    //         center: {
                    //             latitude: 42.3349940452867,
                    //             longitude: -71.0353168884369
                    //         },
                    //         zoom: 11,
                    //         markers: [],
                    //         events: {
                    //             click: function (map, eventName, originalEventArgs) {
                    //                 var e = originalEventArgs[0];
                    //                 var lat = e.latLng.lat(), lon = e.latLng.lng();
                    //                 var marker = {
                    //                     id: Date.now(),
                    //                     coords: {
                    //                         latitude: lat,
                    //                         longitude: lon
                    //                     }
                    //                 };
                    //                 $scope.map.markers.push(marker);
                    //                 console.log($scope.map.markers);
                    //                 $scope.$apply();
                    //             }
                    //         }
                    //     }
                    // });

                    //
                    $scope.checkModel = function () {
                        console.warn("Try custom field", $scope.ngModel);

                        if (typeof $scope.ngModel === 'undefined' || !$scope.ngModel) {
                            $timeout($scope.checkModel, 1000);
                            return;
                        }

                        $scope.currentCompany.customFields = $scope.ngModel;
                    };
                    $scope.checkModel();

                    $scope.addNewAdditionalField = function () {
                        var a = {};
                        a.name = "Новое поле";

                        //a.id = new ObjectId().toString();
                        a.type = "STRING";
                        a.style = "STRING_AUTO";
                        a.value = {};
                        a.value.stringVal = "Значение по умолчанию";
                        $scope.currentCompany.customFields.push(a);
                    };

                    $scope.deleteCustomField = function (index) {
                        $scope.currentCompany.customFields.splice(index, 1);
                        console.log("Deleted custom field index", index);
                    };

                    $scope.deleteAdditionalFieldDictionary = function (index, object) {
                        object.value.dictVal.values.splice(index, 1);
                        console.log("Delete additional field by index: " + index );
                    };

                    $scope.addAdditionalFieldDictionary = function (object) {
                        if (!object.value.dictVal) object.value.dictVal = {};
                        if (!object.value.dictVal.values) object.value.dictVal.values = [];

                        var def = {};
                        def.id = new ObjectId().toString();
                        def.name = 'новое значение';

                        object.value.dictVal.values.push(def);
                    };

                    $scope.changedCustomFieldType = function (field) {
                        if (field.type === 'DICTIONARY') {
                            // check that this is new field
                            // and if so - create default value
                            if (field.value && field.value.dictVal && field.value.dictVal.values.length > 0) return;
                            if (!field.value.dictVal) field.value.dictVal = {};
                            if (!field.value.dictVal.values) field.value.dictVal.values = [];

                            var def = {};
                            def.name = "по умолчанию";
                            def.id = new ObjectId().toString();

                            field.value.dictVal.value = def;
                            field.value.dictVal.values.push(def);
                        }
                    };

                    var originatorEv;
                    $scope.openMenu = function ($mdOpenMenu, ev) {
                        originatorEv = ev;
                        $mdOpenMenu(ev);
                    };

                }]
        }
    })

    .directive('customFieldsShower', function () {
        return {
            restrict: 'EA',
            require: '^ngModel',
            scope: {
                ngModel: '=',
                ngChange: "&",
                showDeleteButton: "=",
                showNoCustomFields: "=",
                fieldsOption: "=",
                fieldsNameFilter: "=?"
            },
            templateUrl: 'templates/custom_fields/custom_fields_shower.html',
            controller: ['$scope', '$rootScope', '$http', 'timeService', '$timeout', 'SystemService',
                function ($scope, $rootScope, $http, timeService, $timeout, SystemService) {

                    $scope.currentCompany = {};
                    $scope.currentCompany.customFields = [];

                    $scope.showDeleteButtonSc = false;

                    //
                    $scope.defaultOptions = {};
                    $scope.defaultOptions.editableFields = true;
                    $scope.printEmptyField = $rootScope.printEmptyField;
                    $scope.debugMode = $rootScope.debugMode;
                    //

                    if (typeof $scope.showDeleteButton === 'boolean' && $scope.showDeleteButton) {
                        $scope.showDeleteButtonSc = true;
                    }

                    if (typeof $scope.showNoCustomFields === 'boolean' && $scope.showNoCustomFields) {
                        $scope.showNoCustomFieldsSc = true;
                    }

                    $scope.customFieldTypes = SystemService.customFieldTypes;
                    $scope.printDate = $rootScope.printDate;

                    $scope.filteredHidden = function (data) {
                        //console.warn(data);
                        if ($rootScope.debugMode) return true;

                        if (data.hidden) return false;

                        return true;
                    };

                    // this need to work if we change object (in controller -> this will change object reference)
                    $scope.$watch('ngModel', function () {
                        if (!isUndefinedOrNullOrEmpty($scope.ngModel)){
                            $scope.currentCompany.customFields = $scope.ngModel;
                            $scope.ngChange();
                        }
                    });

                    $scope.$watch('fieldsOption', function () {
                        if (!isUndefinedOrNull($scope.fieldsOption)) {
                            $scope.defaultOptions = $scope.fieldsOption;
                        }
                    }, true);

                    //
                    $scope.checkModel = function () {
                        console.warn($scope.ngModel);

                        if (typeof $scope.ngModel === 'undefined' || !$scope.ngModel) {
                            $timeout($scope.checkModel, 1000);
                            return;
                        }

                        $scope.currentCompany.customFields = $scope.ngModel;
                    };
                    $scope.checkModel();

                    ///////////////////////
                    $scope.checkFieldsOption = function () {
                        console.warn($scope.fieldsOption);

                        if (typeof $scope.fieldsOption === 'undefined' || !$scope.fieldsOption) {
                            //$timeout($scope.checkFieldsOption, 1000);
                            return;
                        }

                        $scope.defaultOptions = $scope.fieldsOption;
                    };
                    $scope.checkFieldsOption();

                    $scope.defaultOptions.newAdditionalFileInList = "";

                    $scope.deleteAdditionalField = function (index) {
                        console.log("Delete additional field by index: " + index);
                        $scope.currentCompany.customFields.splice(index, 1);
                    };

                    $scope.addNewStringToList = function (addFiels) {
                        console.warn($scope.newAdditionalFileInList);
                        if (!addFiels.value || !addFiels.value.stringList) {
                            addFiels.value.stringList = [];
                        }

                        addFiels.value.stringList.push($scope.defaultOptions.newAdditionalFileInList);
                        $scope.defaultOptions.newAdditionalFileInList = "";
                        console.log(addFiels);

                    };

                    $scope.deleteAdditionalStringInStrings = function (index, addFiels) {
                        addFiels.value.stringList.splice(index, 1);
                    };

                }]
        }
    })
