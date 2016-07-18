/**
 * Created Nikita Bakaev, ya@nbakaev.ru on 7/6/2016.
 * All Rights Reserved
 */
angular.module('app.task.all')

    .service('TaskStatisticService', ['$rootScope',
        function ($rootScope) {

            var self = this;

            self.countDoneCheckedListInTask = function (task) {
                var done = 0;
                for (var i = 0; i < task.checkListItems.length; i++) {
                    if (task.checkListItems[i].done) done++;
                }

                return done;
            };


            /**
             *
             * @param task
             * @returns time from name to time when task should be started. Or null if task has not start data
             */
            self.startTaskFoo = function (task) {
                if (task == null || task.startDate == null) return null;

                var cur = new Date();
                var res = Math.round((task.startDate - cur)) / 1000 / 60 / 60;
                res = res.toFixed(3);
                return res;
            };


            /**
             *
             * @param task
             * @returns time for execution task (start - end). Or null if task has not start data
             */
            self.startTaskToEndFoo = function (task) {
                if (isUndefinedOrNullOrEmpty(task.startDate) || isUndefinedOrNullOrEmpty(task.finalDate)) {
                    return null;
                }

                var res = Math.round((task.finalDate - task.startDate)) / 1000 / 60 / 60;
                res = res.toFixed(3);

                if (res == null || isNaN(res)) {
                    return null;
                }

                return res;
            };


        }]);
