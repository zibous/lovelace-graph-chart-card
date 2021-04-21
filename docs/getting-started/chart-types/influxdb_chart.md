# Lovelace - graph-chartjs-card

<br>

## Line Chart with datasource`influxdb`

Another possibility is to determine the data not from the home assistant history but from an influx database. This is the most efficient method to display a lot of data from a time range.

![influxdb_chart](img/influxdb_chart.png)

<br>



> **Recommendation**
>
> The `sensor.datetime` can be used as a "joker" entity. `dateid` must be unique, because this is used for intentifying the settings. Except for datasource (describes the data retrieval), all other settings are the same as for the other data sources.
>
> Get the token form the Browsers Console: **btoa**(`${username}:${password}`). btoa creates a base-64 encoded ASCII string from a "string".

<br>

### Example Line chart

```yaml
- type: 'custom:chart-card'
  title: Wasserverbrauch ㎥ / Tag
  icon: 'mdi:counter'
  height: 360
  chart: line
  debug: true
  datascales:
    mode: time
  chartOptions:
    plugins:
      legend:
        position: top
        display: true
    scales:
      x:
        grid:
          display: false
      'y':
        suggestedMin: 0
        suggestedMax: 8
        grid:
          display: true
        title:
          display: true
          text: Verbrauch ㎥
  entities:
    - entity: sensor.date_time
      dataid: wasser
      unit: ㎥
      datasource:
        influxdb: >-
          https://influxdb.local/query?db=home_assistant&epoch=ms
        query: >-
          SELECT sum("value") FROM "㎥" 
          WHERE ("entity_id" ='max_m3_day') 
          AND time > now() -180d 
          GROUP BY time(1d) fill(null)
        token: YWRtdWa46YmVlcDRCb3Nz
      name: Wasserverbrauch
      style:
        backgroundColor: '#3aa5e7'
        fill: true
        borderWidth: 1
        order: 1
```

