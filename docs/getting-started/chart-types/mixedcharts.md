# Lovelace - graph-chartjs-card
<br>

## Mixed Chart Types

With graph-chartjs-card, it is possible to create mixed charts that are a combination of two or more different chart types. A common example is a bar chart that also includes a line dataset. When creating a mixed chart, we specify the chart type on each entity (dataset).

### Advanced Mixed Chart (Bar and Lines)

![mixedchart](img/mixedchart.png)<br>

#### Example

```yaml
- type: 'custom:chart-card'
  title: Gewichtsverlauf
  icon: 'mdi:scale'
  height: 360
  chart: line
  debug: true
  datascales:
    range: 82
    unit: day
    ignoreZero: true
  showstate: true
  chartOtions:
    plugins:
      legend:
        position: top
        display: true
    scales:
      x:
        title:
          display: true
          text: Zeitraum (Tage)
      left:
        title:
          display: true
          text: Gewicht / Muskeln
        ticks:
          autoSkip: true
          maxTicksLimit: 12
      right:
        title:
         
         display: true
          text: BMI
        gridLines:
          drawOnChartArea: false
        ticks:
          autoSkip: true
          maxTicksLimit: 16
  entities:
    - entity: sensor.peter_muskeln
      style:
        yAxisID: left
        type: line
    - entity: sensor.peter_gewicht
      style:
        yAxisID: left
        type: line
        backgroundColor: '#03a9f4'
        borderColor: '#03a9f4'
    - entity: sensor.peter_bmi
      style:
        yAxisID: right
        type: bar
        fill: true
        gradient:
          colors:
            - '#e74c3c'
            - '#ff5722'
            - '#ff9500'
```
<hr>

#### Drawing order

By default, datasets are drawn such that the first one is top-most. This can be altered by specifying order option to datasets. order defaults to 0. Note that this also affects stacking, legend, and tooltip. So it's essentially the same as reordering the datasets.
more info see: https://www.chartjs.org/docs/latest/charts/mixed.html#drawing-order