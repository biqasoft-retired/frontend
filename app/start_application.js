// manually bootstrap angular
// do not use  data-ng-app="app" in html
// because we want to catch exceptions in startup
// see https://docs.angularjs.org/api/ng/function/angular.bootstrap
angular.element(document).ready(function () {
    try {
        angular.bootstrap(document.getElementsByTagName('html')[0], ['app'], {strictDi: true});
    } catch (err) {
        processError(err);
        console.error(err);
    }
});