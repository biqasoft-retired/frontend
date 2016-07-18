'use strict';

angular.module('yaru22.angular-timeago').config(['timeAgoSettings', function (timeAgoSettings) {
    timeAgoSettings.strings['ru'] = {
        prefixAgo: null,
        prefixFromNow: null,
        suffixAgo: 'назад',
        suffixFromNow: null,
        seconds: 'менее минуты',
        minute: 'около минуты',
        minutes: '%d минут',
        hour: 'час',
        hours: '%d часов',
        day: 'день',
        days: '%d дней',
        month: 'месяц',
        months: '%d месяцев',
        year: 'год',
        years: '%d лет',
        numbers: []
    };
}]);
