(function () {
    angular.module('app.ui.form.directives', [])
        .directive('uiFileUpload', ['$translate',
            function ($translate) {
                return {
                    restrict: 'A',
                    link: function (scope, ele) {
                        // var translatedButtonName = $translate.instant('STORAGE.UPLOAD.UPLOAD_BUTTON');
                        // $(ele).attr('title', translatedButtonName);
                        // console.log(translatedButtonName, ele);
                        return ele.bootstrapFileInput();
                    }
                };
            }

        ]).directive('uiSpinner', [
        function () {
            return {
                restrict: 'A',
                compile: function (ele, attrs) {
                    ele.addClass('ui-spinner');
                    return {
                        post: function () {
                            return ele.spinner();
                        }
                    };
                }
            };
        }]);
})
    .call(this);

