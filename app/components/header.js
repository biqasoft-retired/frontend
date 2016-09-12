/**
 * Created by Nikita on 9/12/2016.
 */

angular.module('app.controllers')
    .controller('HeaderCtrl', ['$scope', '$rootScope', 'SearchService', 'logger', '$timeout', 'storageService', 'Fullscreen',
        function ($scope, $rootScope, SearchService, logger, $timeout, documentsService, Fullscreen) {

            var self = this;

            // hack to show/hide search bar for mobile devices
            $scope.showSearchBox = false;
            self.hiddenSearchClasses = "visible-lg hidden-md";

            $scope.showSearchBoxClicked = function () {
                if (!$scope.showSearchBox) {
                    $("#search-box-li").removeClass(self.hiddenSearchClasses);
                } else {
                    $("#search-box-li").addClass(self.hiddenSearchClasses);
                }
                $scope.showSearchBox = !$scope.showSearchBox;
            };

            // search result from server
            $scope.searchResult = {};

            $scope.downloadFile = function (documentFile) {
                documentsService.downloadFile(documentFile.id);
            };

            $scope.clear = function () {
                $scope.searchResult = {};
                $rootScope.showDisplay = true;
                $scope.lll = '';
            };
            $scope.clear();

            $scope.goFullscreen = function () {
                if (Fullscreen.isEnabled())
                    Fullscreen.cancel();
                else
                    Fullscreen.all();

                // Set Fullscreen to a specific element (bad practice)
                // Fullscreen.enable( document.getElementById('img') )
            };

            /**
             * search text box in the head of page - called in when text is changed
             */
            $scope.seaechClicked = function () {
                $scope.searchResult = {};
                $rootScope.showDisplay = false;

                if ($scope.lll.length === 0) {
                    logger.logWarning($translate.instant('APP.SEARCH.EMPTY_REQUEST'));
                    return;
                }

                self.searchBlockSelector = $('#search');
                self.searchBlockSelector.addClass('open');
                self.searchBlockSelector.find('> form > input[type="search"]').focus();

                console.log("Search:" + $scope.lll);
                SearchService.allSearch($scope.lll).then(function (data) {
                    $scope.searchResult = data;

                    if (data.resultNumber > 0) {
                        $rootScope.showDisplay = false;
                    } else {
                        $rootScope.showDisplay = true;
                    }

                });
            };

            $rootScope.closeSearchTimeout = function () {
                $timeout(function () {
                    $rootScope.showDisplay = true;
                    $scope.searchResult = {};
                    $scope.lll = '';
                }, 1500);
            };


            $scope.allBookmarks = [];
            $scope.allBookmarks.push({name: "name1", link: "/customer/all"});
            $scope.allBookmarks.push({name: "name2", link: "/customer/all"});
            $scope.allBookmarks.push({name: "name3", link: "/customer/all"});
            $scope.allBookmarks.push({name: "name4", link: "/customer/all"});
            $scope.allBookmarks.push({name: "name5", link: "/customer/all"});


        }]);