'use strict';

angular.module('app.customer.new')
    .controller('CustomerMassExcelCtrl', ['$scope', 'configurationService', '$timeout', '$upload', 'logger', 'customerService', '$location',
        function ($scope, configurationService, $timeout, $upload, logger, customerService, $location) {

            // UPLOAD AND PARSE EXCEL
            $scope.step = 1;

            $scope.uploadCustomersFromJsonToServer = function () {
                customerService.addCustomerList($scope.uploadResult[0]).then(function (data) {
                    $location.path('/customer/mass/excel');
                    logger.logSuccess("Успешно загружен");
                });
            };

            // UPLOADING FILES
            $scope.upload = [];
            $scope.uploadRightAway = true;
            $scope.uploadResult = [];

            $scope.hasUploader = function (index) {
                return $scope.upload[index] != null;
            };
            $scope.abort = function (index) {
                $scope.upload[index].abort();
                $scope.upload[index] = null;
            };
            $scope.angularVersion = window.location.hash.length > 1 ? (window.location.hash.indexOf('/') === 1 ?
                window.location.hash.substring(2) : window.location.hash.substring(1)) : '1.2.20';

            $scope.onFileSelect = function ($files) {
                $scope.selectedFiles = [];
                $scope.progress = [];
                if ($scope.upload && $scope.upload.length > 0) {
                    for (var i = 0; i < $scope.upload.length; i++) {
                        if ($scope.upload[i] != null) {
                            $scope.upload[i].abort();
                        }
                    }
                }

                $scope.upload = [];

                $scope.uploadResult = [];
                $scope.selectedFiles = $files;
                $scope.dataUrls = [];
                for (var i = 0; i < $files.length; i++) {
                    var $file = $files[i];
                    if ($scope.fileReaderSupported && $file.type.indexOf('image') > -1) {
                        var fileReader = new FileReader();
                        fileReader.readAsDataURL($files[i]);
                        var loadFile = function (fileReader, index) {
                            fileReader.onload = function (e) {
                                $timeout(function () {
                                    $scope.dataUrls[index] = e.target.result;
                                });
                            }
                        }(fileReader, i);
                    }

                    $scope.progress[i] = -1;
                    if ($scope.uploadRightAway) {
                        $scope.start(i);
                    }
                }
            };

            console.log("REI" + $scope.uploadResult);

            $scope.start = function (index) {
                $scope.progress[index] = 0;
                $scope.errorMsg = null;
                if ($scope.howToSend === 1) {

                    fileReader.readAsArrayBuffer($scope.selectedFiles[index]);
                } else {
                    //s3 upload
                    $scope.upload[index] = $upload.upload({
                        url: configurationService.returnAPIhost() + "/customer/parse_excel_to_json", //upload.php script, node.js route, or servlet url
                        method: 'POST',
                        data: {
                            "Content-Type": $scope.selectedFiles[index].type === null || $scope.selectedFiles[index].type === '' ?
                                'application/octet-stream' : $scope.selectedFiles[index].type,
                            filename: $scope.selectedFiles[index].name
                        },
                        file: $scope.selectedFiles[index],
                    });
                    $scope.upload[index].then(function (response) {
                        $timeout(function () {
                            $scope.uploadResult.push(response.data);
                            $scope.step++;
                        });
                    }, function (response) {

                        console.log(123);

                        if (response.status > 0) $scope.errorMsg = response.status + ': ' + response.data;
                    }, function (evt) {
                        // Math.min is to fix IE which reports 200% sometimes
                        $scope.progress[index] = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                    });
                }
            };

            $scope.dragOverClass = function ($event) {
                var items = $event.dataTransfer.items;
                var hasFile = false;
                if (items != null) {
                    for (var i = 0; i < items.length; i++) {
                        if (items[i].kind === 'file') {
                            hasFile = true;
                            $location
                            break;
                        }
                    }
                } else {
                    hasFile = true;
                }

                return hasFile ? "dragover" : "dragover-err";
            };
            $scope.acl = $scope.acl || 'private';
        }]);