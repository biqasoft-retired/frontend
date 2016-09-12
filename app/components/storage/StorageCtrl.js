'use strict';

angular.module('app.documents.all', ['ngRoute', 'LocalStorageModule'])

    .controller('DocumentsAllCtrl', ['$scope', '$rootScope', 'storageService', '$upload', '$timeout', '$location', 'tokenService', '$mdDialog', 'SweetAlert', 'logger',
        'configurationService',
        function ($scope, $rootScope, documentsService, $upload, $timeout, $location, tokenService, $mdDialog, SweetAlert, logger, configurationService) {
            $scope.defaultFolderPath = '/';
            $scope.contentProviderService = 'DEFAULT';
            $scope.contentProviderToken = {};
            $scope.directLinks = [];
            $scope.projects = [];

            $scope.folderTree = [];

            $scope.dragClass = false;
            $scope.newFolderName = "";

            $scope.editableObject = {};

            $scope.upload = [];
            $scope.uploadRightAway = true;
            $scope.progress = [];

            $scope.alltDynamicSegments = [];
            $scope.activeDynamicSegmentID = "";

            // does we upload all files
            // store to hide upload UI progress
            $scope.uploadedAll = false;

            if (!isUndefinedOrNullOrEmpty($location.search().folderPath)) $scope.defaultFolderPath = $location.search().folderPath;
            if (!isUndefinedOrNullOrEmpty($location.search().contentProviderService)) $scope.contentProviderService = $location.search().contentProviderService;

            $scope.checkContentProvider = function (contentProviderToken) {

                var token = contentProviderToken;

                if ($scope.contentProviderService === 'DROPBOX') {
                    if (typeof token != 'undefined') {
                        $scope.defaultFolderPath = {};
                        $scope.defaultFolderPath.fullName = '/';
                    }

                    $scope.contentProviderToken.id = token;
                }

                if ($scope.contentProviderService === 'WEBDAV') {
                    if (typeof token != 'undefined')   $scope.contentProviderToken.id = token;
                }

                if ($scope.contentProviderService === 'GOOGLE_DRIVE') {
                    if (typeof token != 'undefined') {
                        $scope.defaultFolderPath = 'root';
                        $scope.contentProviderToken.id = token;
                    }
                }

                if ($scope.contentProviderService === 'DEFAULT') {
                    $scope.defaultFolderPath = {};
                    $scope.defaultFolderPath.id = 'ROOT';
                    $scope.defaultFolderPath.name = '/';
                    $scope.contentProviderToken.id = "DEFAULT";
                }

                if ($scope.contentProviderService === 'S3_COMPATIBLE') {
                    $scope.defaultFolderPath = {};
                    $scope.defaultFolderPath.id = 'ROOT';
                    $scope.defaultFolderPath.name = '/';
                    $scope.contentProviderToken.id = token;
                }
            };

            $scope.checkContentProvider($location.search().contentProviderToken);
            ///////////////////////////////////////////////////////////////

            $scope.changeFolder = function (folderPathObject) {
                $scope.folderPath = folderPathObject.fullName || folderPathObject;

                switch ($scope.contentProviderService) {

                    case 'DEFAULT':

                        $scope.activeDynamicSegmentID = "DEFAULT";

                        // that's not folder tree
                        // just show unic folders...
                        var a = $scope.folderTree.filter(function (data) {
                            if (data.id === folderPathObject.id) return true;
                        });

                        if (a.length === 0) {
                            $scope.folderTree.push(folderPathObject);
                        }

                        ///////////////////////////////////////////////////////////////

                        $scope.folderPath = folderPathObject.id;
                        tokenService.getDefaultDirectoryListing($scope.contentProviderToken.id, $scope.folderPath).then(function (e) {
                            $scope.projects = e;
                        });
                        break;

                    case 'S3_COMPATIBLE':

                        $scope.activeDynamicSegmentID = "S3_COMPATIBLE";

                        // that's not folder tree
                        // just show unic folders...
                        var a = $scope.folderTree.filter(function (data) {
                            if (data.id === folderPathObject.id) return true;
                        });

                        if (a.length === 0) {
                            $scope.folderTree.push(folderPathObject);
                        }

                        ///////////////////////////////////////////////////////////////

                        $scope.folderPath = folderPathObject.id;
                        tokenService.getDefaultDirectoryListing($scope.contentProviderToken.id, $scope.folderPath).then(function (e) {
                            $scope.projects = e;
                        });
                        break;

                    case 'DROPBOX':
                        $scope.folderTree = $scope.folderPath.split("/").map(function (data) {
                            return "/" + data
                        });

                        tokenService.getDefaultDirectoryListing($scope.contentProviderToken.id, $scope.folderPath).then(function (e) {
                            $scope.projects = e;
                        });
                        break;

                    case 'WEBDAV':
                        $scope.folderTree = $scope.folderPath.split("/").map(function (data) {
                            return "/" + data
                        });
                        tokenService.getDefaultDirectoryListing($scope.contentProviderToken.id, $scope.folderPath).then(function (e) {
                            $scope.projects = e;
                        });
                        break;

                    case 'GOOGLE_DRIVE':
                        $scope.folderPath = folderPathObject.id || folderPathObject;

                        tokenService.getDefaultDirectoryListing($scope.contentProviderToken.id, $scope.folderPath).then(function (e) {
                            $scope.projects = e;
                        });
                        break;
                }
                //$location.search('folderPath', folderPath ).replace().reload(false);
            };

            $scope.changeFolder($scope.defaultFolderPath);

            $scope.createNewFolder = function (name) {
                var data = {};
                data.name = name;
                data.folder = true;
                data.parentId = $scope.folderPath;
                data.uploadStoreType = $scope.contentProviderService;
                data.uploadStoreID = $scope.contentProviderToken.id;

                documentsService.sendMetaInformation(data).then(function (data) {
                    $scope.projects.push(data);
                    $scope.newFolderName = "";

                    $mdDialog.hide();
                });
            };

            $scope.createNewFolderDialog = function (ev) {
                $mdDialog.show({
                    scope: $scope,
                    preserveScope: true,
                    templateUrl: 'app/components/storage/new_folder_window.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true
                })
                    .then(function (answer) {

                    }, function () {
                        $scope.status = 'You cancelled the dialog.';
                    });
            };

            $scope.deleteDocumentFile = function (data) {
                return documentsService.deleteFile(data).then(function (resp) {
                    logger.logSuccess("Удалено");
                });
            };

            $scope.deleteDocumentFileConfirmation = function (obj) {
                $scope.editableObject = obj;

                SweetAlert.swal({
                        title: "Удалить файл/папку?",
                        text: "Это действие удалит объект безвозвратно",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Да",
                        cancelButtonText: "Отмена",
                        closeOnConfirm: true,
                        closeOnCancel: true
                    },
                    function (isConfirm) {
                        if (isConfirm) {
                            $scope.deleteDocumentFile($scope.editableObject).then(function (dat) {
                                $scope.changeFolder($scope.defaultFolderPath);
                            });
                            $mdDialog.hide();

                        } else {
                            SweetAlert.swal("Отмена", "error");
                        }
                    }
                );
            };

            $scope.chooseEditableObject = function (obj, ev) {
                $scope.editableObject = obj;

                $mdDialog.show({
                    scope: $scope,
                    preserveScope: true,
                    templateUrl: 'app/components/storage/document_file_settings.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true
                })
                    .then(function (answer) {
                    }, function () {
                        $scope.status = 'You cancelled the dialog.';
                    });
            };

            $scope.saveChangesOnCurrentObject = function () {
                documentsService.updateDocuments($scope.editableObject).then(function (data) {
                    $mdDialog.hide();
                });
            };

            $scope.downloadFile = function (documentFile) {
                switch ($scope.contentProviderService) {

                    // this is just optimisation - get direct link from server and download via <a href>
                    case 'DEFAULT':
                        documentsService.downloadFile(documentFile.id);
                        break;

                    // download as Blob (byte array)
                    default:
                        documentsService.downloadFileEveyType(documentFile);
                        break;
                }
            };

            /**
             * Prepare request file to server for uploading new file
             * @returns {{}}
             */
            $scope.getNewDocumentMetaModelRequest = function () {
                var data = {};
                data.uploadStoreType = $scope.contentProviderService;
                data.parentId = $scope.folderPath;
                if (data.uploadStoreType === "DEFAULT")  data.uploadStoreType = "DEFAULT";

                if (data.uploadStoreType === "DROPBOX") {
                    if ($scope.folderPath != "") data.parentId = $scope.folderPath;
                }

                if (data.uploadStoreType === "GOOGLE_DRIVE") {
                    if ($scope.folderPath != "") data.parentId = $scope.folderPath;
                }

                if (data.uploadStoreType === "WEBDAV") {
                    if ($scope.folderPath != "") data.parentId = $scope.folderPath;
                }

                data.uploadStoreID = $scope.contentProviderToken.id;
                data.file = true;

                return data;
            };

            documentsService.getAllProviders({}).then(function (data) {
                $scope.alltDynamicSegments = data;
                $scope.alltDynamicSegments.unshift({id: "DEFAULT", name: "Хранилище", type: "DEFAULT"});
            });

            $scope.getByDynamicSegment = function (data) {
                $scope.contentProviderService = data.type;
                $scope.checkContentProvider(data.id);
                $scope.changeFolder($scope.defaultFolderPath);
                $scope.activeDynamicSegmentID = data.id;
            };

            $scope.getDirectLink = function (id) {
                documentsService.getDocumentURLById(id).then(function (c) {
                    console.log("download link", c.data);
                    $scope.directLinks[id] = c.data;
                });
            };

            $scope.newDocumentMetaInfo = $scope.getNewDocumentMetaModelRequest();

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
                $scope.uploadedAll = false;

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

            $scope.start = function (index) {
                $scope.progress[index] = 0;
                $scope.errorMsg = null;
                if ($scope.howToSend === 1) {
                    fileReader.readAsArrayBuffer($scope.selectedFiles[index]);
                } else {
                    documentsService.sendMetaInformation($scope.getNewDocumentMetaModelRequest()).then(function (addedBuilding) {
                        console.log("id", addedBuilding.id, $scope.selectedFiles[index].name);

                        $scope.upload[index] = $upload.upload({
                            url: configurationService.returnAPIhost() + "/v1/storage/upload/send_with_pre_id/" + addedBuilding.id,
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

                                if ($scope.uploadResult.length === $scope.progress.length) {
                                    $scope.uploadedAll = true;
                                }

                                $scope.projects.push(response.data);

                            });
                        }, function (response) {

                            if (response.status > 0) $scope.errorMsg = response.status + ': ' + response.data;
                        }, function (evt) {
                            // Math.min is to fix IE which reports 200% sometimes
                            $scope.progress[index] = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                        });

                    })
                }
            };

            $scope.isOverlayed = function () {
                var a = $(".overlayedAll");
                if (a && a.length > 0) return true;
                return false;
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

                if (hasFile) {
                    $scope.dragClass = true;
                }

                return hasFile ? "overlayedAll" : "dragover-err";
            };

        }]);
