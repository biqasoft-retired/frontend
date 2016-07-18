/**
 * Created Nikita Bakaev, ya@nbakaev.ru on 2/25/2016.
 * All Rights Reserved
 */
angular.module('app.directivesmy')
    .directive('uploadFileBiqa', function () {
        return {
            restrict: 'EA',
            require: '^ngModel',
            scope: {
                // this is array of documentFilesIds
                // which is saved in backend db
                // for example ["56ccd5d493091f2fa007388d", "56ccd5d493091f2fa007388m"]
                ngModel: '=',

                // this is array of documentFilesObjects in json
                // for example [{name:"file.doc" id "56ccd5d493091f2fa007388d"}, {}, {}]
                // normally filesUploadedObjectsArray should contain objects with ids in ngModel
                filesUploadedObjectsArray: '=',

                // this is just simple angular filter for string
                // we just want to give our scope directive this string
                documentsNameFilter: '=',
                uploadFileName: '=',
                showUploadBox: '=?',
                ngChange: "&",
                uploadedAllCallback: "&",
                beforeUploadMetaInfoInterceptor: "="
            },
            templateUrl: 'templates/document_file/upload_file_biqa.html',
            controller: ['$scope', '$rootScope', '$http', 'timeService', '$timeout', 'SystemService', '$upload', 'storageService', 'configurationService', 'logger', '$translate',
                function ($scope, $rootScope, $http, timeService, $timeout, SystemService, $upload, documentsService, configurationService, logger, $translate) {

                    $scope.filesUploadedObjectsArray = [];

                    if (isUndefinedOrNull($scope.showUploadBox)) {
                        $scope.showUploadBox = true;
                    }

                    $scope.objectsIdstoObjects = function () {
                        var builder = {};
                        builder.useObjectIds = true;
                        builder.objectIds = $scope.ngModel;
                        documentsService.filter(builder).then(function (data) {
                            $scope.filesUploadedObjectsArray = data.resultedObjects;
                        })
                    };

                    // this need to work if we change object (in controller -> this will change object reference)
                    $scope.$watch('ngModel', function () {
                        $scope.ngChange();
                        if ($scope.ngModel && $scope.ngModel.length && $scope.ngModel.length > 0) {
                            $scope.objectsIdstoObjects();
                        }
                    });

                    $scope.downloadFileDir = function (data) {
                        documentsService.downloadFileEveyType(data);
                    };

                    $scope.listenAudioDownloadedAdd = $rootScope.listenAudioDownloadedAdd;
                    $scope.printDate = $rootScope.printDate;

                    // UPLOADING FILES
                    $scope.getNewDocumentMetaModelRequest = function () {
                        var data = {};

                        if ($scope.beforeUploadMetaInfoInterceptor != null && typeof $scope.beforeUploadMetaInfoInterceptor === "function") {
                            data = $scope.beforeUploadMetaInfoInterceptor();
                        }

                        if (typeof data === "undefined") {
                            data = {};
                        }

                        return data;
                    };

                    $scope.upload = [];
                    $scope.uploadRightAway = true;

                    // does we upload all files
                    // store to hide upload UI progress
                    $scope.uploadedAll = false;

                    $scope.hasUploader = function (index) {
                        return $scope.upload[index] != null;
                    };
                    $scope.abort = function (index) {
                        $scope.upload[index].abort();
                        $scope.upload[index] = null;
                    };

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
                        $scope.newDocumentMetaInfo = $scope.getNewDocumentMetaModelRequest();

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

                    $scope.start = function (index) {
                        $scope.progress[index] = 0;
                        $scope.errorMsg = null;
                        if ($scope.howToSend === 1) {

                            fileReader.readAsArrayBuffer($scope.selectedFiles[index]);
                        } else {
                            documentsService.sendMetaInformation($scope.getNewDocumentMetaModelRequest()).then(function (addedBuilding) {

                                $scope.upload[index] = $upload.upload({
                                    url: configurationService.returnAPIhost() + "/storage/upload/send_with_pre_id/" + addedBuilding.id,
                                    method: 'POST',
                                    data: {
                                        "Content-Type": $scope.selectedFiles[index].type === null || $scope.selectedFiles[index].type === '' ?
                                            'application/octet-stream' : $scope.selectedFiles[index].type,
                                        filename: $scope.selectedFiles[index].name
                                    },
                                    file: $scope.selectedFiles[index]
                                });
                                $scope.upload[index].then(function (response) {
                                    $timeout(function () {
                                        $scope.uploadResult.push(response.data);

                                        if (isUndefinedOrNull($scope.ngModel)) {
                                            $scope.ngModel = [];
                                        }

                                        $scope.ngModel.push(response.data.id);
                                        $scope.filesUploadedObjectsArray.push(response.data);

                                        if ($scope.uploadResult.length === $scope.progress.length) {
                                            $scope.uploadedAll = true;
                                            logger.logSuccess($translate.instant('STORAGE.UPLOAD.APP_FILES_ARE_SUCCESSFULLY_UPLOADED.TOAST'));
                                            if ($scope.uploadedAllCallback && typeof $scope.uploadedAllCallback === 'function') {
                                                $scope.uploadedAllCallback();
                                            }
                                        }
                                    });
                                }, function (response) {

                                    if (response.status > 0) $scope.errorMsg = response.status + ': ' + response.data;
                                }, function (evt) {
                                    // Math.min is to fix IE which reports 200% sometimes
                                    $scope.progress[index] = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                                });
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
                                    break;
                                }
                            }
                        } else {
                            hasFile = true;
                        }
                        return hasFile ? "dragover" : "dragover-err";
                    };
                }]
        }
    })
