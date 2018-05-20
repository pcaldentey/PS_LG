// Ejecicio 2 global namespace
var EJ2 = { 
    data: {},
    not_grouped_data: [],
    url1: "http://s3.amazonaws.com/logtrust-static/test/test/data1.json",
    url2: "http://s3.amazonaws.com/logtrust-static/test/test/data2.json",
    url3: "http://s3.amazonaws.com/logtrust-static/test/test/data3.json",
    /*
     * This function formats json data from data*.json urls in a common format.
     * Group all info by category and adds all values from same date and same category,
     * storing results in EJ.data
     */
    extractData: function (values) {
        values.forEach(function(element) {
            // Formatting info
            // data1.json
            if (typeof element.d != "undefined" ) {
                var date = new Date(element.d);
                date_str = date.toISOString().split('T')[0];
                var category = element.cat.toUpperCase();
                var value = element.value;
            // data2.json
            } else if (typeof element.myDate != "undefined" ) {
                var date_str = element.myDate;
                var category = element.categ;
                var value = element.val;
            // data3.json
            } else {
                var m = element.raw.match(/.*(\d{4}-\d{2}-\d{2}).*#(.*)#/i);
                var date_str = m[1];
                var category = m[2];
                var value = element.val;
            }

            // Creates element in data object or add it to an existent one
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
            EJ2.not_grouped_data.push({'date': date_str, 'category':category, 'value':value});
        });
    },
    /*
     * Utility. This function makes ajax call and pass result to 'callback' function. In out case
     * extractData.
     */
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
    /*
     *  Draws Line chart. Receives layerId, title and formatted series with Highcharts requirements (data).
     */
    drawLineChart: function (layerId, title, data) {
        Highcharts.chart(layerId, {
            title: {
                text: title
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle'
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: { // don't display the dummy year
                    month: '%e. %b',
                    year: '%b'
                },
                title: {
                    text: 'Date'
                }
            },
            series: data,
        });
    },

    /*
     *  Draws Pie chart. Receives layerId, title and formatted series with Highcharts requirements (data).
     */
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
    /*
     * Formats series as required by Highcharts Line chart
     */
    getLineSeriesData: function () {
        var series = [];
        var data = [];

        for (var [key, obj] of Object.entries(EJ2.data)) {
            data = [];
            ordered_dates = Object.keys(EJ2.data[key]).sort();
            ordered_dates.forEach(function(element) {
                var d = new Date(element);
                data.push([ d.getTime(), parseFloat(EJ2.data[key][element]) ]);
            });
            series.push({ "name": key, "data": data });
        }

        return series;
    },
    /*
     * Formats series as required by Highcharts Pie chart
     */
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
    /*
     * Main function. It will be triggered once all content is loaded
     */
    run: function () {
        // Get, extract and group data from urls
        EJ2.ajaxCall(EJ2.url1, EJ2.extractData);
        EJ2.ajaxCall(EJ2.url2, EJ2.extractData);
        EJ2.ajaxCall(EJ2.url3, EJ2.extractData);

        // Draw charts
        EJ2.drawLineChart('lineContainer', 'Line Chart Ejercicio 2', EJ2.getLineSeriesData());
        EJ2.drawPieChart('pieContainer', 'Pie Chart Ejercicio 2', EJ2.getPieSeriesData());

        console.log(EJ2.data);
  //      console.log(Object.keys(EJ2.data).length);

       // setTimeout(function(){ 
       // console.log(Object.keys(EJ2.data));
        //}, 3000);
    },
}

// Run code on document ready
document.addEventListener('DOMContentLoaded', function() {
    EJ2.run();
}, false);

