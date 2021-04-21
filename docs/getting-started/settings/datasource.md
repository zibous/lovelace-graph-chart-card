# Lovelace - graph-chartjs-card

<br>

## Datasource(s)

As a data source, the following possible settings are available for displaying the data in the chart.

<br>

### Datasource `state`

The simplest variant is the representation of the current state of one sensor or of several sensors. Mostly used for the presentation of bar-, pie-, doughnut charts.

```yaml
- type: 'custom:chart-card'
  ...
  entities:
    - entity: sensor.0_eg
    - entity: sensor.1_og
    - entity: sensor.2_og
    ....

```

<br>

### Datasource `historydata`

You can use this option if the states of the sensors are displayed in a chronological order.

```yaml
- type: 'custom:chart-card'
  ...
  datascales:
      range: 120
      unit: hour
      format: 'HH:00'
      mode: time
  entities:
    - entity: sensor.0_eg
    
```

<br>

### Datasource `influxdb`

Another possibility is to determine the data not from the home assistant history but from an influx database. This is the most efficient method to display a lot of data from a time range.

<br>

```yaml
- type: 'custom:chart-card'
  ...
  update_interval: 600
  entities:
   - entity: sensor.date_time
     dataid: kostalWh
     name: Photovoltaik
     unit: kWh
     datasource:
       influxdb: >-
         https://influxdb.local/query?db=home_assistant&epoch=ms
       query: >-
         SELECT sum("value")*0.001 FROM "Wh" 
         WHERE ("entity_id" = 'kostal_watt_aktuell') 
         AND time > now() -60d 
         GROUP BY time(1d) fill(null)
       token: ZWRtaW46YmVlcDRCb3Nz 
       
   ## entity sensor time is used for update intervall...  
   - entity: sensor.date_time
     dataid: lux
     name: Sonnenlicht
     unit: Lux
     datasource:
       influxdb: >-
         https://influxdb.local/query?db=home_assistant&epoch=ms
       query: >-
         SELECT mean("value") FROM "Lux" 
         WHERE time > now() -60d 
         GROUP BY time(1d) fill(null)
       token: ZWRtaW46YmVlcDRCb3Nz

   
```



> **Recommendation**
>
> The `sensor.datetime` can be used as a "joker" entity. `dateid` must be unique, because this is used for intentifying the settings. Except for datasource (describes the data retrieval), all other settings are the same as for the other data sources.
>
> Get the token form the Browsers Console: **btoa**(`${username}:${password}`). btoa creates a base-64 encoded ASCII string from a "string".

<br>

<hr>



