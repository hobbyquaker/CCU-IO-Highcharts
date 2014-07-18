/**
 *      CCU.IO-Highcharts
 *
 *      visualisiert CCU.IO Logs mittels Highcharts
 *
 *      Copyright (c) 2013-2014 hobbyquaker https://github.com/hobbyquaker
 *
 *      Lizenz: CC BY-NC 3.0 http://creativecommons.org/licenses/by-nc/3.0/de/
 *
 *      Die verwendete Highcharts/Highstock Bibliothek erlaubt keine kommerzielle Nutzung!
 *      http://shop.highsoft.com/highstock.html
 *
 *      Die Veröffentlichung dieser Software erfolgt in der Hoffnung, daß sie Ihnen von Nutzen sein wird, aber
 *      OHNE IRGENDEINE GARANTIE, sogar ohne die implizite Garantie der MARKTREIFE oder der VERWENDBARKEIT FÜR EINEN
 *      BESTIMMTEN ZWECK.
 *
 */

;var chart; 

(function ($) {

    chart = {
        version: "1.1.4",
        requiredCcuIoVersion: "1.0.15",
        socket: null,
        regaObjects: {},
        regaIndex: {},
        oldLogs: [],
        logData: {},
        chart: undefined,
        chartOptions: {},
        customOptions: {},
        seriesIds: [],
        queryParams: getUrlVars(),
        start: "0000-00-00T00:00:00",
        done: false,
        ready: false,
        progressDone: 0,
        progressTodo: 100,
        renderChart: function () {
            chart.chart = new Highcharts.StockChart(chart.chartOptions);
            // Add yAxis Labels

            for (var index = 0, l = chart.chart.series.length; index < l; index++) {

                var name = chart.chart.series[index].options.name;
                var axis = chart.chart.series[index].options.yAxis;

                if (axis == "navigator-y-axis") continue;

                console.log(name+" yAxis="+axis);
                var unit = name.split(" ");
                unit = unit[unit.length-1];

                chart.chart.yAxis[axis].update({
                    title: {
                        text: unit,
                        style: {
                            color: chart.chart.series[index].options.color
                        }
                    }
                });

            }
            chart.chart.redraw();

            chart.ready = true;
        },
        initHighcharts: function () {

            if (chart.queryParams["theme"]) {
                $.getScript('/lib/js/highstock/themes/' + chart.queryParams.theme+".js", function () {
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
                var now = Math.floor(new Date().getTime() / 1000);
                chart.start = now - (parseInt(chart.queryParams["period"], 10) * 3600);
                chart.progressTodo = Math.ceil(parseFloat(chart.queryParams["period"]) / 24) + 4;
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
                        if (dpObj && dpObj.Parent) {
                            tmpName = chart.regaObjects[dpObj.Parent].Name+"<br/>"+chart.regaObjects[this.series.options.chart].Name;
                        } else {

                            tmpName = chart.regaObjects[this.series.options.chart].Name;
                        }

                        return '<b>'+tmpName + '</b><br>' + // return stored text
                            date + ': <b>' + val + unit + "</b>";

                    }
                },
                series: []
            };

            //if (chart.queryParams["secondaxis"] == "true") {
                chart.chartOptions.yAxis.push({
                    title: {
                        text: ""
                    },
                    labels: {
                        useHTML: true,
                        formatter: function() {
                            return this.value;
                        }
                    },
                    opposite: true
                });/*
                chart.chartOptions.yAxis.push({
                    title: {
                        text: ""
                    },
                    labels: {
                        useHTML: true,
                        formatter: function() {
                            return this.value;
                        }
                    },
                    opposite: true
                });*/
            //}

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
                        text : '1Y'
                    }],
                    selected : selectedRange,
                    inputEnabled : true
                };
            }
            if (chart.queryParams["zoom"] == "false") {
                chart.chartOptions.chart.zoomType = undefined;
            }

        },
        loadLog: function (log, callback) {
            $("#loader_output2").prepend("<span class='ajax-loader'></span> lade "+log+" ");

            if (log.match(/log$/)) {
                log = log + "?" + (new Date().getTime());
            }

            $.ajax({
                type: "GET",
                url: '/log/'+log,
                success: function (data) {
                    chart.progressDone += 1;
                    chart.progress();
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

                            if (chart.regaObjects[triple[1]]) {

                                var nameArr = chart.regaObjects[triple[1]].Name.split(".");

                                if (chart.regaObjects[triple[1]].Parent) {

                                    if (config.channelDpTypes[chart.regaObjects[chart.regaObjects[triple[1]].Parent].HssType] && config.channelDpTypes[chart.regaObjects[chart.regaObjects[triple[1]].Parent].HssType][nameArr[2]] && config.channelDpTypes[chart.regaObjects[chart.regaObjects[triple[1]].Parent].HssType][nameArr[2]].factor) {
                                        val = val * config.channelDpTypes[chart.regaObjects[chart.regaObjects[triple[1]].Parent].HssType][nameArr[2]].factor;
                                    } else {
                                        if (nameArr[2] && config.dpTypes[nameArr[2]] && config.dpTypes[nameArr[2]].factor) {
                                            val = val * config.dpTypes[nameArr[2]].factor;
                                        }

                                    }

                                } else {

                                    if (nameArr[2] && config.dpTypes[nameArr[2]] && config.dpTypes[nameArr[2]].factor) {
                                        val = val * config.dpTypes[nameArr[2]].factor;
                                    }

                                }

                                if (chart.regaObjects[triple[1]].ValueUnit == "100%") {
                                    val = val * 100;
                                }

                            }

                            if (isNaN(val)) {
                                val = 0;
                            }

                            if (!isNaN(triple[0])) {
                                if (triple[0] >= (chart.start)) {
                                    tmpArr[triple[1]].push([triple[0]*1000, val]);
                                } else {
                                    chart.done = true;
                                }

                            }

                        }

                        if (!isNaN(triple[0]) && triple[0] != 0 && triple[0] != "") {
                            if (triple[0] < (chart.start)) {
                                chart.done = true;
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
                }
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

                chart.progressDone += 1;
                chart.progress();

                chart.renderChart();

            }

        },
        parseDate: function (ts) {
            var ts = new Date(ts);
            return ts;
        },
        loadData: function () {
            $("#loader_output2").prepend("<span class='ajax-loader'></span> lade Objekte");
            if (chart.socket) {
                chart.socket.emit('getObjects', function(obj) {
                    chart.progressDone += 1;
                    chart.progress();

                    chart.regaObjects = obj;
                    chart.ajaxDone();
                    $("#loader_output2").prepend("<span class='ajax-loader'></span> lade Index");
                    // Weiter gehts mit dem Laden des Index
                    chart.socket.emit('getIndex', function(obj) {
                        chart.progressDone += 1;
                        chart.progress();

                        chart.regaIndex = obj;

                        chart.ajaxDone();
                        $("#loader_output2").prepend("<span class='ajax-loader'></span> frage vorhandene Logs ab");

                        // alte Logfiles finden
                        chart.socket.emit('readdir', "log", function (obj) {
                            chart.ajaxDone();
                            chart.progressDone += 1;
                            chart.progress();

                            var files = [];
                            if (!chart.queryParams["period"] || parseFloat(chart.queryParams["period"]) == 0) {
                                chart.progressTodo = obj.length + 1;
                            }
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
            } else {
                // local
                // Load from ../datastore/local-data.json the demo views
                $.ajax({
                    url: '../datastore/local-data.json',
                    type: 'get',
                    async: false,
                    dataType: 'text',
                    cache: true,
                    success: function (data) {
                        chart.ajaxDone();
                        chart.progressDone += 1;
                        chart.progress();

                        var _localData = $.parseJSON(data);
                        chart.regaIndex   = _localData.metaIndex;
                        chart.regaObjects = _localData.metaObjects;
                        chart.loadLog("devices-variables.log", chart.loadOldLogs);
                    },
                    error: function (state) {
                        console.log(state.statusText);
                    }
                });
            }
        },
        ajaxDone: function () {
            $(".ajax-loader").removeClass("ajax-loader").addClass("ajax-check");
            $("#loader_output2").prepend("<br/>\n");

        },
        addSeries: function (dp, navserie) {

            var visible = true,
                name,
                dptype,
                regaObj = chart.regaObjects[dp];

            if (regaObj) {
                var chId = regaObj.Parent;
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
                if (regaObj) {
                    name = regaObj.Name;
                } else {
                    name = dp;
                }
                dptype = undefined;
            }

            if (chart.regaObjects[dp]) {
                unit = chart.regaObjects[dp].ValueUnit;
                if (unit == "100%") { unit = "%"; }
            }

            var serie = $.extend(true, {
                chart: dp,
                id: "chart_"+dp.toString(),
                name: name,
                valueSuffix: $("<div/>").html(unit).text(),
                visible: visible,
                data: chart.logData[dp],
                events: {
                    click: function (e) {
                        var id = e.currentTarget.options.chart;
                        var obj = chart.chart.series[chart.seriesIds.indexOf(id)];

                        console.log(obj);

                        $("#series_index").val(chart.seriesIds.indexOf(id));
                        $("#series_dp").val(id);

                        $("#color").val(obj.color);

                        $("#lineWidth").val(obj.options.lineWidth);

                        $("#grouping option").removeAttr("selected");
                        if (obj.options.dataGrouping.enabled === false) {
                            $("#grouping option[value='false']").attr("selected", true);
                        } else {
                            $("#grouping option[value='"+obj.options.dataGrouping.approximation+"']").attr("selected", true);
                        }

                        $("#axis option").removeAttr("selected");
                        $("#axis option[value='"+obj.options.yAxis+"']").attr("selected", true);

                        if (obj.options.step === null) {
                            $("#step option[value='null']").attr("selected", true);
                        } else {
                            $("#step option[value='"+obj.options.step+"']").attr("selected", true);
                        }

                        $("#lineType option").removeAttr("selected");
                        $("#lineType option[value='"+obj.options.type+"']").attr("selected", true);

                        $("#marker option").removeAttr("selected");
                        $("#marker option[value='"+obj.options.marker.enabled+"']").attr("selected", true);

                        $("#seriesName").html(name+ "<br/>"+chart.regaObjects[id].Name+" ("+id+")");
                        $("#edit_dialog").dialog("open");

                    },
                    legendItemClick: function () {


                    }
                }

            }, config.standard);

            if (config.dpTypes[dptype]) {
                serie = $.extend(serie, config.dpTypes[dptype]);
            }

            if (chart.queryParams["grouping"] == "false") {
                serie.dataGrouping = {enabled:false};
            }

            if (chart.queryParams["area"] == "true") {
                if (serie.type == "spline") {
                    serie.type = "areaspline";
                }
            }

            if (!navserie) {
                serie = $.extend(true, serie, chart.customOptions[dp]);

                chart.chartOptions.series.push(serie);
                chart.seriesIds.push(dp);
            } else {
                switch (serie.type) {
                    case "line":
                        serie.type = "area";
                        break;
                    case "spline":
                        serie.type = "areaspline";
                        break;

                }
                chart.chartOptions.navigator.series = serie;

            }
        },
        connect: function () {
            $(".progressbar").progressbar({
                value: 0
            }).height(16);

            if (typeof io !== 'undefined') {
                // Verbindung zu CCU.IO herstellen.
                chart.socket = io.connect( $(location).attr('protocol') + '//' +  $(location).attr('host') + '?key=' + socketSession);

                chart.socket.on('connect', function() {
                    chart.progressDone += 1;
                    chart.progress();
                });

                chart.socket.emit('getSettings', function (ccuIoSettings) {
                    if (ccuIoSettings.version < chart.requiredCcuIoVersion) {
                        alert("Warning: requires CCU.IO version "+chart.requiredCcuIoVersion+" - found CCU.IO version "+ccuIoSettings.version+" - please update CCU.IO.");
                    }
                    chart.init();
                });
            } else {
                // Offline mode
                chart.init();
            }
        },
        init: function () {



            // Von CCU.IO empfangene Events verarbeiten
            if (chart.queryParams["live"] != "false") {

                chart.socket.on('event', function(obj) {
                    if (chart.ready) {
                        // id = obj[0], value = obj[1], timestamp = obj[2], acknowledge = obj[3], lastchange = obj[4]
                        // addPoint (Object options, [Boolean redraw], [Boolean shift], [Mixed animation])

                        var id = obj[0].toString();
                        var uchart = chart.chart.get("chart_"+id);

                        if (uchart) {
                            var tmp = obj[2].split(" ");
                            var dateArr = tmp[0].split("-");
                            var timeArr = tmp[1].split(":");
                            var ts = (new Date(dateArr[0], dateArr[1]-1, dateArr[2], timeArr[0], timeArr[1], timeArr[2])).getTime();
                            var val = obj[1];
                            if (val == true || val == "true") { val = 1; }
                            if (val == false || val == "false") { val = 0; }
                            val = parseFloat(val);
                            if (isNaN(val)) { val = 0; }
                            uchart.addPoint([ts,val]);
                        }
                    }
                });
            }

            $(".chart-version").html(chart.version);
            $("#chart_skip").click(function () {

            });

            if (chart.socket) {
                chart.socket.emit("readFile", "highcharts-options.json", function (data) {
                    if (data) {
                        chart.customOptions = data;
                    }
                    chart.initHighcharts();
                    chart.loadData();
                });
            } else {
                chart.initHighcharts();
                chart.loadData();
            }

        },
        progress: function () {
            //console.log("todo="+chart.progressTodo+" done="+chart.progressDone);
            var progressPercent = Math.floor(100 / (chart.progressTodo / chart.progressDone));
            if (!isFinite(progressPercent)) { progressPercent = 0; }
            //console.log("progress "+progressPercent);
            if (progressPercent > 100) { progressPercent = 100; }
            $(".progressbar").progressbar("value", progressPercent );
        }
    };

    function getUrlVars() {
        var vars = {}, hash;
        if (window.location.href.indexOf('?') == -1) { return {}; }
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for(var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            if (hash[0] && hash[0] != "") {
                vars[hash[0]] = hash[1];
            }
        }
        return vars;
    }

    $("#edit_dialog").dialog({
        width: 420,
        autoOpen: false,
        modal: true,
        buttons: [
            {
                text: "Speichern",
                click: function () {
                    var index = $("#series_index").val();
                    var dp = $("#series_dp").val();
                    chart.chart.series[index].options.type = $("#lineType option:selected").val();
                    chart.chart.series[index].options.marker.enabled = ($("#marker option:selected").val() == "true" ? true : false);
                    chart.chart.series[index].options.dataGrouping.enabled = ($("#grouping option:selected").val() == "false" ? false : true);
                    chart.chart.series[index].options.dataGrouping.approximation = ($("#grouping option:selected").val() == "false" ? undefined : $("#grouping option:selected").val());
                    chart.chart.series[index].options.step = ($("#step option:selected").val() == "false" ? undefined : $("#step option:selected").val());
                    chart.chart.series[index].options.color = $("#color").val();
                    chart.chart.series[index].options.states.hover.lineWidth = $("#lineWidth").val();
                    chart.chart.series[index].options.lineWidth = $("#lineWidth").val();

                    var axis = parseInt($("#axis option:selected").val(), 10);

                    chart.chart.series[index].options.yAxis = axis;

                    var name = chart.chart.series[index].options.name;
                    var unit = name.split(" ");
                    unit = unit[unit.length-1];

                    chart.chart.yAxis[axis].update({
                        title: {
                            text: unit,
                            style: {
                                color: chart.chart.series[index].options.color
                            }
                        } 
                    });

                    chart.chart.series[index].update(chart.chart.series[index].options);

                    if (!chart.customOptions[dp]) {
                        chart.customOptions[dp] = {};
                    }

                    chart.customOptions[dp].type = chart.chart.series[index].options.type;
                    chart.customOptions[dp].marker = {enabled: chart.chart.series[index].options.marker.enabled};
                    chart.customOptions[dp].dataGrouping = {
                        enabled: chart.chart.series[index].options.dataGrouping.enabled,
                        approximation: chart.chart.series[index].options.dataGrouping.approximation
                    };
                    chart.customOptions[dp].step = chart.chart.series[index].options.step;
                    chart.customOptions[dp].color = chart.chart.series[index].options.color;
                    chart.customOptions[dp].lineWidth = chart.chart.series[index].options.lineWidth;
                    chart.customOptions[dp].states = {
                        hover: {
                            lineWidth: chart.chart.series[index].options.states.hover.lineWidth
                        }
                    };

                    chart.customOptions[dp].yAxis = parseInt($("#axis option:selected").val(), 10);


                    if (chart.socket) {
                        chart.socket.emit("writeFile", "highcharts-options.json", chart.customOptions);
                    } else {
                        window.alert('Settings did not saved!');
                    }

                    $("#edit_dialog").dialog("close");
                }
            },/*
            {
                text: "Zurücksetzen",
                click: function () {
                    if (chart.customOptions[dp]) {
                        var dp = $("#series_dp").val();
                        delete chart.customOptions[dp];
                        chart.socket.emit("writeFile", "highcharts-options.json", chart.customOptions);
                    }
                    // Todo Default Values wiederherstellen und Chart updaten
                    $("#edit_dialog").dialog("close");
                }
            },*/
            {
                text: "Abbrechen",
                click: function () {
                    $("#edit_dialog").dialog("close");
                }
            }

        ]
    });

})(jQuery);
