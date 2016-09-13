'use strict';

angular.module('app.custom.objects.data')
    .controller('CustomObjectsDataDetailsCtrl', ['$scope', '$rootScope', '$route', 'logger', 'companyService', 'SystemService', 'UserService', 'customObjectsDataService',
        '$window', 'SweetAlert', '$location', 'customObjectsService', '$filter',
      function($scope, $rootScope, $route, logger, companyService, SystemService, UserService, customObjectsDataService, $window, SweetAlert, $location, customObjectsService, $filter) {

          $scope.objectHistoryResultHolder = [];

          $scope.currentCompany = {};
          $scope.$window = $window;
          var self = this;

          $scope.defaultOptions = {};
          $scope.defaultOptions.editableFields = false;

          $scope.allExportFormats = [];

          $scope.allExportFormats.push({
             mimeType: "application/pdf",
              name: "PDF",
              extension:".pdf"
          });

          $scope.allExportFormats.push({
              mimeType: "text/html;charset=UTF-8",
              name: "HTML",
              extension:".html"
          });

          $scope.allExportFormats.push({
              mimeType: "text/html;charset=UTF-8",
              name: "Print document",
              extension:".html",
              options:{print: true}
          });

          $scope.allExportFormats.push({
              mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              name: "MS Word",
              extension:".docx"
          });

          $scope.allExportFormats.push({
              mimeType: "image/png",
              name: "PNG",
              extension:".png"
          });

          $scope.allExportFormats.push({
              mimeType: "image/jpeg",
              name: "JPG",
              extension:".jpg"
          });

          self.definerUnsafe = function(param) {
              var beforeTimes = 0;
              if (param && param.beforeTimes) beforeTimes = param.beforeTimes;
              return $rootScope.defineUnsavedData($scope, 'currentCompany', {
                  autoSaveFunction: function() {
                  },
                  timesBefore: beforeTimes
              });
          };

          var obj = {};
          obj.id = $route.current.params.id;
          obj.collectionId = $route.current.params.collectionId;

          $scope.customObjectMeta = {};

          customObjectsDataService.getCustomObjectsDataById(obj).then(function(e) {
              $scope.currentCompany = e;
              self.definerUnsafe();
              $rootScope.title = e.name || '';

              customObjectsService.getCustomObjectsMetaById(e.collectionId).then(function(data2) {
                  $scope.customObjectMeta = data2;
              });
          });

          $scope.downloadByView = function (view) {

              (function () {
                var _view = view;
                  var builder = {};
                  builder.viewId = view.id;
                  builder.customObjectsDataBuilder = {};
                  builder.customObjectsDataBuilder.collectionId = $scope.currentCompany.collectionId;
                  builder.customObjectsDataBuilder.useObjectIds = true;
                  builder.customObjectsDataBuilder.objectIds = [$scope.currentCompany.id];

                  customObjectsDataService.getPrintableBuilder(builder).then(function (data) {
                      var today = $rootScope.printDate(new Date());
                      $rootScope.downloadFile({
                          file: data,
                          type:_view.mimeType,
                          filename: $scope.currentCompany.name + ' от ' + today + ' объект biqa' + ' ' + _view.name + ' ' + (_view.extension || '.html')
                      })
                  });
              })()

          };

          $scope.downloadByRequestedMimeType = function (view, exportFormatObject) {

              (function () {
                  var _view = view;
                  var _exportFormatObject = exportFormatObject;
                  var builder = {};
                  builder.viewId = view.id;
                  builder.customObjectsDataBuilder = {};
                  builder.customObjectsDataBuilder.collectionId = $scope.currentCompany.collectionId;
                  builder.customObjectsDataBuilder.useObjectIds = true;
                  builder.customObjectsDataBuilder.objectIds = [$scope.currentCompany.id];

                  builder.requestedMimeType = _exportFormatObject.mimeType;
                  builder.requestedExtension = _exportFormatObject.extension;

                  customObjectsDataService.getPrintableBuilder(builder).then(function (data) {

                      // user requested printing document
                      if (_exportFormatObject.options && _exportFormatObject.options.print) {

                          // PDF.js ????
                          // var byteArray = new Uint8Array(data);
                          // PDFJS.getDocument(byteArray).then(function (pdfDocument) {
                          //     console.log('Number of pages: ' + pdfDocument.numPages);
                          // });

                          var iframe = document.createElement('iframe');
                          document.body.appendChild(iframe);

                          iframe.style.display = 'none';
                          iframe.onload = function () {
                              setTimeout(function () {
                                  iframe.focus();
                                  iframe.contentWindow.print();
                              }, 1);
                          };
                          
                          var byteArray = new Uint8Array(data);
                          var url = window.URL.createObjectURL(new Blob([byteArray], {type: _exportFormatObject.mimeType}));

                          iframe.src = url;
                          return;
                      }


                      var today = $rootScope.printDate(new Date());
                      $rootScope.downloadFile({
                          file: data,
                          type:_exportFormatObject.mimeType,
                          filename: $scope.currentCompany.name + ' от ' + today + ' объект biqa' + ' ' + _view.name + ' ' + (_exportFormatObject.extension || '.html')
                      })
                  });
              })()

          };



          $scope.updateCompany = function(e) {
              customObjectsDataService.updateCustomObjectData($scope.currentCompany);
              logger.logSuccess("Данные об объекте успешно обновлены!");
              $rootScope.hasUnsavedEdits = false;
              $scope.defaultOptions.editableFields = !$scope.defaultOptions.editableFields;
          };

          $scope.deleteConfirmation = function() {
              SweetAlert.swal({
                      title: "Удалить объект?",
                      text: "Объект " + $scope.currentCompany.name + " с Id " + $scope.currentCompany.id + " будет безвозвратно удалён",
                      type: "warning",
                      showCancelButton: true,
                      confirmButtonColor: "#DD6B55",
                      confirmButtonText: "Да",
                      cancelButtonText: "Отмена",
                      closeOnConfirm: true,
                      closeOnCancel: true
                  },
                  function(isConfirm) {
                      if (isConfirm) {
                          SweetAlert.swal("Удалён");

                          customObjectsDataService.deleteCustomObjectData($scope.currentCompany).then(function(data) {
                              $location.path('/objects/custom/data/details/' + obj.collectionId);
                          })

                      } else {
                          SweetAlert.swal("Отмена", "error");
                      }
                  }

              )
          };

      }]);
