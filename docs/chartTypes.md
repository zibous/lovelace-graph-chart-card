

# Config

```javascript
var config = {

        type: 'line',

        data: {
            labels: [...],
            datasets: [{
                label: '...',
                backgroundColor: window.chartColors.red,
                borderColor: window.chartColors.red,
                data: [...],
                fill: false,
            }, {
                label: '...',
                fill: false,
                backgroundColor: window.chartColors.blue,
                borderColor: window.chartColors.blue,
                data: [....],
            }]
        },

        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Grid Line Settings'
            },
            scales: {
                y: {
                    gridLines: {
                        drawBorder: false,
                        color: function(context) {
                            if (context.tick.value > 0) {
                                return window.chartColors.green;
                            } else if (context.tick.value < 0) {
                                return window.chartColors.red;
                            }

                            return '#000000';
                        },
                    },
                }
            }
        }
    };
```

## Bar Chart

### Vertical

### Horizontal

### Multi axis

### Stacked

### Stacked group


## Line Chart
### Basic
see: https://www.chartjs.org/samples/latest/charts/line/basic.html

### Multi axis
see: https://www.chartjs.org/samples/latest/charts/line/multi-axis.html

### Stepped
```
steppedLine: false      ## 'No Step Interpolation',
steppedLine: true       ## 'Step Before Interpolation'
steppedLine: 'before'   ## 'Step Before Interpolation'
steppedLine: 'after'    ## 'Step After Interpolation'
steppedLine: 'middle'   ## 'Step Middle Interpolation'
````

```javascript
datasets: [{
    label: 'steppedLine: ' + details.steppedLine,
    steppedLine: **steppedLine**,
    data: data,
    borderColor: details.color,
    fill: false,
}]
```
see: https://www.chartjs.org/samples/latest/charts/line/stepped.html

### Interpolation

``` javascript
    datasets: [{
        label: 'Cubic interpolation (monotone)',
        data: datapoints,
        borderColor:'red',
        backgroundColor: 'rgba(0, 0, 0, 0)',
        fill: false,

        cubicInterpolationMode: 'monotone'  ##!!!

    }, {
        label: 'Cubic interpolation (default)',
        data: datapoints,
        borderColor: 'blue',
        backgroundColor: 'rgba(0, 0, 0, 0)',
        fill: false,

    }, {
        label: 'Linear interpolation',
        data: datapoints,
        borderColor: 'green',
        backgroundColor: 'rgba(0, 0, 0, 0)',
        fill: false,

        lineTension: 0  ##!!!

    }]
```                
see: https://www.chartjs.org/samples/latest/charts/line/interpolation-modes.html

## Area charts

## Doughnut

## Pie

```json
{
  "labels": [
    "Eiweis",
    "Fett",
    "Kohlenhydrate"
  ],
  "datasets": [
    {
      "data": [
        "875.0",
        "375.0",
        "1250.0"
      ],
      "borderWidth": 0,
      "hoverBorderWidth": 0,
      "pointRadius": 0,
      "fill": true,
      "unit": "",
      "mode": "current"
    }
  ]
}
```

## Line

```json
{
  "labels": [
    "2020-10-27",
    "2020-10-28",
    "2020-10-29",
    "2020-10-30",
    "2020-10-31",
    "2020-11-01"
  ],
  "datasets": [
    {
      "label": "Peter Muskeln",
      "borderWidth": 3,
      "hoverBorderWidth": 0,
      "fill": false,
      "unit": "%",
      "data": [
        "53.16",
        "52.38",
        "53.31",
        "52.41",
        "52.36",
        "52.49"
      ],
      "minval": 52.36,
      "maxval": 53.31,
      "current": "52.49",
      "mode": "history",
      "entity": "sensor.peter_muskeln",
      "yAxisID": "left",
      "type": "line",
      "name": "Peter Muskeln",
      "last_changed": "2020-11-01T05:23:21.010932+00:00",
      "state": "52.49"
    },
    {
      "label": "Peter Gewicht",
      "borderWidth": 3,
      "hoverBorderWidth": 0,
      "fill": false,
      "unit": "kg",
      "data": [
        "68.40",
        "68.35",
        "68.05",
        "68.55",
        "68.30",
        "68.55"
      ],
      "minval": 68.05,
      "maxval": 68.55,
      "current": "68.55",
      "mode": "history",
      "entity": "sensor.peter_gewicht",
      "yAxisID": "left",
      "type": "line",
      "name": "Peter Gewicht",
      "last_changed": "2020-11-01T05:23:20.979816+00:00",
      "state": "68.55"
    },
    {
      "label": "Peter BMI",
      "borderWidth": 0,
      "hoverBorderWidth": 0,
      "fill": false,
      "unit": "kg/㎡",
      "data": [
        "22.33",
        "22.32",
        "22.22",
        "22.38",
        "22.30",
        "22.38"
      ],
      "minval": 22.22,
      "maxval": 22.38,
      "current": "22.38",
      "mode": "history",
      "entity": "sensor.peter_bmi",
      "yAxisID": "right",
      "type": "bar",
      "backgroundColor": "#5ac8fa",
      "borderColor": "#ff9500",
      "name": "Peter BMI",
      "last_changed": "2020-11-01T05:23:21.009204+00:00",
      "state": "22.38"
    }
  ]
}
```
## Polar area

## Radar

## Combo bar/line
see: https://www.chartjs.org/samples/latest/charts/combo-bar-line.html


## Open
### Scatter
### Scatter - Multi axis
### Bubble Chart


## Install beta
npm install chart.js@next --save

