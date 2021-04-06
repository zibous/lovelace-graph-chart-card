# Lovelace - graph-chartjs-card

Chart.js card `Version 2.0.2` for Home Assistant -  Visualize your data in 9 different ways; each of them animated and customisable.

![charts2.png](img/charts/charts.png)



## Installation



### Manual install

1. Download the [latest release](https://github.com/zibous/lovelace-graph-chart-card/releases), unzip and copy the folder `chart-card` into your `config/www/community` directory.
  <br>

2. Add a reference to `chart-card-min.js` inside your `ui-lovelace.yaml` or at the top of the *raw config editor UI*:

    ```yaml
    resources:
      - url: /hacsfiles/chart-card/chart-card-min.js
        type: module
    ```
<br>

YAML Structure for `custom:chart-card`

```yaml
## -------------------------------------
## all settings for a custom-chart-card
## -------------------------------------
- type: 'custom:chart-card'
  ## all for the card
  title: '{text: card-titel}'
  icon: '{text: card-title-icon}'
  height: {height-chard: number}px
  chart: '{chart-type: line|radar|bar|horizontalBar|pie|doughnut|polarArea|bubble|scatter}'
  ## optional settings for chart
  showstate: {boolean: true|false}
  debug: {boolean: true|false}
  cardtimestamp: {boolean: true|false}
  showdetails:{boolean: true|false}
  loader: '{text: audio|ball-triangle|bars|circles|grid|hearts|'
           'oval|pfuff|rings|spinning-circles|tail-spin|three-dots}'
  update_interval: {integer: secunds}     
  
  ## otional settings for data scales (time-series)
  datascales:
    range: {integer}
    unit: '{text: millisecond|datetime|secund|minute|hour|day|month|year}'
    factor: {number: factor}
    ignoreZero: {boolean: true|false}
    aggregate: '{text: first|last|sum|mean|max|min}'
    
  ## optional chart.js options (see chart.js documentation) 
  chartOptions:
    plugins:
      legend:
        position: '{text: top|right|left|bottom}'
        display: {boolean: true|false}
    scales:
      x:
        alignToPixels: {boolean: true|false}
        stacked: {boolean: true|false}
        offset: {boolean: true|false}
        title:
          display: {boolean: true|false}
          text: '{text: axis-title}'
      'y':
        alignToPixels: {boolean: true|false}
        stacked: {boolean: true|false}
        title:
          display: {boolean: true|false}
          text: '{text: axis-title}'
  entities:
    ## optional options for all entities
    - options:
      unit: '{text: unit-text}'
      ignoreZero: {boolean: true|false} 
      
    - entity: '{text: entity-id}'
      ## optional settings for the current entity (1st)
      name: '{text: display-text}'
      attribute: '{text: entity-attribute-name}'
      unit: '{text: unit-text}'
      ignoreZero: {boolean: true|false}
      aggregate: '{text: first|last|sum|mean|max|min}'
      style: ## see chart.js documentation
        backgroundColor: '{text: HEX|RGB|RGBA color}'
        
    - entity: '{text: entity-id}'
      ## optional settings for the current entity (2nd)
      name: '{text: display-text}'
      attribute: '{text: entity-attribute-name}'
      factor: {number: factor}
      aggregate: '{text: first|last|sum|mean|max|min}'
      style: ## see chart.js documentation
        backgroundColor: '{text: HEX|RGB|RGBA color}'

```



For `chartOptions` and `entity.style`,   see: [Chart.js documentation](https://www.chartjs.org/docs/latest/)



## Creating a Chart

It's easy to get started with `Lovelace - graph-chartjs-card`. All that's required is the libraries included in your Home-assistant installation to render the charts.

In this example, we create a bar chart for a two dataset and render that in the lovelace page. [Data source](https://github.com/zibous/ha-miscale2) - See --> Read weight measurements from Xiaomi Body Scales....


## 

![charts2.png](img/charts/simple_bar.png)


### YAML Configuration

```yaml
- type: 'custom:chart-card'
  title: 'Makro Nährstoffe'
  icon: 'mdi:nutrition'
  chart: 'bar'
  chartOptions:
    plugins:
      title:
        display: true
        text: 'Aufteilung Nährstoffe (kal) pro Tag'
        color: '#ff9500'
  entities:
    - entity: sensor.eiweis_makronahrstoff
      name: Eiweis
    - entity: sensor.fett_makronahrstoff
      name: Fett
    - entity: sensor.kohlenhydrate_makronahrstoff
      name: Kohlenhydrate
```

You can see all the ways to use `Lovelace - graph-chartjs-card` in the [usage documentation](./getting-started/index.md).
