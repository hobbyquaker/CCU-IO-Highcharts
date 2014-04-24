/**
 *      CUxD-Highcharts Konfigurations-Datei
 *
 *      visualisiert CUxD Geräte-Logs mittels Highcharts
 *
 *      Copyright (c) 2013-2014 hobbyquaker https://github.com/hobbyquaker
 *
 *      Lizenz: CC BY-NC 3.0 http://creativecommons.org/licenses/by-nc/3.0/de/
 *
 *
 *      Die Veröffentlichung dieser Software erfolgt in der Hoffnung, daß sie Ihnen von Nutzen sein wird, aber
 *      OHNE IRGENDEINE GARANTIE, sogar ohne die implizite Garantie der MARKTREIFE oder der VERWENDBARKEIT FÜR EINEN
 *      BESTIMMTEN ZWECK.
 *
 *      Die Nutzung dieser Software erfolgt auf eigenes Risiko. Der Author dieser Software kann für eventuell
 *      auftretende Folgeschäden nicht haftbar gemacht werden!
 *
 */

var config = {

    standard: {
        type: "line",
        step: "left",
        yAxis: 0,
        marker: {
            enabled: false,
            states: {
                hover: {
                    enabled: true
                }
            }
        },
        valueDecimals: 3,
        pointWidth: 16,
        grouping: {
            enabled: false
        }
    },

    dpTypes: {
        "LEVEL": {
            yAxis: 1,
            valueDecimals: 0
        },
        STATE: {
            yAxis: 1,
            valueDecimals: 0,
            factor: 100,
            dataGrouping: {
                enabled: false
            }
        },
        SETPOINT: {
            marker: {
                enabled: true
            },
            dataGrouping: {
                enabled: false
            }
        },
        SET_TEMPERATURE: {
            marker: {
                enabled: true
            },
            dataGrouping: {
                enabled: false
            }
        },
        BRIGHTNESS: {
            type: "spline",
            step: null,
            valueDecimals: 0
        },
        "HUMIDITY": {
            type: "spline",
            step: null,
            yAxis: 1,
            valueDecimals: 0
        },
        "HUM_MAX_24H": {
            type: "spline",
            step: null,
            yAxis: 1,
            valueDecimals: 0
        },
        "HUM_MIN_24H": {
            type: "spline",
            step: null,
            yAxis: 1,
            valueDecimals: 0
        },
        "HUMIDITYF": {
            type: "spline",
            step: null,
            yAxis: 1,
            valueDecimals: 0
        },
        "VALVE_STATE": {
            valueDecimals: 0,
            yAxis: 1
        },
        "TEMPERATURE": {
            valueDecimals: 1,
            type: "spline",
            step: null
        },
        "ACTUAL_TEMPERATURE": {
            valueDecimals: 1,
            type: "spline",
            step: null
        },
        "PRESS_SHORT": {
            yAxis: 1,
            marker: {
                enabled: true
            },
            factor: 100,
            type: "scatter"
        },
        "PRESS_LONG": {
            yAxis: 1,
            marker: {
                enabled: true
            },
            factor: 100,
            type: "scatter"
        },
        "MOTION": {
            yAxis: 1,
            factor: 100
        },
        "MEAN5MINUTES": {
            type: "spline",
            step: null,
            valueDecimals: 3
        },
        "MEAN15MINUTES": {
            type: "spline",
            step: null,
            valueDecimals: 3
        },
        "METER": {
            type: "column",
            dataGrouping: {
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

            }
        }
    },

    // Nur zur Angabe von Faktoren
    channelDpTypes: {
        // Drehgriffsensor Faktor 50: gekippt = 50%, geöffnet = 100%
        "ROTARY_HANDLE_SENSOR": {
            "STATE": {
                factor: 50
            }
        }
    }
};

