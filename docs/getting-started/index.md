# Lovelace - graph-chartjs-card


## Getting started



### Minimal configuration

```yaml
- type: 'custom:chart-card'
  chart: '{chart-type: line|radar|bar|horizontalBar|pie|doughnut|polarArea|bubble|scatter}'
  entities:
    - entity: {entity.id}
    - entity: {entity.id}
```




### Card options - using the card


```yaml
 - type: 'custom:chart-card'
   title: {text}
   chart: 'bar'
   theme:
   datascale:
   chartOptions:
     ....
    entities:
      options:
        ...
      entity:
        ...
```
<br>

#### Card settings `chart-card`

| Property   | Type     | Default     | Description |
| -------------- | -------- | ----------- |------------ |
| title          | string   | None | **Optional**, card title |
| icon          | string   | None | **Optional**, sets a custom icon from any of the available mdi icons. |
| height         | integer  | 240         | **Optional**, set a custom height in Pixels for the card. |
| **chart**      | string   | bar          | Sets the used chart type: `bar`, `horizontalBar`, `line`, `pie` , `doughnut`, `polarArea`, `radar`, `bubble`,`scatter` |
| showstate         | string  | top, left,center,right    | **Optional**, shows the current state for the selected entity. Only if `datascales` is used |
| showdetails         | boolean  | false         | **Optional**, shows the state details for the selected entity. Only if `datascales` is used |
| cardtimestamp  | boolean  | false         | **Optional**, if true  -  shows the timestamp for the last card update from the Homeassistant API Call |
| loader         | string  |  `three-dots`        | **Optional**, sets the loader animation. you can use `audio`, `ball-triangle`, `bars`, `circles` , `grid`, `hearts`, `oval`, `pfuff`,`rings`,`spinning-circles`,`tail-spin`,`three-dots`. Displays the selected icon while the data is loading/updating. |
| debug   | boolean   |   false       | **Optional**, if true, additional informations (data details, performace, settings.) will be printed on the browser's developer console. |
| update_interval   | integer   |  60       | **Optional**, By default the card updates on every state change. Sets the update interval to get the data from Homeassistant |
| chartOptions |   object       |  optional           | **Optional**, just like chart.js documentation - see: [Chart.js documentation](https://www.chartjs.org/docs/latest/). Optional, if used the `chartOtions` will overwrite the default global settings. |

<br>

#### Data scales

```yaml
- type: 'custom:chart-card'
  ...
  datascale:
    range: 72
    unit: 'hour'
    factor: 1.00
    ignoreZero: false
    aggregate: 'last'
  ...
```



| Property   | Type     | Default     | Description |
| -------------- | -------- | ----------- |------------ |
| range          | integer   | 72 | **Optional**, Sets the range for the data series in hours. |
| unit           | string   | hour | **Optional**, `secund`, `minute`, `hour`, `day`, `month`, `year`. It builds entity states over `unit` period of time. |
| factor         | number   | 1.00 | **Optional**, Caclulate your entity data in any way you like: `state.value * factor` |
| ignoreZero     | boolean   | false | **Optional**, true: Values with Null or 0.00 values will be ignored |
| aggregate     | boolean   | last | **Optional**, Aggregate method for the datascale unit: `first`, `last`, `sum`, `mean`, `max`, `min` |

<br>

#### Chart Options

| Property   | Type     | Default     | Description |
| -------------- | -------- | ----------- |------------ |
| plugins          | object | None | **Optional**, - see: [Chart.js documentation](https://www.chartjs.org/docs/latest/). |
| scales          | object | None | **Optional**,  - see: [Chart.js documentation](https://www.chartjs.org/docs/latest/). |

<br>

#### Entities

<br>

#####  - Entities Options
| Property   | Type     | Default     | Description |
| -------------- | -------- | ----------- |------------ |
| unit           | string   | entity unit-of-messuement | **Optional**, Text -  override the unit of the sensor |
| factor         | number   | 1.00 | **Optional**, Caclulate your entity data in any way you like: `state.value * factor` |
| ignoreZero     | boolean   | false | **Optional**, true: Values with Null or 0.00 values will be ignored |
| aggregate     | string | last | **Optional**, Aggregate method for the datascale unit: `first`, `last`, `sum`, `mean`, `max`, `min` |

<br>

#####  - Entity
| Property   | Type     | Default     | Description |
| -------------- | -------- | ----------- |------------ |
| unit           | string   | entity unit-of-messuement | **Optional**, Text -  override the unit of the sensor |
| factor         | number   | 1.00 | **Optional**, Caclulate your entity data in any way you like: `state.value * factor` |
| ignoreZero     | boolean   | false | **Optional**, true: Values with Null or 0.00 values will be ignored  |
| aggregate     | boolean   | last | **Optional**, Aggregate method for the datascale unit: `first`, `last`, `sum`, `mean`, `max`, `min` |

<br>

###### - Entity Style
| Property   | Type     | Default     | Description |
| -------------- | -------- | ----------- |------------ |
| backgroundColor| string   | default color | **Optional**, HEX, RGB, RGBA String  |



<br>

<hr>