/**
 *      CUxD-Highcharts
 *
 *      visualisiert CCU.IO Logs mittels Highcharts
 *
 *      Copyright (c) 2013-2014 hobbyquaker https://github.com/hobbyquaker
 *
 *      Lizenz: CC BY-NC 3.0 http://creativecommons.org/licenses/by-nc/3.0/de/
 *
 *      Die Veröffentlichung dieser Software erfolgt in der Hoffnung, daß sie Ihnen von Nutzen sein wird, aber
 *      OHNE IRGENDEINE GARANTIE, sogar ohne die implizite Garantie der MARKTREIFE oder der VERWENDBARKEIT FÜR EINEN
 *      BESTIMMTEN ZWECK.
 *
 */

(function ($) {

    $(document).ready(function () {
        var params = getUrlHashVars();
        var startLink = "?";
        for (var param in params) {
            if (param == "dp" || param == "navserie") {
                continue;
            }
            $("select#"+param+" option:selected").removeAttr("selected");
            $("select#"+param+" option[value='"+params[param]+"']").attr("selected", true);
            startLink += "&"+param+"="+params[param];
        }
        $(".link").attr("href", startLink);

        $(".chart-version").html(chart.version);
        $("#credits").html("<a target='_blank' href='https://github.com/hobbyquaker/CCU.IO-Highcharts'>CCU.IO-Highcharts</a> " + chart.version + " copyright (c) 2013 - 2014<a target='_blank' href='http://hobbyquaker.github.io/'>hobbyquaker</a>  - " + chart.translate("License") + ": <a target='_blank' href='http://creativecommons.org/licenses/by-nc/3.0/" + chart.lang + "/'>CC BY-NC 3.0</a>  - " + chart.translate("Used") + " <a target='_blank' href='http://www.highcharts.com'>Highstock</a> - " + chart.translate("only for noncommercial purposes!")).
            attr("href", "https://github.com/hobbyquaker/CCU-IO-Highcharts");

        var link = window.location.href.replace(/menu\.html/, '?');

        $("select.simple").multiselect({
            multiple: false,
            header: false,
            //noneSelectedText: "Select an Option",
            selectedList: 1
        });

        $("a.link:first" ).button({
            icons: {
                primary: "ui-icon-newwin"
            }
        });
        $("select").change(function () {
            var val = [];
            $(this).find("option:selected").each(function() {
                val.push($(this).val());
            });
            updateLink($(this).attr("id"), val.join(","));
        });

        $(".link").attr("href", link );

        // Verbindung zu CCU.IO herstellen.
        chart.socket = io.connect( $(location).attr('protocol') + '//' +  $(location).attr('host') + '?key=' + socketSession);

        chart.socket.emit('getSettings', function (ccuIoSettings) {
            if (ccuIoSettings.version < chart.requiredCcuIoVersion) {
                alert("Warning: requires CCU.IO version "+chart.requiredCcuIoVersion+" - found CCU.IO version "+ccuIoSettings.version+" - please update CCU.IO.");
            }
            startMenu();
        });

        function startMenu() {
            chart.socket.emit('getObjects', function(obj) {
                chart.regaObjects = obj;
                // Weiter gehts mit dem Laden des Index
                chart.socket.emit('getIndex', function(obj) {
                    chart.regaIndex = obj;

                    chart.ajaxDone();

                    for (var i = 0; i < chart.regaIndex.VARDP.length; i++) {
                        var id = chart.regaIndex.VARDP[i];
                        if (!chart.regaObjects[id]) {
                            continue;
                        }
                        $("#dp").append("<option value='"+id+"'>VARDP "+chart.regaObjects[id].Name+"</option>");
                        $("#navserie").append("<option value='"+id+"'>VARDP "+chart.regaObjects[id].Name+"</option>");
                    }

                    for (var i = 0; i < chart.regaIndex.HSSDP.length; i++) {
                        var id = chart.regaIndex.HSSDP[i];

                        if (!chart.regaObjects[id]) {
                            continue;
                        }


                        var unit = "";
                        if (chart.regaObjects[id].ValueUnit) {
                            unit = " ["+chart.regaObjects[id].ValueUnit+"]";
                        }
                        var tmp = chart.regaObjects[id].Name.split(".");
                        var dpName = tmp[2];

                        var chId = chart.regaObjects[id].Parent;
                        var chName = "";

                        if (chId && chart.regaObjects[chId]) {
                            chName = chart.regaObjects[chId].Name || "";
                        }

                        $("#dp").append("<option value='"+id+"'>HSSDP "+chName+" "+dpName+unit+"</option>");
                        $("#navserie").append("<option value='"+id+"'>HSSDP "+chName+" "+dpName+unit+"</option>");
                    }

                    if (params.dp) {
                        var selectedDPs = params.dp.split(",");
                        for (var k = 0; k < selectedDPs.length; k++) {
                            $("select#dp option[value='"+selectedDPs[k]+"']").attr("selected", true);
                        }

                    }
                    if (params.navserie) {
                        $("select#navserie option[value='"+params.navserie+"']").attr("selected", true);
                    }

                    $("#dp").multiselect({
                        minWidth: 462,
                        height: 260,
                        noneSelectedText: chart.translate("Series: none selected"),
                        selectedText: chart.translate("Series: # selected"),

                        checkAllText: chart.translate("select all"),
                        uncheckAllText: chart.translate("clear selection")
                    }).multiselectfilter({
                        placeholder: "",
                        label: chart.translate("Filter:")
                    });

                    $("#navserie").multiselect({
                        minWidth: 462,
                        height: 260,
                        noneSelectedText: chart.translate("Navigator: -"),
                        selectedText: function(numChecked, numTotal, checkedItems){
                            return chart.translate("Navigator:") + " " + checkedItems[0].title;
                        },
                        multiple: false
                    }).multiselectfilter({
                        placeholder: "",
                        label: chart.translate("Filter:")
                    });

                    $("#loader_small").hide();

                });
            });
        }


        function updateLink(id, val) {
            link = link.replace((new RegExp("&?"+id+"=?[^&]*")), "");

            if (val && val != "") {
                if (link.slice(-1) != "?" && link.slice(-1) != "&") {
                    link = link + "&";
                }
                link = link + id + "=" + val;
            }
            link = link.replace(/#/, "");
            $(".link").attr("href", link );
            window.location.href = link.replace(/\/\?/,"/menu.html#");
        };

        function getUrlHashVars() {
            if (window.location.href.indexOf('#') == -1) { return {}; }
            var vars = {}, hash;
            var hashes = window.location.href.slice(window.location.href.indexOf('#') + 1).split('&');
            for(var i = 0; i < hashes.length; i++) {
                hash = hashes[i].split('=');
                if (hash[0] && hash[0] != "") {
                    vars[hash[0]] = hash[1];
                }
            }
            return vars;
        }

    });

})(jQuery);