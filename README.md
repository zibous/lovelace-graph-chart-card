# Lovelace - graph-chartjs-card
Chart.js card for Home Assistant -  Visualize your data in 8 different ways; each of them animated and customisable.

#DEVELOPER PREVIEW VERSION

![](docs/graph-chartjs-card.png)

## Requirements

- Home Assistant 0.116.4
  - Frontend-Version: 20201001.2 - latest
  - Lovelace Mode

- Tested Browser
  - Chrome Version 86.0.4240.111 
  - Safari Version 13.1.2 (13609.3.5.1.5)
  - Firefox 82.0 (64-Bit)
  - Vivaldi 3.4.2066.76 (Stable channel) (x86_64)
  - Android Browser (Chrome, Firefox, Vivaldi)
- Lovelace graph-chartjs-card

<br>

## Installation 
### Manual install
1. Download and copy `graph-chartjs-card.js` from the [latest release](https://github.com/zibus/dist/) into your `config/www` directory.

2. Add a reference to `graph-chartjs-card.js` inside your `ui-lovelace.yaml` or at the top of the *raw config editor UI*:
    ```yaml
    resources:
      - url: /hacsfiles/graph-chartjs-card/graph-chartjs-card.js
        type: module
    ```

<br>

## Using the card
#### Card options
| Name           | Type     | Default     | Description |
| -------------- | -------- | ----------- |------------ |
| title          | string   |             | card title  |
| height         | integer  | 240         | card title  |
| chart          | string   | bar          | chart type  |
| update        |  integer        | 60            | Specify a custom update interval of the history data (in seconds), instead of on every state change. |
| hours_to_show          | integer   | 0          | Specify how many hours of history the graph should present. If not set (hours_to_show===0) only the current state values are used for the chart.  |
| group_by          | string   | day          | Specify type of grouping of data by date or hour. If not set, all data from the entity will be used for the chart.  |
| units          | string   |           | Set a custom unit of measurement for all entities.  |
| ignoreZero   | boolean   |   false       | if true, all date from the series with value 0 will be ignored   |
| locale          | string   |  de-DE         |  formats the numbers according to the locale and formatting options and set the data string with a language sensitive representation of the date portion of the date|
| options        |          |             | just like chart.js documentation - see: [Chart.js documentation](https://www.chartjs.org/docs/latest/). Optional, if used the options will overwrite the default.global settings. |

<br>
#### Entities object
Entities may be listed directly (as per `sensor.peter_eiweis_makronahrstoff` in the example below), or defined using
properties of the Entity object detailed in the following table (as per `sensor.pressure` in the example below).

| Name | Type | Default | Description |
|------|:----:|:-------:|-------------|
| entity ***(required)*** | string |  | Entity id of the sensor.
| name | string |  | Set a custom display name, defaults to entity's friendly_name.
| color | string |  | Set a custom color, overrides all other color options including thresholds.
| unit | string |  | Set a custom unit of measurement, overrides `unit` set in base config.
| ... | optional |  | Set a custom option  see: [Chart.js documentation](https://www.chartjs.org/docs/latest/).|

### Theme variables
The following theme variables can be set in your HA theme to customize the appearence of the card.

| Name | Default | Description |
|------|:-------:|-------------|
| cartjs-text-fontColor |  | |
| cartjs-fontFamily | | |
| cartjs-gridline-color | | |
| cartjs-zero-gridline-color | | |
| cartjs-tooltip-background | | |
| cartjs-text-fontcolor | | |

<br><br>

### Simple chart w/o any options
```yaml
- type: 'custom:chart-card'
  title: 'Makro Nährstoffe'
  icon: 'mdi:nutrition'
  height: 240
  chart: 'pie'
  units: 'kal'
  options:
    title:
      display: true
      text: 'Aufteilung Nährstoffe (kal) pro Tag'
      fontStyle: 'normal'
      fontSize: '18'

```
<br>

### Example: doughnut chart
```yaml
 - type: 'custom:graph-chartjs-card'
   title: 'Makro Nährstoffe'
   height: 240
   chart: 'doughnut'
   units: 'kal'
   colorschemes: 'brewer.Paired12'
   options:
     title:
       display: true
       fontStyle: 'normal'
       text: 'Aufteilung Nährstoffe (kal) pro Tag'
    entities:
      - entity: sensor.peter_eiweis_makronahrstoff
        name: Eiweis
        unit: 'kal'
      - entity: sensor.peter_fett_makronahrstoff
        name: Fett
        unit: 'kal'
      - entity: sensor.peter_kohlenhydrate_makronahrstoff
        name: Kohlenhydrate
        unit: 'kal'
```
<br>

### Example: bar chart
```yaml              
  - type: 'custom:graph-chartjs-card'
    title: 'Makro Nährstoffe'
    chartTitle: 'Aufstellung der Nährstoffe'
    height: 240
    chart: 'bar'
    units: 'kal'
    options:  ## see: https://www.chartjs.org/docs/latest/
      title:
        text: 'Aufstellung der Nährstoffe'
      scales:
        yAxes:
          - display: true
            stacked: false
            position: 'left'                        
            ticks:
              autoSkip: true
              maxTicksLimit: 8
            scaleLabel:
              display: false
              labelString: 'kal'
              fontStyle: 'bold'
            gridLines:
              display: true
              color: '#5ac8fa'
              lineWidth: 0.1
              zeroLineColor: '#ffcc00'
              zeroLineWidth: 0.42
        xAxes:
          - display: true
            stacked: true
            ticks:
              autoSkip: true
              maxTicksLimit: 8
            gridLines:
              display: true
              color: '#5ac8fa'
              lineWidth: 0.1
              zeroLineColor: '#007aff'
              zeroLineWidth: 0.42
    entities:
      - entity: sensor.peter_eiweis_makronahrstoff
        name: Eiweis
        color: '#FECB2E'
        unit: 'kal'
      - entity: sensor.peter_fett_makronahrstoff
        name: Fett
        color: '#FC3158'
        unit: 'kal'
      - entity: sensor.peter_kohlenhydrate_makronahrstoff
        name: Kohlenhydrate
        color: '#53BBDA'
        unit: 'kal'
```

<br>

### TODO - Open Tasks
- Better locale settings (number, date)
- Optimize the Initalizing / Data update for the custom card
- Optimize the data provider Historydata (data mapping, grouping)
- Chart - Scatter, Bubble Charts
    ```json

    # scatter -----------------
    "datasets": [{
            "data": [
                {"x": 0, "y": 3},
                {"x": 1, "y": 3},
                {"x": 2, "y": 3},
                {"x": 3, "y": 3},
                {"x": 4, "y": 3},
                {"x": 5, "y": 3},
                {"x": 6, "y": 3},
                {"x": 7, "y": 3},
                {"x": 8, "y": 3},
                {"x": 9, "y": 3}
      ] 

    # bubble -----------------
    datasets: [
        {
          label: 'Label',
          data: [
            {
              x: 3,
              y: 7,
              r: 10
            }
          ],
          backgroundColor:"#ff6384",
          hoverBackgroundColor: "#ff6384"
   ```
- Migration to Chart.js 3.0, see [Chart.js Version 3.0](https://www.chartjs.org/docs/master/getting-started/v3-migration/)
- Wait for Bugfix [Home-Assistant Fronend Bug](https://github.com/home-assistant/frontend/issues/7246)
<br>
<hr>
<br>

## Helper
- [YAML to JSON Online](https://www.convertjson.com/yaml-to-json.htm) - Use this online tool to convert YAML into JSON. 
- [JSON to YAML Online](https://www.convertjson.com/json-to-yaml.htm) - Use this online tool to convert JSON into YAML. 

## Resources
- [Chart.js Version 2.9.4](https://chartjs.org) - Chart.js - Simple yet flexible JavaScript charting for designers & developers
- [Chart.js Official Guide](https://chartjs.org/docs) - The user guide and documentation site.
- [Chart.js Samples](https://www.chartjs.org/samples/latest/) - Simple yet flexible JavaScript charting for designers & developers


## Used Plugins
- [colorschemes](https://github.com/nagix/chartjs-plugin-colorschemes) - Enables automatic coloring using predefined color schemes.
- [datalabels](https://github.com/chartjs/chartjs-plugin-datalabels) - Displays labels on data for any type of charts.
- [stacked100](https://github.com/y-takey/chartjs-plugin-stacked100) - Draws 100% stacked bar chart.
- [style](https://github.com/nagix/chartjs-plugin-style) - Provides styling options such as shadow, bevel, glow or overlay effects.
