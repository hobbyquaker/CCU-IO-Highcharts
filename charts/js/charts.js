/**
 *      CUxD-Highcharts
 *
 *      visualisiert CCU.IO Logs mittels Highcharts
 *
 *      Copyright (c) 2013 hobbyquaker https://github.com/hobbyquaker
 *
 *      Lizenz: CC BY-NC 3.0 http://creativecommons.org/licenses/by-nc/3.0/de/
 *
 *      Die Veröffentlichung dieser Software erfolgt in der Hoffnung, daß sie Ihnen von Nutzen sein wird, aber
 *      OHNE IRGENDEINE GARANTIE, sogar ohne die implizite Garantie der MARKTREIFE oder der VERWENDBARKEIT FÜR EINEN
 *      BESTIMMTEN ZWECK.
 *
 */

;var chart; 

(function ($) {

    chart = {
        version: "0.9.6",
        socket: {},
        regaObjects: {},
        regaIndex: {},
        oldLogs: [],
        logData: {},
        chart: undefined,
        chartOptions: {},
        queryParams: getUrlVars(),
        storageKey: "chart",
        storageMenu: "chart_menu",
        cache: {
            visible: []
        },
        first: "2038-01-18T00:00:00",
        last: "0000-00-00T00:00:00",
        start: "0000-00-00T00:00:00",
        //tzOffset: 60000 * (new Date().getTimezoneOffset()),
        countDp: 0,
        countVal: 0,
        dpInfos: {},
        //revDpInfos: {},
        //cuxdConfig: {
        //    ALIASES: {},
        //    REVALIASES: {},
        //    OLDLOGS: []
        //},
        dates: {},
        done: false,
        getDpInfos: function (callback) {

        },
        saveSettings: function () {
            var visible = [];
            for (var key in chart.chart.series) {
                if (chart.chart.series[key].visible) {
                    visible.push(chart.chart.series[key].name);
                }
            }
        },
        renderChart: function () {
            chart.chart = new Highcharts.StockChart(chart.chartOptions);
        },
        initHighcharts: function () {

            if (chart.queryParams["theme"]) {
                $.getScript('themes/' + chart.queryParams.theme+".js", function () {
                    $("body").css("color", Highcharts.theme.legend.itemStyle.color);
                    if (Highcharts.theme.chart.backgroundColor && Highcharts.theme.chart.backgroundColor.stops) { $("body").css("background-color", Highcharts.theme.chart.backgroundColor.stops[0][1]); }
                    $(".loader-output").css("border-color", Highcharts.theme.legend.itemStyle.color);
                });
            }

            if (!chart.queryParams["loader"] || chart.queryParams["loader"] != "false") {
                $("#loader").show();
                $("#loader_small").hide();
            }

            if (chart.queryParams["period"]) {
                var now = new Date().getTime();
                var dateObj = new Date(now - (parseFloat(chart.queryParams["period"]) * 3600000));
                /*var year = dateObj.getFullYear();
                var month = (dateObj.getMonth() + 1).toString(10);
                month = (month.length == 1 ? "0" + month : month);
                var day = dateObj.getDate().toString(10);
                day = (day.length == 1 ? "0" + day : day);
                var hour = dateObj.getHours().toString(10);
                hour = (hour.length == 1 ? "0" + hour : hour);
                var minute = dateObj.getMinutes().toString(10);
                minute = (minute.length == 1 ? "0" + minute : minute);
                var second = dateObj.getSeconds().toString(10);
                second = (second.length == 1 ? "0" + second : second);
                chart.start = year + "-" + month + "-" + day + "T" + hour + ":" + minute + ":" + second;*/
                chart.start = Math.floor(dateObj.getTime() / 1000);
            }


            Highcharts.setOptions({
                lang: {
                    months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
                        'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
                    shortMonths: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
                    weekdays: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
                    rangeSelectorFrom: 'von',
                    rangeSelectorTo: 'bis',
                    rangeSelectorZoom: 'Bereich'
                },
                global: {
                    useUTC: false
                }
            });

            var legend, navigator, credits;

            if (chart.queryParams["legend"] == "false") {
                $("#title").hide();
                legend = {
                    enabled: false
                };
                credits = {
                    enabled: false
                }
            } else if (chart.queryParams["legend"] == "inline") {
                $("#title").hide();
                legend = {
                    enabled: true,
                    layout: 'horizontal',
                    align: 'center',
                    floating: true,
                    verticalAlign: 'top',
                    y: 38
                };
                credits = {
                    enabled: false
                };


            } else {

                legend = {
                    enabled: true,
                    layout: 'vertical',
                    align: 'left',
                    verticalAlign: 'top',
                    y: 38
                };
                credits = {
                    enabled: true,
                    text: "CCU.IO-Highcharts " + chart.version + " copyright (c) 2013 hobbyquaker https://github.com/hobbyquaker - Lizenz: CC BY-NC 3.0 DE http://creativecommons.org/licenses/by-nc/3.0/de/ - Verwendet Highstock http://www.highcharts.com - Kommerzielle Nutzung untersagt",
                    href: "https://github.com/hobbyquaker/CCU-IO-Highcharts",
                    position: { align: "left", x: 12 }
                };
            }

            if (chart.queryParams["navigator"] == "false") {
                navigator = {
                    enabled: false,
                    series: {
                        type: "line"
                    }

                };


            } else {

                navigator = {
                    enabled: true,
                    series: {
                        type: "line"
                    }
                };
            }

            var exporting = false;
            if (chart.queryParams["exporting"]) {
                exporting = true;
            }



            chart.chartOptions = {
                chart: {
                    renderTo: 'chart',
                    zoomType: 'xy',
                    events: {

                    }
                },
                exporting: {
                    enabled: exporting,
                    sourceWidth: 1920,
                    sourceHeight: 1080

                },
                title: {
                    text: null
                },
                legend: legend,
                subtitle: {
                    text: null
                },
                credits: credits,

                xAxis: {
                    ordinal: false,
                    type: 'datetime',
                    dateTimeLabelFormats: {
                        month: '%e. %b',
                        year: '%Y'
                    }
                },
                yAxis: [{
                    title: {
                        text: ''
                    }
                }],
                navigator: navigator,
                tooltip: {
                    shared: false,
                    //valueDecimals: 3,
                    //xDateFormat: "%e. %b %Y %H:%M:%S",

                    formatter: function() {
                        var date;
                        //console.log(this);
                        if (this.series.hasGroupedData) {
                            date = "<i>Aggregiert: ";
                            if (this.series.pointRange == 0) {
                               pointRange = this.point.series.closestPointRange;
                               // console.log(Highcharts.dateFormat("%e. %b %Y %H:%M:%S", this.series.processedXData[0]));
                                date += jQuery("<div/>").html("&#x00d8; ").text();
                            } else {
                                pointRange = this.series.pointRange;
                                date += jQuery("<div/>").html("&#x0394; ").text();
                            }
                            var endDate = Highcharts.dateFormat("%H:%M", this.x + pointRange);
                            if (endDate == "00:00") { endDate = "24:00"; }
                            if (pointRange < 3600000) {
                                date += (pointRange / 60000) + " Minuten</i><br/>";

                                date += Highcharts.dateFormat("%e. %b %Y %H:%M", this.x);
                                date += "-";
                                date += endDate;

                            } else if (pointRange < 86400000) {
                                date += (pointRange / 3600000) + " Stunde"+(pointRange > 3600000 ? "n" : "")+"</i><br/>";

                                date += Highcharts.dateFormat("%e. %b %Y %H:%M", this.x);
                                date += "-";
                                date += endDate;

                            } else {
                                date += (pointRange / 86400000) + " Tag"+(pointRange > 86400000 ? "e" : "")+"</i><br/>";

                                date += Highcharts.dateFormat("%e. %b %Y", this.x);

                            }

                        } else {
                            date = Highcharts.dateFormat("%e. %b %Y %H:%M:%S", this.x);
                        }

                        //console.log(Highcharts.dateFormat("%e. %b %Y %H:%M:%S", this.series.groupedData[0].x));
                        var val = parseFloat(this.y).toFixed(this.series.options.valueDecimals);
                        var unit = this.series.options.valueSuffix;
                        if (unit == "100%") {
                            val = val * 100;
                            unit = "%";
                        }

                        var dpObj = chart.regaObjects[this.series.options.chart];
                        var tmpName;
                        if (dpObj.Parent) {
                            tmpName = chart.regaObjects[dpObj.Parent].Name+"<br/>"+chart.regaObjects[this.series.options.chart].Name;
                        } else {
                            tmpName = chart.regaObjects[this.series.options.chart].Name;
                        }

                        return '<b>'+tmpName + '</b><br>' + // return stored text
                            date + ' - <b>' + val + unit + "</b>";

                    }
                },
                series: []
            };

            if (chart.queryParams["percentaxis"] == "true") {
                chart.chartOptions.yAxis.push({
                    title: {
                        text: ""
                    },
                    labels: {
                        formatter: function() {
                            return this.value +'%';
                        }
                    },
                    opposite: true
                });
            }

            if (chart.queryParams["scrollbar"] == "false") {
                chart.chartOptions.scrollbar = {
                    enabled : false
                };
            }
            if (chart.queryParams["range"]) {
                chart.chartOptions.xAxis.range = parseFloat(chart.queryParams["range"]) * 3600 * 1000;
            }
            if (chart.queryParams["navigator"]) {
                chart.chartOptions.rangeSelector = {
                    enabled: false

                };
            } else {
                var selectedRange;
                if (chart.queryParams["range"]) {
                    var range = parseInt(chart.queryParams["range"],10);
                    switch (range) {
                        case 1:
                            selectedRange = 0;
                            break;
                        case 6:
                            selectedRange = 1;
                            break;
                        case 24:
                            selectedRange = 2;
                            break;
                        case 168:
                            selectedRange = 3;
                            break;
                        case 720:
                        case 744:
                            selectedRange = 4;
                            break;
                        case 8760:
                            selectedRange = 5;
                            break;
                    }
                }
                chart.chartOptions.rangeSelector = {
                    inputDateFormat: "%e. %b %Y",
                    buttons : [{
                        type : 'hour',
                        count : 1,
                        text : '1h'
                    }, {
                        type : 'hour',
                        count : 6,
                        text : '6h'
                    }, {
                        type : 'day',
                        count : 1,
                        text : '1T'
                    }, {
                        type : 'week',
                        count : 1,
                        text : '1W'
                    }, {
                        type : 'month',
                        count : 1,
                        text : '1M'
                    }, {
                        type : 'year',
                        count : 1,
                        text : '1J'
                    }],
                    selected : selectedRange,
                    inputEnabled : true
                };
            }
            if (chart.queryParams["zoom"] == "false") {
                chart.chartOptions.chart.zoomType = undefined;
            }
            //console.log(chart.first);
            //console.log(chart.chartOptions);
            //chart.chart = new Highcharts.StockChart();
        },
        loadLog: function (log, callback) {
            $("#loader_output2").prepend("<span class='ajax-loader'></span> lade "+log+" ");

            console.log("chart.start="+chart.start);

            chart.socket.emit('readRawFile', 'log/'+log, function (data) {
                chart.ajaxDone();
                $("#loader_output2").prepend("<span class='ajax-loader'></span> verarbeite "+log+" ");
                var dataArr = data.split("\n");
                var l = dataArr.length;

                if (chart.queryParams["dp"]) {
                    var DPs = chart.queryParams["dp"].split(",");
                } else {
                    $(".ajax-loader").removeClass("ajax-loader").addClass("ajax-fail");
                    $("#loader_output2").prepend("<b>Fehler: </b>Keine Datenpunkte ausgewählt!<br/>");
                    $.error("Keine Datenpunkte ausgewählt!");

                }
                var tmpArr = [];
                for (var i = 0; i < l; i++) {
                    var triple = dataArr[i].split(" ", 3);

                    if (DPs.indexOf(triple[1]) !== -1) {
                        if (!tmpArr[triple[1]]) { tmpArr[triple[1]] = []; }
                        var val = triple[2];
                        if (val === false || val === "false") {
                            val = 0;
                        } else if (val === true || val === "true") {
                            val = 1;
                        } else {
                            val = parseFloat(val);
                        }

                        if (isNaN(val)) {
                            val = 0;
                        }
                        if (!isNaN(triple[0])) {
                            if (triple[0] < chart.start) {
                                console.log("OLD!");
                                chart.done = true;
                                break;
                            }
                            tmpArr[triple[1]].push([triple[0]*1000, val]);
                        }

                    }

                }
                // vorne anfügen
                for (var tmpDp in tmpArr) {
                    if (!chart.logData[tmpDp]) { chart.logData[tmpDp] = []; }
                    chart.logData[tmpDp] = tmpArr[tmpDp].concat(chart.logData[tmpDp]);
                }


                chart.ajaxDone();
                callback();
            });


        },
        loadOldLogs: function (callback) {
            $("#chart_skip").show();
            var log = chart.oldLogs.pop();
            if (log && !chart.done) {
                chart.loadLog(log, chart.loadOldLogs, true);
            } else {
                // Keine weiteren Logs vorhanden.
                $("#chart_skip").hide();

                chart.ajaxDone();
                $("#loader_output2").prepend("<span class='ajax-loader'></span> initialisiere Highcharts");

                if (chart.queryParams["navserie"]) {
                    chart.addSeries(chart.queryParams["navserie"], true);
                }

                for (var dp in chart.logData) {
                    chart.addSeries(dp);
                }
                $("#loader").hide();
                $("#loader_small").hide();
                    chart.renderChart();
                    /*
                    var tmpArr = [];
                    for (var dp in chart.dates) {
                        var tmp = dp.split(".");
                        if (!tmp[1]) { tmp[1] = ""; } else { tmp[1] = "." + tmp[1]; }
                        tmpArr.push(chart.dpInfos[dp].ChannelName + tmp[1]);
                    }
                    tmpArr.sort();
                    var serie;
                    for (var i = 0; i<tmpArr.length; i++) {
                        if (chart.revDpInfos[tmpArr[i]]) {
                            serie = chart.revDpInfos[tmpArr[i]];
                        } else {
                            serie = tmpArr[i];
                        }
                        chart.addSeries(serie);
                    }


                    if (!chart.queryParams["navserie"]) {
                        chart.chartOptions.navigator.series.data = [[chart.parseDate(((chart.start > chart.first) ? chart.start : chart.first)),0],[chart.parseDate(chart.last),0]];
                    } else {
                        chart.addSeries(chart.queryParams["navserie"], true)
                    }


                    setTimeout(function () {
                        //chart.ajaxDone();
                        $("#loader").hide();
                        $("#loader_small").hide();
                        chart.renderChart();
                    }, 1);
                     */



            }

        },
        parseDate: function (ts) {
            var ts = new Date(ts);
            return ts;
        },
        loadData: function () {
            $("#loader_output2").prepend("<span class='ajax-loader'></span> lade ReGaHSS-Objekte");
            chart.socket.emit('getObjects', function(obj) {
                chart.regaObjects = obj;
                chart.ajaxDone();
                $("#loader_output2").prepend("<span class='ajax-loader'></span> lade ReGaHSS-Index");
                // Weiter gehts mit dem Laden des Index
                chart.socket.emit('getIndex', function(obj) {
                    chart.regaIndex = obj;

                    chart.ajaxDone();
                    $("#loader_output2").prepend("<span class='ajax-loader'></span> frage vorhandene Logs ab");

                    // alte Logfiles finden
                    chart.socket.emit('readdir', "log", function (obj) {
                        chart.ajaxDone();
                        var files = [];
                        for (var i = 0; i < obj.length; i++) {
                            if (obj[i].match(/devices\-variables\.log\./)) {
                                files.push(obj[i]);
                            }
                        }
                        files.sort();
                        chart.oldLogs = files;

                        chart.loadLog("devices-variables.log", chart.loadOldLogs);

                    })


                });
            });

        },
        ajaxDone: function () {
            $(".ajax-loader").removeClass("ajax-loader").addClass("ajax-check");
            $("#loader_output2").prepend("<br/>\n");

        },
        addSeries: function (dp, navserie) {

            var visible = true;
            /*
             if (chart.cache && chart.cache.visible && chart.cache.visible.length > 0) {
                if ($.inArray(dp, chart.cache.visible) == -1) {
                    visible = false;
                } else {
                    if (chart.cache.visible.length < 5) {
                        visible = true;
                    } else {
                        if (chart.chartOptions.series.length > 0) {
                            visible = false;
                        } else {
                            visible = true;
                        }
                    }
                }

            } else {
                if (chart.chartOptions.series.length > 0) {
                    visible = false;
                } else {
                    visible = true;
                }

            }
                 */
                var name, valueSuffix, type, step;

            var dptype;

            var regaObj = chart.regaObjects[dp];
            if (regaObj) {
                var chId = regaObj.Parent;
                console.log("dp "+dp+" found!");
            } else {
                console.log("dp "+dp+" not found :-(");
            }

            var unit = "";
            if (regaObj && regaObj.ValueUnit) {
                unit = " ["+$("<div/>").html(chart.regaObjects[dp].ValueUnit).text()+"]";
            }


            if (chId) {
                var tmpType = chart.regaObjects[dp].Name.split(".");
                dptype = tmpType[2];
                name = chart.regaObjects[chId].Name + " " + dptype + unit;

            } else {
                name = regaObj.Name;

                dptype = undefined;

            }

            if (chart.regaObjects[dp].ValueUnit) {
                unit = chart.regaObjects[dp].ValueUnit;
            }



            var marker = {
                enabled: false,
                states: {
                    hover: {
                        enabled: true
                    }
                }
            };
            var step = undefined;
            var valueDecimals = 3;
            var factor = 1;
            var yAxis = 0;
            var grouping = undefined;



            switch (dptype) {
                case "METER":
                case "RAIN_CTR":
                    type = "column";

                    grouping = {
                        enabled: true,
                        approximation: function (data) {
                            var approx = data[data.length-1]-data[0];
                            return (approx ? approx : 0);
                        },
                        forced: false,
                        groupPixelWidth: 40,
                        units: [[
                            'minute',
                            [30]
                        ], [
                            'hour',
                            [1, 2, 6, 12]
                        ], [
                            'day',
                            [1]
                        ], [
                            'week',
                            [1]
                        ], [
                            'month',
                            [1]
                        ]]

                    };
                    valueDecimals = 3;
                    break;

                case "HUMIDITY":
                case "HUMIDITYF":
                case "ABS_HUMIDITY":
                case "HUM_MAX_24H":
                case "HUM_MIN_24H":
                    yAxis = 1;
                case "TEMPERATURE":
                case "DEW_POINT":
                case "TEMP_MAX_24H":
                case "TEMP_MIN_24H":
                    valueDecimals = 1;
                    type = "spline";
                    break;
                case "MEAN5MINUTES":
                    valueDecimals = 3;
                    type = "spline";
                    break;
                case "BRIGHTNESS":
                    valueDecimals = 0;
                    type = "spline";
                    break;
                case "LEVEL":
                    type = "line";
                    step = "left";
                    unit = "%";
                    yAxis = 1;
                    valueDecimals = 2;
                    break;

                case "PRESS_SHORT":
                case "PRESS_LONG":
                case "PRESS_OPEN":
                case "MOTION":
                    yAxis = 1,
                        marker = {
                            enabled: true
                        };
                    factor = 5;
                    type = "scatter";
                    break;
                /*case "SETPOINT":
                    marker = {
                        enabled: true
                    };
                    valueDecimals = 1;
                    type = "line";
                    step = "left";
                    grouping = { enabled: false };

                    break;*/
                case "VALVE_STATE":
                    valueDecimals = 0;
                    type = "line";
                    step = "left";
                    grouping = { enabled: false };
                    unit = "%";
                    yAxis = 1;

                    break;
                default:
                    valueDecimals = 3;
                    type = "line";
                    step = "left";

            }

            if (chart.queryParams["percentaxis"] != "true") {
                yAxis = 0;
            }

            console.log(chart.logData[dp]);
            var serie = {
                chart: dp,
                name: name,
                type: type,
                step: step,
                yAxis: yAxis,
                marker: marker,
                valueDecimals: valueDecimals,
                valueSuffix: $("<div/>").html(unit).text(),
                visible: visible,
                pointWidth: 16,
                data: chart.logData[dp],
                events: {
                    click: function () {


                    },
                    legendItemClick: function () {


                    }
                }

            };
            if (grouping) {
                serie.dataGrouping = grouping;
            } else {
                //
            }

            if (chart.queryParams["grouping"] == "false") {
                console.log("disable grouping");
                serie.dataGrouping = {enabled:false};
            }
            if (chart.queryParams["area"] == "true") {
                if (serie.type == "spline") {
                    serie.type = "areaspline";
                }
            }

            // Serienoptionen
            /*
            var tmp = dp.split(".");
            if (chart.config.series[tmp[1]]) {
                serie = $.extend(true, serie, chart.config.series[tmp[1]]);
            }

            if (chart.config.series[dp]) {
                serie = $.extend(true, serie, chart.config.series[dp]);
            }
*/
            if (!navserie) {
                chart.chartOptions.series.push(serie);
            } else {
                switch (serie.type) {
                    case "line":
                        serie.type = "arealine";
                        break;
                    case "spline":
                        serie.type = "areaspline";
                        break;

                }
                console.log(serie);
                chart.chartOptions.navigator.series = serie;
            }


        },
        init: function () {

            // Verbindung zu CCU.IO herstellen.
            chart.socket = io.connect( $(location).attr('protocol') + '//' +  $(location).attr('host'));

            // Von CCU.IO empfangene Events verarbeiten
            chart.socket.on('event', function(obj) {
                //console.log(obj);
                // id = obj[0], value = obj[1], timestamp = obj[2], acknowledge = obj[3]

            });


            $(".chart-version").html(chart.version);
            $("#chart_skip").click(function () {

            });
            chart.initHighcharts();
            chart.loadData();

        }
    };

    function getUrlVars() {
        var vars = {}, hash;
        if (window.location.href.indexOf('?') == -1) { return {}; }
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for(var i = 0; i < hashes.length; i++)
        {
            hash = hashes[i].split('=');
            if (hash[0] && hash[0] != "") {
                vars[hash[0]] = hash[1];
            }
        }
        return vars;
    }



})(jQuery);
