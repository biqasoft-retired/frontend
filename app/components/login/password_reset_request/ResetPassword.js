'use strict';

angular.module('app.resetPassword', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/login/password_reset_request', {
                templateUrl: 'app/components/login/password_reset_request/request_reset_token.html',
                controller: 'ResetPasswordCtrl'
            })

            .when('/login/password_reset_request/email/:email/id/:id/token/:token', {
                templateUrl: 'app/components/login/password_reset_request/reset_password_with_token.html',
                controller: 'ResetPasswordTokenCtrl'
            });
    }])

    .controller('ResetPasswordCtrl', ['$scope', 'UserService', 'logger', function ($scope, UserService, logger) {
        $scope.emaiil = "";

        $scope.requestRestBtn = function () {
            UserService.requestResetPassword($scope.email).then(function (e) {
                logger.logSuccess("Сообщение отправлено на " + $scope.email);
            });
        };

    }])

    .controller('ResetPasswordTokenCtrl', ['$scope', 'UserService', '$route', 'logger', function ($scope, UserService, $route, logger) {
        $scope.emailFromToken = $route.current.params.email;
        $scope.idFromToken = $route.current.params.id;
        $scope.randomStringFromToken = Base64.decode($route.current.params.token);

        $scope.emaiil = "";
        $scope.password1 = "";
        $scope.password2 = "";

        $scope.changePasswordBtn = function () {
            if ($scope.password1 != $scope.password2) {
                logger.logError("Пароли не совпадают");
                return;
            }

            var a = {};
            a.randomString = $scope.randomStringFromToken;
            a.password = $scope.password1;
            a.id = $scope.idFromToken;
            a.email = $scope.emailFromToken;

            UserService.requestResetPasswordWithToken(a).then(function (e) {
                logger.logSuccess("Пароль изменен! " + $scope.email);
            });
        };
    }])


;