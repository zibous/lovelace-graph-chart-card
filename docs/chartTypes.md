

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

