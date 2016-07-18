'use strict';

angular.module('app.services.draw', ['LocalStorageModule', 'ngRoute', 'app.services'])

    .service('chartsService', ['$timeout', '$rootScope', '$translate', function ($timeout, $rootScope, $translate) {

        var currentService = this;

        this.drawBarChart = function (divId, categoriesArr, series, params) {
            params = params || {};
            var selector = $('#' + divId);

            if (!selector || params.delay) {
                var delay = params.delay || 100;
                $timeout(function () {
                    params.delay = 0;
                    currentService.drawBarChart(divId, categoriesArr, series, params);
                }, delay);
            }

            var chartConfig = {
                chart: {
                    type: 'bar'
                },
                title: {
                    text: params.title
                },
                subtitle: {
                    text: params.subtitle
                },
                xAxis: {
                    categories: categoriesArr,
                    title: {
                        text: null
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: params.yAxisText,
                        align: 'high'
                    },
                    labels: {
                        overflow: 'justify'
                    }
                },
                tooltip: {
                    valueSuffix: '  '
                },
                plotOptions: {
                    bar: {
                        dataLabels: {
                            enabled: true
                        }
                    }
                },
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'top',
                    x: -40,
                    y: 100,
                    floating: true,
                    borderWidth: 1,
                    backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
                    shadow: true
                },
                credits: {
                    enabled: false
                },
                series: series
            };

            if (params.userAccountLinks) {
                chartConfig.xAxis.labels = {
                    formatter: function () {
                        return '<a href="/user_account/details/' + this.value.id + '">' + $rootScope.printUser(this.value) + '</a>'
                    },
                    useHTML: true
                };
            }

            selector.highcharts(chartConfig);
        };

        this.drawGauge = function (divId, startVal, curVal, finalVal) {

            var selector = $('#' + divId);

            if (!selector) {
                $timeout(function () {
                    currentService.drawGauge(divId, startVal, curVal, finalVal);
                }, 100);
            }

            var gaugeOptions = {

                chart: {
                    type: 'solidgauge'
                },

                title: $translate.instant('WIDGETS.DRAW.GAUGE.HEADER'),

                pane: {
                    center: ['50%', '85%'],
                    size: '140%',
                    startAngle: -90,
                    endAngle: 90,
                    background: {
                        backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
                        innerRadius: '60%',
                        outerRadius: '100%',
                        shape: 'arc'
                    }
                },

                tooltip: {
                    enabled: false
                },

                // the value axis
                yAxis: {
                    stops: [
                        [0.1, '#55BF3B'], // green
                        [0.5, '#DDDF0D'], // yellow
                        [0.9, '#DF5353'] // red
                    ],
                    lineWidth: 0,
                    minorTickInterval: null,
                    tickPixelInterval: 400,
                    tickWidth: 0,
                    title: {
                        y: -70
                    },
                    labels: {
                        y: 16
                    }
                },

                plotOptions: {
                    solidgauge: {
                        dataLabels: {
                            y: 5,
                            borderWidth: 0,
                            useHTML: true
                        }
                    }
                }
            };

            // The speed gauge
            selector.highcharts(Highcharts.merge(gaugeOptions, {
                title: $translate.instant('WIDGETS.DRAW.GAUGE.HEADER'),

                yAxis: {
                    min: startVal,
                    max: finalVal,
                    title: {
                        text: $translate.instant('WIDGETS.DRAW.DEFAULT_VALUE_PLACEHOLDER')
                    }
                },

                credits: {
                    enabled: false
                },

                series: [{
                    name: $translate.instant('WIDGETS.DRAW.DEFAULT_VALUE_PLACEHOLDER'),
                    data: [curVal],
                    dataLabels: {
                        format: '<div style="text-align:center"><span style="font-size:25px;color:' +
                        ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span><br/>' +
                        '<span style="font-size:12px;color:silver">  ' + $translate.instant('WIDGETS.DRAW.DEFAULT_CURRENT_PLACEHOLDER') + '  </span></div>'
                    },
                    tooltip: {
                        valueSuffix: $translate.instant('WIDGETS.DRAW.DEFAULT_CURRENT_PLACEHOLDER')
                    }
                }]

            }));
        };

        this.drawColdCallResult = function (divId, allUserNames, successCalls, failedCalls, noCalls, allCalls) {
            $(function () {
                $('#' + divId).highcharts({
                    chart: {
                        type: 'column'
                    },
                    title: {
                        text: $translate.instant('WIDGETS.DRAW.COLD_CALL.HEADER')
                    },
                    xAxis: {
                        categories: allUserNames
                    },
                    credits: {
                        enabled: false
                    },
                    series: [{
                        name: $translate.instant('WIDGETS.DRAW.COLD_CALL.SUCCESS'),
                        data: successCalls
                    }, {
                        name: $translate.instant('WIDGETS.DRAW.COLD_CALL.FAILED_CALLS'),
                        data: failedCalls
                    }, {
                        name: $translate.instant('WIDGETS.DRAW.COLD_CALL.NO_CALL'),
                        data: noCalls
                    }, {
                        name: $translate.instant('WIDGETS.DRAW.COLD_CALL.ALL_CALLS'),
                        data: allCalls
                    }

                    ]
                });
            });

        };

        this.drawBubbleChart = function (divId, dataSeriesArr, params) {
            var selector = $('#' + divId);

            if (!selector) {
                $timeout(function () {
                    chartsService.drawBubbleChart(divId, dataSeriesArr, params);
                }, 100);
            }

            $(function () {
                selector.highcharts({

                    chart: {
                        type: 'bubble',
                        zoomType: 'xy'
                    },

                    plotOptions: {
                        bubble: {
                            tooltip: {
                                headerFormat: '<b>{series.name}</b><br>',
                                pointFormat: '{point.x} ' + $translate.instant('WIDGETS.DRAW.BUBBLE_CHART.MANAGER_NUMBER') + ', {point.y} ' + $translate.instant('WIDGETS.DRAW.BUBBLE_CHART.SALES_NUMBER') + ', {point.z} ' + $translate.instant('WIDGETS.DRAW.BUBBLE_CHART.AMOUNT')
                            }
                        }
                    },

                    title: {
                        text: ' '
                    },

                    //series: [{
                    //    data: [[97, 36, 79], [94, 74, 60], [68, 76, 58], [64, 87, 56], [68, 27, 73], [74, 99, 42], [7, 93, 87], [51, 69, 40], [38, 23, 33], [57, 86, 31]]
                    //}, {
                    //    data: [[25, 10, 87], [2, 75, 59], [11, 54, 8], [86, 55, 93], [5, 3, 58], [90, 63, 44], [91, 33, 17], [97, 3, 56], [15, 67, 48], [54, 25, 81]]
                    //}, {
                    //    data: [[47, 47, 21], [20, 12, 4], [6, 76, 91], [38, 30, 60], [57, 98, 64], [61, 17, 80], [83, 60, 13], [67, 78, 75], [64, 12, 10], [30, 77, 82]]
                    //}]
                    series: dataSeriesArr

                });
            });

        };

        this.drawColumnChart = function (divId, dataToChart, params) {
            params = params || {};
            var selector = $('#' + divId);

            if (!selector || params.delay) {
                var delay = params.delay || 100;
                $timeout(function () {
                    params.delay = 0;
                    currentService.drawColumnChart(divId, dataToChart, params);
                }, delay);
            }

            params.delay = 0;

            var options = {
                chart: {
                    type: 'column'
                },
                title: {
                    text: ' '
                },
                subtitle: {},
                xAxis: {
                    type: 'category',
                    labels: {
                        formatter: function () {
                            var text = this.value;
                            var formatted = text.length > 25 ? text.substring(0, 25) + '...' : text;

                            return '<div class="js-ellipse" style="width:150px; overflow:hidden" title="' + text + '">' + formatted + '</div>';
                        },
                        style: {
                            width: '150px'
                        },
                        useHTML: true
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: $translate.instant('WIDGETS.DRAW.DEFAULT_VALUE_PLACEHOLDER')
                    }
                },
                legend: {
                    enabled: false
                },
                tooltip: {
                    pointFormat: $translate.instant('WIDGETS.DRAW.DEFAULT_VALUE_PLACEHOLDER') + ' <b>{point.y:.1f} </b>'
                },
                series: [{
                    name: '  ',
                    colorByPoint: true,
                    data: dataToChart,

                    dataLabels: {
                        enabled: true,
                        color: '#000000',
                        format: '{point.y:.1f}', // one decimal
                        y: 0, // 10 pixels down from the top
                        style: {
                            fontSize: '13px',
                            fontFamily: 'Verdana, sans-serif'
                        }
                    }
                }]
            };

            if (params && params.dataSources && params.dataSources.length > 0) {
                options.xAxis.labels = {
                    formatter: function () {

                        var dsId = this.value;
                        var obj = params.dataSources.filter(function (data) {
                            if (data.id === dsId) return true;
                        });

                        if (obj && obj.length === 1) obj = obj[0];

                        var text = obj.name;
                        var formatted = text.length > 25 ? text.substring(0, 25) + '...' : text;

                        return '<div class="js-ellipse" style="width:150px; overflow:hidden" title="' + text + '"><a href="/data_source/details/' + this.value + '">' + formatted + '</a> </div>'
                    },
                    useHTML: true
                };
            }

            selector.highcharts(options);
        };

        this.drawPieChart = function (divId, dataToChart, params) {

            var selector = $('#' + divId);

            if (!selector || params.delay) {
                var delay = params.delay || 100;
                $timeout(function () {
                    params.delay = 0;
                    currentService.drawPieChart(divId, dataToChart, params);
                }, delay);
            }

            params.delay = 0;

            var options = {
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false
                },
                title: {
                    text: params.titleChart
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}% [ {point.y} ]  </b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            formatter: function () {
                                var text = this.point.name,
                                    formatted = text.length > 40 ? text.substring(0, 40) + '...' : text;
                                return formatted;
                            },

                            style: {
                                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                            }
                        }
                    }
                },
                series: [{
                    type: 'pie',
                    name: $translate.instant('WIDGETS.DRAW.DEFAULT_DATA_PLACEHOLDER'),
                    data: dataToChart

                }]
            };

            console.warn(params);
            if (params && params.dataSources && params.dataSources.length > 0) {
                options.plotOptions.pie.dataLabels.formatter = function () {

                    var dsId = this.point.name;
                    var obj = params.dataSources.filter(function (data) {
                        if (data.id === dsId) return true;
                    });

                    if (obj && obj.length === 1) obj = obj[0];

                    var text = obj.name;
                    var formatted = text.length > 25 ? text.substring(0, 25) + '...' : text;

                    return '<div class="js-ellipse" style="width:150px; overflow:hidden" title="' + text + '"><a href="/data_source/details/' + dsId + '">' + formatted + '</a> </div>';
                };
                options.plotOptions.pie.dataLabels.useHTML = true;
            }

            selector.highcharts(options);
        };

        this.drawSalesFunnelByDOMidAndDataSource_ONE = function (domId, data, name) {

            if (isUndefinedOrNull(data)) {
                console.log("NULL DATA TO DRAW! Return");
                return;
            }

            var res = 100 / data.length + "%";

            var obj = {
                chart: {
                    type: 'funnel',
                    marginRight: 100
                },
                title: {
                    text: name,
                    x: -50
                },
                plotOptions: {
                    series: {
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b> ({point.y:,.0f})',
                            softConnector: true
                        },
                        neckHeight: res
                    }
                },
                legend: {
                    enabled: false
                },
                series: [{
                    name: $translate.instant('WIDGETS.DRAW.DEFAULT_VALUE_PLACEHOLDER'),

                    //    data: [
                    //        ['Website visits',   15654],
                    //        ['Downloads',       4064],
                    //        ['Requested price list', 1987],
                    //        ['Invoice sent',    976],
                    //        ['Finalized',    846]
                    //    ]
                    //}]
                    data: data
                }]
            };

            if (!data[0]) {
                console.error("Can't draw!");
                return;
            }

            if (data[0][2]) {
                obj.plotOptions.series.colors = data.map(function (data) {
                    return data[2];
                });
            }

            $('#' + domId).highcharts(obj);
        };

    }]);

