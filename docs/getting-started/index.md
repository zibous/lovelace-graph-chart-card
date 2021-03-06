# Lovelace - graph-chartjs-card

<br>

## Getting started

The data from the sensors can be used once from the Histroy database of the Homeassistant or queried from the InfluxDB. The Homeassistant  history database can be used for current states and small amounts of data.

<br>

Larger amounts of data can be obtained more quickly via the Influx database. The evaluation and provision of the data from the influx database is 10 to 50 times faster and more suitable if the number of time series is high.

<br>

### Minimal configuration

In the "minimum configuration" chart, the default settings are used. The properties Lovelace Card `type`, `chart` Type and the `entities`, `entity` to be evaluated are absolutely necessary.

<br>

```yaml
- type: 'custom:chart-card'
  chart: '{chart-type: line|radar|bar|horizontalBar|pie|doughnut|polarArea|bubble|scatter}'
  entities:
    - entity: {entity.id}
    - entity: {entity.id}
```

<br>

### Card options - using the card

Additional settings are optional. They are `theme`-, `datascale`-, `chartOptions` and entity `options`.


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

<br>

The following card options are possible. If these are set, then overwrite or extend the standard settings.

| Property   | Type     | Default     | Description |
| -------------- | -------- | ----------- |------------ |
| title          | string   | None | **Optional**, card title |
| icon          | string   | None | **Optional**, sets a custom icon from any of the available mdi icons. |
| height         | integer  | 240         | **Optional**, set a custom height in Pixels for the card. |
| **chart**      | string   | bar          | Sets the used chart type: `bar`, `horizontalBar`, `line`, `pie` , `doughnut`, `polarArea`, `radar`, `bubble`,`scatter` |
| showstate         | boolean | false        | **Optional**, shows the current state for the selected entity. Only if `datascales` is used. |
| showdetails         | object | None  | **Optional**, shows the state details for the selected entity. Only if `datascales` is used |
| cardtimestamp  | boolean  | false         | **Optional**, if true  -  shows the timestamp for the last card update from the Homeassistant API Call |
| loader         | string  |  `three-dots`        | **Optional**, sets the loader animation. you can use `audio`, `ball-triangle`, `bars`, `circles` , `grid`, `hearts`, `oval`, `pfuff`,`rings`,`spinning-circles`,`tail-spin`,`three-dots`. Displays the selected icon while the data is loading/updating. |
| debug   | boolean   |   false       | **Optional**, if true, additional informations (data details, performace, settings.) will be printed on the browser's developer console. |
| update_interval   | integer   |  60       | **Optional**, By default the card updates on every state change. Sets the update interval to get the data from Homeassistant |
| chartOptions |   object       |  optional           | **Optional**, just like chart.js documentation - see: [Chart.js documentation](https://www.chartjs.org/docs/latest/). Optional, if used the `chartOtions` will overwrite the default global settings. |

<br>

#### Data scales

If Datascales are used, the data from the history is determined as time series data instead of the current state values. The duration (range) and the subdivision (unit (of the time series data) can be set. These data are then determined according to the aggregation setting.

<br>

```yaml
- type: 'custom:chart-card'
  ...
  datascale:
    range: 72
    unit: 'hour'
    format: 'HH:MM:ss'
    factor: 1.00
    ignoreZero: false
    aggregate: 'last'
    mode: 'category'
  ...
```

<br>

| Property   | Type     | Default     | Description |
| -------------- | -------- | ----------- |------------ |
| range          | integer   | 72 | **Optional**, Sets the range for the data series in hours. Used to calculate the range to get the bucket data form Homeassistent. End date is the current timestamp and the Start date is: `currentTimestamp.setHours(-range)`or `new currentTimestamp.setMinutes(-range` if the range < 1.00. |
| unit           | string   | hour | **Optional**, `second`, `minute`, `hour`, `day`, `month`, `year`. It builds entity states over `unit` period of time. The `unit` is used to calculate the ticks for the `Time Cartesian Axis`. |
| format     | string   | none | **Optional** overwrites the default date/time format.|
| factor         | number   | 1.00 | **Optional**, Caclulate your entity data in any way you like: `state.value * factor`. Scale value by order of magnitude (e.g. convert Watts to kilo Watts), use negative value to scale down. |
| ignoreZero     | boolean   | false | **Optional**, true: Values with Null or 0.00 values will be ignored |
| aggregate     | boolean   | last | **Optional**, Aggregate method for the datascale unit: `first`, `last`, `sum`, `mean`, `max`, `min`,`range`, `midrange` |
| mode | String | Optional | Default based on Chart Type, **optional** `category` (category axis ), `time` (Time Cartesian Axis) |



#### `Mode` - Chart Default setting

```javascript
{
    // mode settings
    disabled: { history: false, timescale: false, timeaxis: false },
    category: { history: true, timescale: true, timeaxis: false },
    time: { history: true, timescale: true, timeaxis: true },
    // chart defaults
    bar: { history: false, timescale: false, timeaxis: false },
    horizontalbar: { history: false, timescale: false, timeaxis: false },
    line: { history: true, timescale: true, timeaxis: true },
    pie: { history: false, timescale: false, timeaxis: false },
    doughnut: { history: false, timescale: false, timeaxis: false },
    // simple charts
    polararea: { history: false, timescale: false, timeaxis: false },
    scatter: { history: false, timescale: false, timeaxis: false },
    radar: { history: false, timescale: false, timeaxis: false },
    bubble: { history: false, timescale: false, timeaxis: false }
}
```



<br>

### Sample **Category Axis** (default)

![datascale_category](settings/datascale_category.png)

<br>

```yaml
- type: 'custom:chart-card'
  title: Energie Produktion
  icon: 'mdi:counter'
  height: 320
  chart: bar
  debug: true
  datascales:
    range: 24
    unit: hour
    format: hour
    aggregate: last
    mode: category
  entities:
    - entity: sensor.solarpower_current_power
      name: Energieproduktion
      unit: kWh
      ignoreZero: true
      factor: 0.001
```

 **Category Axis** see: https://www.chartjs.org/docs/latest/axes/cartesian/category.html

<br>

### Sample **Time Cartesian Axis**

![datascale_time](settings/datascale_time.png)

<br>

```yaml
- type: 'custom:chart-card'
  title: Energie Produktion
  icon: 'mdi:counter'
  height: 320
  chart: bar
  debug: true
  datascales:
    range: 24
    unit: hour
    format: hour
    aggregate: last
    mode: time
  entities:
    - entity: sensor.solarpower_current_power
      name: Energieproduktion
      unit: kWh
      ignoreZero: true
      factor: 0.001
```

**Time Cartesian Axis** see: https://www.chartjs.org/docs/latest/axes/cartesian/time.html

<br>

#### Chart Options

The chart option can be used to set the display of the chart graph. The permitted settings are those provided by Chart.js.

<br>

| Property   | Type     | Default     | Description |
| -------------- | -------- | ----------- |------------ |
| plugins  | object | None    | **Optional**,  - see: [Chart.js documentation](https://www.chartjs.org/docs/latest/). |
| scales   | object | None    | **Optional**,  - see: [Chart.js documentation](https://www.chartjs.org/docs/latest/). |
|          |        |         |                                                              |

<br>

#### Entities

Entities Section contains all sensors and the settings (optional) for the data to be determined by the home assistant

<br>

#####  - Entities Options

With these settings you can set the type of chart elements settings for all entities.

| Property   | Type     | Default     | Description |
| -------------- | -------- | ----------- |------------ |
| unit           | string   | entity unit-of-messuement | **Optional**, Text -  override the unit of the sensor |
| factor         | number   | 1.00 | **Optional**, caclulate your entity data in any way you like: `state.value * factor`.Scale value by order of magnitude (e.g. convert Watts to kilo Watts), use negative value to scale down. |
| ignoreZero     | boolean   | false | **Optional**, true: Values with Null or 0.00 values will be ignored |
| aggregate     | string | last | **Optional**, aggregate method for the datascale unit: `first`, `last`, `sum`, `mean`, `max`, `min`,`range`, `midrange` |
|            |         |                           |                                                              |

<br>

#####  - Entity
| Property   | Type     | Default     | Description |
| -------------- | -------- | ----------- |------------ |
| unit           | string   | entity unit-of-messuement | **Optional**, Text -  override the unit of the sensor |
| factor         | number   | 1.00 | **Optional**, caclulate your entity data in any way you like: `state.value * factor`. Scale value by order of magnitude (e.g. convert Watts to kilo Watts), use negative value to scale down. |
| ignoreZero     | boolean   | false | **Optional**, true: Values with Null or 0.00 values will be ignored  |
| aggregate     | boolean   | last | **Optional**, aggregate method for the datascale unit: `first`, `last`, `sum`, `mean`, `max`, `min`,`range`, `midrange` |
| target_value | number | None | **Optional**, calculates the state value: `(state.value/target_value.value)*100`. Unit is set to `%` |
| style | Object | None | ... see Entity Style samples. Additional info see: https://www.chartjs.org/docs/latest/configuration/elements.html |
| dataid     | string   | None | **Optional**,  |
| datasource     | object   | None | **Optional**, |

<br>

##### - Entity Datasource

If the data source is set, the data from the influx database is used for the graphical representations, otherwise it is obtained from the home assistant history database.

| Property | Type   | Default | Description                                                  |
| -------- | ------ | ------- | ------------------------------------------------------------ |
| influxdb | string | None    | **Connection** to INFLUXDB: `https://hostname/influxdb/query?db=home_assistant&epoch=ms)` |
| query    | string | None    | **INFLUXDB SQL** statement. `SELECT sum("value")*0.001 FROM "Wh" WHERE("entity_id" = 'kostal_watt_aktuell') AND time > now() -14d GROUP BY time(1d) fill(null)` |
| token    | string | None    | **Authorization** for Influxdb Connection. **btoa**(`${username}:${password}`)`. Get the token form the Browsers Console. |

<br>

###### - Entity Style samples

With these settings you can set the type of chart elements settings.

| Property   | Type     | Default     | Description |
| -------------- | -------- | ----------- |------------ |
| backgroundColor| string   | default color | **Optional**, HEX, RGB, RGBA String  |
| borderColor | string | default color | **Optional**, HEX, RGB, RGBA String |
| .... |  |  |  |

<br>

Additional info see: https://www.chartjs.org/docs/latest/configuration/elements.html

<br>

<hr>