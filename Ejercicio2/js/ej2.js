// Ejecicio 2 global namespace
var EJ2 = { 
    data: {},
    notgroupeddata: [],
    url1: "http://s3.amazonaws.com/logtrust-static/test/test/data1.json",
    url2: "http://s3.amazonaws.com/logtrust-static/test/test/data2.json",
    url3: "http://s3.amazonaws.com/logtrust-static/test/test/data3.json",
    extractData: function (values) {
        values.forEach(function(element) {
            if (typeof element.d != "undefined" ) {
                var date = new Date(element.d);
                date_str = date.toISOString().split('T')[0];
                var category = element.cat.toUpperCase();
                var value = element.value;
            } else if (typeof element.myDate != "undefined" ) {
                var date_str = element.myDate;
                var category = element.categ;
                var value = element.val;
            } else {
                var m = element.raw.match(/.*(\d{4}-\d{2}-\d{2}).*#(.*)#/i);
                var date_str = m[1];
                var category = m[2];
                var value = element.val;
            }
            if (EJ2.data[category] != undefined) {
                if (EJ2.data[category][date_str] != undefined) {
                    EJ2.data[category][date_str] = EJ2.data[category][date_str] + value;
                } else {
                    EJ2.data[category][date_str] = value;
                }

            } else {
                EJ2.data[category] = {};
                EJ2.data[category][date_str] = value;

            }
            EJ2.notgroupeddata.push({'date': date_str, 'category':category, 'value':value});
        });
    },
    ajaxCall: function (url ,callback) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
                if (xmlhttp.status == 200) {
                    callback(JSON.parse(xmlhttp.responseText));
                } else if (xmlhttp.status == 400) {
                    alert('There was an error 400');
                } else {
                    alert('something else other than 200 was returned');
                }
            }
        };

        xmlhttp.open("GET", url, false);
        xmlhttp.send();
    },
    drawLineChart: function () {
        Highcharts.chart('container', {
            title: {
                text: 'Solar Employment Growth by Sector, 2010-2016'
            },
            subtitle: {
                text: 'Source: thesolarfoundation.com'
            },
            yAxis: {
                title: {
                    text: 'Number of Employees'
                }
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle'
            },
            plotOptions: {
                series: {
                    label: {
                        connectorAllowed: false
                    },
                    pointStart: 2010
                }
            },
            series: [{
                name: 'Installation',
                data: [43934, 52503, 57177, 69658, 97031, 119931, 137133, 154175]
            }, {
                name: 'Manufacturing',
                data: [24916, 24064, 29742, 29851, 32490, 30282, 38121, 40434]
            }],

            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        legend: {
                            layout: 'horizontal',
                            align: 'center',
                            verticalAlign: 'bottom'
                        }
                    }
                }]
            }
        });
    },
    drawPieChart: function (layerId, title, data) {
        Highcharts.chart(layerId, {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: title
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        }
                    }
                }
            },
            series: [{
                name: 'Percentage',
                colorByPoint: true,
                data: data 
            }]
        });
    },
    getPieSeriesData: function () {
        var total = 0;
        var total_serie = 0;
        var data = [];
        var series = [];

        for (var [key, obj] of Object.entries(EJ2.data)) {
            for (var [date, value] of Object.entries(EJ2.data[key])) {
                total = total + value;
                total_serie = total_serie + value;
            }
            data.push({ "name": key, "total": total_serie});
            total_serie = 0;
        }

        data.forEach(function(element, index) {
            percentage = (element.total/total) * 100
            if (index == 0) {
                series.push({ "name": element.name, "y": parseFloat(percentage.toFixed(2)), "sliced": true , "selected": true});
            } else {
                series.push({ "name": element.name, "y": parseFloat(percentage.toFixed(2))});
            }
        });
        return series;
    },
    run: function () {
        // Get, extract and group data from urls
        EJ2.ajaxCall(EJ2.url1, EJ2.extractData);
        EJ2.ajaxCall(EJ2.url2, EJ2.extractData);
        EJ2.ajaxCall(EJ2.url3, EJ2.extractData);

        // Draw charts
        EJ2.drawPieChart('pieContainer', 'Pie Chart Ejercicio 2', EJ2.getPieSeriesData());

    },
}

// Run code on document ready
document.addEventListener('DOMContentLoaded', function() {
    EJ2.run();
}, false);

