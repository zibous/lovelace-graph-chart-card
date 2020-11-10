

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

## Pie & Doughnut

#### Data Structure

For a pie chart, datasets need to contain an array of data points.  The data points should be a number, Chart.js will total all of the  numbers and calculate the relative proportion of each.

You also need to specify an array of labels so that tooltips appear correctly.

```javascript
data = {
    datasets: [{
        data: [10, 20, 30]
    }],

    // These labels appear in the legend and in the tooltips when hovering different arcs
    labels: [
        'Red',
        'Yellow',
        'Blue'
    ]
};
```





## Line

#### Data Structure

The `data` property of a dataset for a line chart can be passed in two formats.

### number[]

```javascript
data: [20, 10]
```

When the `data` array is an array of numbers, the x axis is generally a [category](https://www.chartjs.org/docs/latest/axes/cartesian/category.html#category-cartesian-axis). The points are placed onto the axis using their position in the array. When a line chart is created with a category axis, the `labels` property of the data object must be specified.





## Polar area

#### Data Structure

For a polar area chart, datasets need to contain an array of data  points. The data points should be a number, Chart.js will total all of  the numbers and calculate the relative proportion of each.

You also need to specify an array of labels so that tooltips appear correctly for each slice.

```javascript
data = {
    datasets: [{
        data: [10, 20, 30]
    }],

    // These labels appear in the legend and in the tooltips when hovering different arcs
    labels: [
        'Red',
        'Yellow',
        'Blue'
    ]
};
```



## Radar

#### Data Structure

The `data` property of a dataset for a radar chart is  specified as an array of numbers. Each point in the data array  corresponds to the label at the same index.

```javascript
data: [20, 10]
```

For a radar chart, to provide context of what each point means, we  include an array of strings that show around each point in the chart.

```javascript
data: {
    labels: ['Running', 'Swimming', 'Eating', 'Cycling'],
    datasets: [{
        data: [20, 10, 4, 2]
    }]
}
```

## Combo bar/line
see: https://www.chartjs.org/samples/latest/charts/combo-bar-line.html


## Open
### Scatter

#### Data Structure

Unlike the line chart where data can be supplied in two different  formats, the scatter chart only accepts data in a point format.

```javascript
data: [{
        x: 10,
        y: 20
    }, {
        x: 15,
        y: 10
    }]
```

### Bubble Chart

#### Data Structure

Bubble chart datasets need to contain a `data` array of points, each points represented by an object containing the following properties:

```javascript
{
    // X Value
    x: number,

    // Y Value
    y: number,

    // Bubble radius in pixels (not scaled).
    r: number
}
```

**Important:** the radius property, `r` is **not** scaled by the chart, it is the raw radius in pixels of the bubble that is drawn on the canvas.


## Install beta
npm install chart.js@next --save

