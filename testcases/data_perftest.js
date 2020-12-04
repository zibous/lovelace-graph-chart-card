
/**
 * get the date format patter for the
 * data series group
 * @param {string} key
 */
function _dateFormatPattern(key) {
    const df = [];
    df["timestamp"] = "timestamp";
    df["day"] = "%Y-%M-%d";
    df["hour"] = "%Y-%M-%d %H:00:00";
    df["month"] = "%Y-%M";
    df["year"] = "%Y";
    if (key in df) return df[key];
    else return df["timestamp"];
}

/**
 * number format integer or float
 * @param {number} n
 */
function num(n) {
    return n === parseInt(n) ? parseInt(n) : parseFloat(n).toFixed(2);
}

/**
 * data formatter
 * @param {date} d
 * @param {string} fmt
 */
function formatDate(d, fmt) {
    const date = new Date(d);
    function pad(value) {
        return value.toString().length < 2 ? "0" + value : value;
    }
    if (fmt == "timestamp") {
        return (
            date.getUTCFullYear() +
            "-" +
            pad(date.getUTCMonth() + 1) +
            "-" +
            pad(date.getUTCDate()) +
            " " +
            pad(date.getUTCHours()) +
            ":" +
            pad(date.getUTCMinutes()) +
            ":" +
            pad(date.getUTCSeconds())
        );
    }
    return fmt.replace(/%([a-zA-Z])/g, function (_, fmtCode) {
        switch (fmtCode) {
            case "Y":
                return date.getUTCFullYear();
            case "M":
                return pad(date.getUTCMonth() + 1);
            case "d":
                return pad(date.getUTCDate());
            case "H":
                return pad(date.getUTCHours());
            case "m":
                return pad(date.getUTCMinutes());
            case "s":
                return pad(date.getUTCSeconds());
            default:
                throw new Error("Unsupported format code: " + fmtCode);
        }
    });
}

/**
 * testcase array loop performance
 * @param {array} array
 * @param {string} fmt
 * @call result = testcase1(data,"%Y-%M-%d %H:00:00")
 */
function testcase1(array, fmt) {
    let newdata = [];
    let i = 0;
    const n = array.length;
    while (i < n) {
        const item = array[i];
        // grouped data, allways the last one...
        newdata[formatDate(item.last_changed, fmt)] = {
            x: item.last_changed,
            y: num(item.state || 0.0)
        };
        i++;
    }
    return newdata;
}

/**
 * build the grouped historydata
 *
 *
 * TODO: this is not final, try to find a optimized methode
 * ---------------------------------------------------------
 * @param {list} array
 * @param {string} fmt
 * @param {string} aggr
 */
function _getGroupHistoryData(array, fmt, aggr) {
    try {
        if (!array) return;
        if (array && !array.length) return;
        let groups = {};
        // fist step build the grouped items
        array.forEach(function (o) {
            let group = formatDate(o.last_changed, fmt);
            groups[group] = groups[group] || [];
            o.timestamp = formatDate(o.last_changed, "timestamp");
            o.last_changed = group;
            groups[group].push(o);
        });
        // build the results
        return Object.keys(groups).map(function (group) {
            let items = groups[group].filter(
                (item) => item.state && !isNaN(parseFloat(item.state)) && isFinite(item.state)
            );
            if (items && items.length === 0) {
                return {
                    y: 0.0,
                    x: ""
                };
            }
            if (aggr == "first") {
                const item = items.shift();
                return {
                    y: num(item.state || 0.0),
                    x: item.last_changed
                };
            }
            if (aggr == "last") {
                const item = items[items.length - 1];
                return {
                    y: num(item.state || 0.0),
                    x: item.last_changed
                };
            }
            if (aggr == "max") {
                return items.reduce((a, b) =>
                    a.state > b.state
                        ? {
                              y: num(a.state || 0.0),
                              x: a.last_changed
                          }
                        : { y: num(b.state), x: b.last_changed }
                );
            }
            if (aggr == "min")
                return items.reduce((a, b) =>
                    a.state < b.state
                        ? {
                              y: num(a.state || 0.0),
                              x: a.last_changed
                          }
                        : {
                              y: num(b.state || 0.0),
                              x: b.last_changed
                          }
                );
            if (aggr == "sum") {
                const val = items.reduce((sum, entry) => sum + num(entry.state), 0);
                return {
                    y: num(val || 0.0),
                    x: items[0].last_changed
                };
            }
            if (aggr == "avg") {
                const val = items.reduce((sum, entry) => sum + num(entry.state), 0) / items.length;
                return {
                    y: num(val || 0.0),
                    x: items[0].last_changed
                };
            }
            return items.map((items) => {
                return {
                    y: num(items.state || 0.0),
                    x: items.timestamp
                };
            });
        });
    } catch (err) {
        console.error("Build Histroydata", err.message, err);
    }
}

// all data from all sensors
_data = [
    [
        {
            entity_id: "sensor.temp_sensor_temperature_aussen",
            state: "1.78",
            attributes: {
                unit_of_measurement: "°C",
                friendly_name: "Garten Temperatur",
                icon: "mdi:thermometer-lines"
            },
            last_changed: "2020-11-30T00:00:00.271000+00:00",
            last_updated: "2020-11-30T00:00:00.271000+00:00"
        },
        {
            state: "1.72",
            last_changed: "2020-11-30T00:05:18+00:00"
        },
        {
            state: "1.78",
            last_changed: "2020-11-30T00:09:00+00:00"
        },
        {
            state: "1.72",
            last_changed: "2020-11-30T00:10:04+00:00"
        },
        {
            state: "1.61",
            last_changed: "2020-11-30T00:15:40+00:00"
        },
        {
            state: "1.72",
            last_changed: "2020-11-30T00:17:00+00:00"
        },
        {
            state: "1.61",
            last_changed: "2020-11-30T00:48:44+00:00"
        },
        {
            state: "1.5",
            last_changed: "2020-11-30T01:11:56+00:00"
        },
        {
            state: "1.61",
            last_changed: "2020-11-30T01:34:36+00:00"
        },
        {
            state: "1.5",
            last_changed: "2020-11-30T01:38:20+00:00"
        },
        {
            state: "1.39",
            last_changed: "2020-11-30T01:54:41+00:00"
        },
        {
            state: "1.5",
            last_changed: "2020-11-30T02:03:24+00:00"
        },
        {
            state: "1.39",
            last_changed: "2020-11-30T02:39:57+00:00"
        },
        {
            state: "1.5",
            last_changed: "2020-11-30T02:41:16+00:00"
        },
        {
            state: "1.39",
            last_changed: "2020-11-30T02:43:24+00:00"
        },
        {
            state: "1.28",
            last_changed: "2020-11-30T04:17:16+00:00"
        },
        {
            state: "1.39",
            last_changed: "2020-11-30T04:27:56+00:00"
        },
        {
            state: "1.28",
            last_changed: "2020-11-30T04:31:08+00:00"
        },
        {
            state: "1.39",
            last_changed: "2020-11-30T04:34:20+00:00"
        },
        {
            state: "1.28",
            last_changed: "2020-11-30T04:35:24+00:00"
        },
        {
            state: "1.39",
            last_changed: "2020-11-30T04:59:24+00:00"
        },
        {
            state: "1.28",
            last_changed: "2020-11-30T05:09:00+00:00"
        },
        {
            state: "1.39",
            last_changed: "2020-11-30T05:15:40+00:00"
        },
        {
            state: "1.28",
            last_changed: "2020-11-30T05:17:48+00:00"
        },
        {
            state: "1.39",
            last_changed: "2020-11-30T05:19:56+00:00"
        },
        {
            state: "1.28",
            last_changed: "2020-11-30T05:24:34+00:00"
        },
        {
            state: "1.39",
            last_changed: "2020-11-30T05:37:48+00:00"
        },
        {
            state: "1.28",
            last_changed: "2020-11-30T05:46:20+00:00"
        },
        {
            state: "1.22",
            last_changed: "2020-11-30T06:01:32+00:00"
        },
        {
            state: "1.28",
            last_changed: "2020-11-30T06:05:00+00:00"
        },
        {
            state: "1.39",
            last_changed: "2020-11-30T06:22:06+00:00"
        },
        {
            state: "1.28",
            last_changed: "2020-11-30T06:25:38+00:00"
        },
        {
            state: "1.39",
            last_changed: "2020-11-30T06:26:52+00:00"
        },
        {
            state: "1.5",
            last_changed: "2020-11-30T06:50:20+00:00"
        },
        {
            state: "1.39",
            last_changed: "2020-11-30T06:54:04+00:00"
        },
        {
            state: "1.5",
            last_changed: "2020-11-30T07:03:57+00:00"
        },
        {
            state: "1.39",
            last_changed: "2020-11-30T07:07:24+00:00"
        },
        {
            state: "1.5",
            last_changed: "2020-11-30T08:08:28+00:00"
        },
        {
            state: "1.61",
            last_changed: "2020-11-30T08:35:40+00:00"
        },
        {
            state: "1.72",
            last_changed: "2020-11-30T08:46:20+00:00"
        },
        {
            state: "1.78",
            last_changed: "2020-11-30T08:53:00+00:00"
        },
        {
            state: "1.89",
            last_changed: "2020-11-30T09:01:48+00:00"
        },
        {
            state: "1.78",
            last_changed: "2020-11-30T09:11:56+00:00"
        },
        {
            state: "1.72",
            last_changed: "2020-11-30T09:13:00+00:00"
        },
        {
            state: "1.78",
            last_changed: "2020-11-30T09:16:12+00:00"
        },
        {
            state: "1.72",
            last_changed: "2020-11-30T09:20:28+00:00"
        },
        {
            state: "1.78",
            last_changed: "2020-11-30T09:23:40+00:00"
        },
        {
            state: "1.72",
            last_changed: "2020-11-30T09:24:44+00:00"
        },
        {
            state: "1.78",
            last_changed: "2020-11-30T09:25:48+00:00"
        },
        {
            state: "1.89",
            last_changed: "2020-11-30T09:32:05+00:00"
        },
        {
            state: "2.0",
            last_changed: "2020-11-30T09:41:00+00:00"
        },
        {
            state: "2.11",
            last_changed: "2020-11-30T09:45:16+00:00"
        },
        {
            state: "2.0",
            last_changed: "2020-11-30T10:04:37+00:00"
        },
        {
            state: "2.11",
            last_changed: "2020-11-30T10:08:28+00:00"
        },
        {
            state: "2.0",
            last_changed: "2020-11-30T10:13:00+00:00"
        },
        {
            state: "1.89",
            last_changed: "2020-11-30T10:17:16+00:00"
        },
        {
            state: "2.0",
            last_changed: "2020-11-30T10:36:44+00:00"
        },
        {
            state: "1.89",
            last_changed: "2020-11-30T10:37:49+00:00"
        },
        {
            state: "2.0",
            last_changed: "2020-11-30T10:41:16+00:00"
        },
        {
            state: "2.11",
            last_changed: "2020-11-30T10:50:20+00:00"
        },
        {
            state: "2.0",
            last_changed: "2020-11-30T10:55:40+00:00"
        },
        {
            state: "1.89",
            last_changed: "2020-11-30T11:05:16+00:00"
        },
        {
            state: "2.0",
            last_changed: "2020-11-30T11:09:35+00:00"
        },
        {
            state: "1.89",
            last_changed: "2020-11-30T11:13:01+00:00"
        },
        {
            state: "2.0",
            last_changed: "2020-11-30T11:20:45+00:00"
        },
        {
            state: "2.11",
            last_changed: "2020-11-30T11:24:14+00:00"
        },
        {
            state: "2.0",
            last_changed: "2020-11-30T11:26:41+00:00"
        },
        {
            state: "2.11",
            last_changed: "2020-11-30T11:29:00+00:00"
        },
        {
            state: "2.0",
            last_changed: "2020-11-30T11:32:12+00:00"
        },
        {
            state: "2.11",
            last_changed: "2020-11-30T11:44:12+00:00"
        },
        {
            state: "2.0",
            last_changed: "2020-11-30T11:47:24+00:00"
        },
        {
            state: "2.11",
            last_changed: "2020-11-30T11:50:41+00:00"
        },
        {
            state: "2.0",
            last_changed: "2020-11-30T11:51:56+00:00"
        },
        {
            state: "2.11",
            last_changed: "2020-11-30T11:57:16+00:00"
        },
        {
            state: "2.22",
            last_changed: "2020-11-30T12:15:24+00:00"
        },
        {
            state: "2.28",
            last_changed: "2020-11-30T12:17:32+00:00"
        },
        {
            state: "2.22",
            last_changed: "2020-11-30T12:29:32+00:00"
        },
        {
            state: "2.28",
            last_changed: "2020-11-30T12:40:12+00:00"
        },
        {
            state: "2.22",
            last_changed: "2020-11-30T12:43:24+00:00"
        },
        {
            state: "2.28",
            last_changed: "2020-11-30T12:47:56+00:00"
        },
        {
            state: "2.22",
            last_changed: "2020-11-30T12:51:34+00:00"
        },
        {
            state: "2.28",
            last_changed: "2020-11-30T13:00:28+00:00"
        },
        {
            state: "2.22",
            last_changed: "2020-11-30T13:02:36+00:00"
        },
        {
            state: "2.11",
            last_changed: "2020-11-30T13:03:40+00:00"
        },
        {
            state: "2.0",
            last_changed: "2020-11-30T13:05:48+00:00"
        },
        {
            state: "2.11",
            last_changed: "2020-11-30T13:11:08+00:00"
        },
        {
            state: "2.0",
            last_changed: "2020-11-30T13:12:12+00:00"
        },
        {
            state: "1.89",
            last_changed: "2020-11-30T13:16:28+00:00"
        },
        {
            state: "2.0",
            last_changed: "2020-11-30T13:19:40+00:00"
        },
        {
            state: "2.11",
            last_changed: "2020-11-30T13:22:52+00:00"
        },
        {
            state: "2.0",
            last_changed: "2020-11-30T13:26:22+00:00"
        },
        {
            state: "1.89",
            last_changed: "2020-11-30T13:37:32+00:00"
        },
        {
            state: "1.78",
            last_changed: "2020-11-30T13:42:52+00:00"
        },
        {
            state: "1.89",
            last_changed: "2020-11-30T13:49:16+00:00"
        },
        {
            state: "1.78",
            last_changed: "2020-11-30T13:53:37+00:00"
        },
        {
            state: "1.89",
            last_changed: "2020-11-30T14:00:44+00:00"
        },
        {
            state: "1.78",
            last_changed: "2020-11-30T14:11:56+00:00"
        },
        {
            state: "1.72",
            last_changed: "2020-11-30T14:19:57+00:00"
        },
        {
            state: "1.61",
            last_changed: "2020-11-30T14:28:44+00:00"
        },
        {
            state: "1.5",
            last_changed: "2020-11-30T15:09:08+00:00"
        },
        {
            state: "1.61",
            last_changed: "2020-11-30T15:10:27+00:00"
        },
        {
            state: "1.5",
            last_changed: "2020-11-30T15:11:41+00:00"
        },
        {
            state: "1.39",
            last_changed: "2020-11-30T15:46:43+00:00"
        },
        {
            state: "1.5",
            last_changed: "2020-11-30T15:48:03+00:00"
        },
        {
            state: "1.39",
            last_changed: "2020-11-30T15:49:24+00:00"
        },
        {
            state: "1.5",
            last_changed: "2020-11-30T16:00:19+00:00"
        },
        {
            state: "1.39",
            last_changed: "2020-11-30T16:12:20+00:00"
        },
        {
            state: "1.28",
            last_changed: "2020-11-30T16:21:40+00:00"
        },
        {
            state: "1.39",
            last_changed: "2020-11-30T16:25:55+00:00"
        },
        {
            state: "1.28",
            last_changed: "2020-11-30T16:51:32+00:00"
        },
        {
            state: "1.22",
            last_changed: "2020-11-30T17:10:48+00:00"
        },
        {
            state: "1.28",
            last_changed: "2020-11-30T17:16:08+00:00"
        },
        {
            state: "1.22",
            last_changed: "2020-11-30T17:25:45+00:00"
        },
        {
            state: "1.28",
            last_changed: "2020-11-30T17:34:33+00:00"
        },
        {
            state: "1.39",
            last_changed: "2020-11-30T17:53:45+00:00"
        },
        {
            state: "1.28",
            last_changed: "2020-11-30T18:03:52+00:00"
        },
        {
            state: "1.22",
            last_changed: "2020-11-30T18:20:10+00:00"
        },
        {
            state: "1.11",
            last_changed: "2020-11-30T18:34:46+00:00"
        },
        {
            state: "1.0",
            last_changed: "2020-11-30T18:56:41+00:00"
        },
        {
            state: "0.89",
            last_changed: "2020-11-30T19:28:09+00:00"
        },
        {
            state: "1.0",
            last_changed: "2020-11-30T19:34:00+00:00"
        },
        {
            state: "0.89",
            last_changed: "2020-11-30T19:35:20+00:00"
        },
        {
            state: "1.0",
            last_changed: "2020-11-30T19:43:05+00:00"
        },
        {
            state: "0.89",
            last_changed: "2020-11-30T20:34:48+00:00"
        },
        {
            state: "0.78",
            last_changed: "2020-11-30T20:44:11+00:00"
        },
        {
            state: "0.72",
            last_changed: "2020-11-30T20:50:17+00:00"
        },
        {
            state: "0.61",
            last_changed: "2020-11-30T21:12:40+00:00"
        },
        {
            state: "0.5",
            last_changed: "2020-11-30T21:16:08+00:00"
        },
        {
            state: "0.39",
            last_changed: "2020-11-30T21:20:41+00:00"
        },
        {
            state: "0.28",
            last_changed: "2020-11-30T21:26:49+00:00"
        },
        {
            state: "0.22",
            last_changed: "2020-11-30T21:30:00+00:00"
        },
        {
            state: "0.11",
            last_changed: "2020-11-30T21:35:20+00:00"
        },
        {
            state: "0.0",
            last_changed: "2020-11-30T21:38:01+00:00"
        },
        {
            state: "-0.11",
            last_changed: "2020-11-30T21:42:32+00:00"
        },
        {
            state: "-0.22",
            last_changed: "2020-11-30T21:48:08+00:00"
        },
        {
            state: "-0.28",
            last_changed: "2020-11-30T21:52:41+00:00"
        },
        {
            state: "-0.39",
            last_changed: "2020-11-30T21:57:53+00:00"
        },
        {
            state: "-0.5",
            last_changed: "2020-11-30T22:00:56+00:00"
        },
        {
            state: "-0.61",
            last_changed: "2020-11-30T22:04:58+00:00"
        },
        {
            state: "-0.72",
            last_changed: "2020-11-30T22:08:08+00:00"
        },
        {
            state: "-0.78",
            last_changed: "2020-11-30T22:14:00+00:00"
        },
        {
            state: "-0.89",
            last_changed: "2020-11-30T22:17:28+00:00"
        },
        {
            state: "-1.0",
            last_changed: "2020-11-30T22:18:48+00:00"
        },
        {
            state: "1.61",
            last_changed: "2020-12-01T23:00:54+00:00"
        },
        {
            state: "1.5",
            last_changed: "2020-12-01T23:06:11+00:00"
        },
        {
            state: "2.39",
            last_changed: "2020-12-02T11:45:15+00:00"
        },
        {
            state: "2.5",
            last_changed: "2020-12-02T11:47:23+00:00"
        },
        {
            state: "2.39",
            last_changed: "2020-12-02T11:48:27+00:00"
        },
        {
            state: "2.28",
            last_changed: "2020-12-02T11:52:43+00:00"
        },
        {
            state: "unknown",
            last_changed: "2020-12-03T07:52:19+00:00"
        },
        {
            state: "0.0",
            last_changed: "2020-12-03T07:52:37+00:00"
        },
        {
            entity_id: "sensor.temp_sensor_temperature_aussen",
            state: "2.39",
            attributes: {
                unit_of_measurement: "°C",
                friendly_name: "Garten Temperatur",
                icon: "mdi:thermometer-lines"
            },
            last_changed: "2020-12-03T10:07:52+00:00",
            last_updated: "2020-12-03T10:07:52+00:00"
        }
    ],
    [
        {
            entity_id: "sensor.temp_sensor_temperature_kuche",
            state: "23.29",
            attributes: {
                unit_of_measurement: "°C",
                friendly_name: "Küche Temperatur",
                icon: "mdi:thermometer-lines"
            },
            last_changed: "2020-11-30T00:00:00.271000+00:00",
            last_updated: "2020-11-30T00:00:00.271000+00:00"
        },
        {
            state: "22.78",
            last_changed: "2020-11-30T00:13:24+00:00"
        },
        {
            state: "22.81",
            last_changed: "2020-11-30T00:19:17+00:00"
        },
        {
            state: "22.31",
            last_changed: "2020-11-30T01:17:19+00:00"
        },
        {
            state: "22.27",
            last_changed: "2020-11-30T01:21:21+00:00"
        },
        {
            state: "22.05",
            last_changed: "2020-11-30T02:08:27+00:00"
        },
        {
            state: "21.96",
            last_changed: "2020-11-30T02:33:51+00:00"
        },
        {
            state: "21.79",
            last_changed: "2020-11-30T02:59:55+00:00"
        },
        {
            state: "21.57",
            last_changed: "2020-11-30T03:53:45+00:00"
        },
        {
            state: "21.45",
            last_changed: "2020-11-30T04:24:43+00:00"
        },
        {
            state: "21.58",
            last_changed: "2020-11-30T04:52:48+00:00"
        },
        {
            state: "21.71",
            last_changed: "2020-11-30T05:28:08+00:00"
        },
        {
            state: "21.73",
            last_changed: "2020-11-30T05:46:58+00:00"
        },
        {
            state: "21.78",
            last_changed: "2020-11-30T06:44:51+00:00"
        },
        {
            state: "21.89",
            last_changed: "2020-11-30T07:06:33+00:00"
        },
        {
            state: "22.19",
            last_changed: "2020-11-30T07:28:25+00:00"
        },
        {
            state: "22.24",
            last_changed: "2020-11-30T07:37:30+00:00"
        },
        {
            state: "22.4",
            last_changed: "2020-11-30T07:55:51+00:00"
        },
        {
            state: "22.45",
            last_changed: "2020-11-30T08:30:19+00:00"
        },
        {
            state: "22.47",
            last_changed: "2020-11-30T09:11:22+00:00"
        },
        {
            state: "22.43",
            last_changed: "2020-11-30T09:23:39+00:00"
        },
        {
            state: "21.93",
            last_changed: "2020-11-30T10:20:10+00:00"
        },
        {
            state: "22.44",
            last_changed: "2020-11-30T10:51:37+00:00"
        },
        {
            state: "22.95",
            last_changed: "2020-11-30T11:02:54+00:00"
        },
        {
            state: "23.06",
            last_changed: "2020-11-30T11:13:30+00:00"
        },
        {
            state: "23.47",
            last_changed: "2020-11-30T11:18:43+00:00"
        },
        {
            state: "23.99",
            last_changed: "2020-11-30T11:33:41+00:00"
        },
        {
            state: "23.85",
            last_changed: "2020-11-30T11:38:14+00:00"
        },
        {
            state: "23.33",
            last_changed: "2020-11-30T11:39:55+00:00"
        },
        {
            state: "22.78",
            last_changed: "2020-11-30T11:41:46+00:00"
        },
        {
            state: "23.32",
            last_changed: "2020-11-30T12:02:27+00:00"
        },
        {
            state: "23.26",
            last_changed: "2020-11-30T12:05:19+00:00"
        },
        {
            state: "23.3",
            last_changed: "2020-11-30T12:30:23+00:00"
        },
        {
            state: "23.19",
            last_changed: "2020-11-30T13:00:09+00:00"
        },
        {
            state: "23.18",
            last_changed: "2020-11-30T13:02:50+00:00"
        },
        {
            state: "23.0",
            last_changed: "2020-11-30T13:10:15+00:00"
        },
        {
            state: "22.86",
            last_changed: "2020-11-30T13:36:39+00:00"
        },
        {
            state: "22.79",
            last_changed: "2020-11-30T13:53:38+00:00"
        },
        {
            state: "22.65",
            last_changed: "2020-11-30T14:21:54+00:00"
        },
        {
            state: "22.61",
            last_changed: "2020-11-30T14:46:37+00:00"
        },
        {
            state: "22.43",
            last_changed: "2020-11-30T15:17:54+00:00"
        },
        {
            state: "22.4",
            last_changed: "2020-11-30T15:42:07+00:00"
        },
        {
            state: "22.26",
            last_changed: "2020-11-30T16:31:44+00:00"
        },
        {
            state: "22.27",
            last_changed: "2020-11-30T16:38:48+00:00"
        },
        {
            state: "22.24",
            last_changed: "2020-11-30T16:41:10+00:00"
        },
        {
            state: "22.22",
            last_changed: "2020-11-30T16:58:50+00:00"
        },
        {
            state: "22.13",
            last_changed: "2020-11-30T17:40:33+00:00"
        },
        {
            state: "22.2",
            last_changed: "2020-11-30T17:51:59+00:00"
        },
        {
            state: "22.0",
            last_changed: "2020-11-30T18:25:58+00:00"
        },
        {
            state: "21.78",
            last_changed: "2020-11-30T18:31:11+00:00"
        },
        {
            state: "21.97",
            last_changed: "2020-11-30T18:39:06+00:00"
        },
        {
            state: "22.5",
            last_changed: "2020-11-30T18:47:11+00:00"
        },
        {
            state: "23.02",
            last_changed: "2020-11-30T18:53:24+00:00"
        },
        {
            state: "23.53",
            last_changed: "2020-11-30T19:03:20+00:00"
        },
        {
            state: "24.03",
            last_changed: "2020-11-30T19:17:07+00:00"
        },
        {
            state: "24.12",
            last_changed: "2020-11-30T19:23:10+00:00"
        },
        {
            state: "24.26",
            last_changed: "2020-11-30T19:40:20+00:00"
        },
        {
            state: "24.3",
            last_changed: "2020-11-30T20:01:51+00:00"
        },
        {
            state: "24.2",
            last_changed: "2020-11-30T20:18:20+00:00"
        },
        {
            state: "24.24",
            last_changed: "2020-11-30T20:19:11+00:00"
        },
        {
            state: "24.36",
            last_changed: "2020-11-30T20:32:38+00:00"
        },
        {
            state: "24.57",
            last_changed: "2020-11-30T21:11:38+00:00"
        },
        {
            state: "24.6",
            last_changed: "2020-11-30T21:12:29+00:00"
        },
        {
            state: "24.8",
            last_changed: "2020-11-30T21:30:48+00:00"
        },
        {
            state: "24.73",
            last_changed: "2020-11-30T21:54:20+00:00"
        },
        {
            state: "24.66",
            last_changed: "2020-11-30T22:05:16+00:00"
        },
        {
            state: "24.5",
            last_changed: "2020-11-30T22:35:53+00:00"
        },
        {
            state: "23.99",
            last_changed: "2020-11-30T22:43:07+00:00"
        },
        {
            state: "23.88",
            last_changed: "2020-11-30T22:59:55+00:00"
        },
        {
            state: "23.77",
            last_changed: "2020-11-30T23:08:30+00:00"
        },
        {
            state: "23.78",
            last_changed: "2020-11-30T23:11:42+00:00"
        },
        {
            state: "23.73",
            last_changed: "2020-11-30T23:21:38+00:00"
        },
        {
            state: "23.47",
            last_changed: "2020-11-30T23:41:59+00:00"
        },
        {
            state: "23.38",
            last_changed: "2020-11-30T23:49:53+00:00"
        },
        {
            state: "23.23",
            last_changed: "2020-12-01T00:03:00+00:00"
        },
        {
            state: "22.88",
            last_changed: "2020-12-01T00:31:36+00:00"
        },
        {
            state: "22.82",
            last_changed: "2020-12-01T00:43:32+00:00"
        },
        {
            state: "22.67",
            last_changed: "2020-12-01T01:01:02+00:00"
        },
        {
            state: "22.28",
            last_changed: "2020-12-01T01:40:53+00:00"
        },
        {
            state: "22.27",
            last_changed: "2020-12-01T01:53:20+00:00"
        },
        {
            state: "22.19",
            last_changed: "2020-12-01T02:12:11+00:00"
        },
        {
            state: "22.0",
            last_changed: "2020-12-01T02:34:33+00:00"
        },
        {
            state: "21.99",
            last_changed: "2020-12-01T02:48:01+00:00"
        },
        {
            state: "21.96",
            last_changed: "2020-12-01T02:53:34+00:00"
        },
        {
            state: "21.89",
            last_changed: "2020-12-01T03:02:09+00:00"
        },
        {
            state: "21.82",
            last_changed: "2020-12-01T03:25:02+00:00"
        },
        {
            state: "21.73",
            last_changed: "2020-12-01T03:34:47+00:00"
        },
        {
            state: "21.69",
            last_changed: "2020-12-01T03:42:22+00:00"
        },
        {
            state: "21.65",
            last_changed: "2020-12-01T03:48:15+00:00"
        },
        {
            state: "21.64",
            last_changed: "2020-12-01T04:01:54+00:00"
        },
        {
            state: "21.59",
            last_changed: "2020-12-01T04:10:19+00:00"
        },
        {
            state: "21.54",
            last_changed: "2020-12-01T04:24:57+00:00"
        },
        {
            state: "21.51",
            last_changed: "2020-12-01T04:35:23+00:00"
        },
        {
            state: "21.55",
            last_changed: "2020-12-01T04:41:06+00:00"
        },
        {
            state: "21.73",
            last_changed: "2020-12-01T05:30:13+00:00"
        },
        {
            state: "21.71",
            last_changed: "2020-12-01T05:40:09+00:00"
        },
        {
            state: "21.73",
            last_changed: "2020-12-01T05:40:40+00:00"
        },
        {
            state: "21.78",
            last_changed: "2020-12-01T06:05:04+00:00"
        },
        {
            state: "21.73",
            last_changed: "2020-12-01T06:23:04+00:00"
        },
        {
            state: "21.75",
            last_changed: "2020-12-01T06:30:18+00:00"
        },
        {
            state: "21.76",
            last_changed: "2020-12-01T06:32:09+00:00"
        },
        {
            state: "21.85",
            last_changed: "2020-12-01T06:50:20+00:00"
        },
        {
            state: "22.12",
            last_changed: "2020-12-01T07:21:27+00:00"
        },
        {
            state: "22.19",
            last_changed: "2020-12-01T07:27:31+00:00"
        },
        {
            state: "22.3",
            last_changed: "2020-12-01T08:17:18+00:00"
        },
        {
            state: "22.23",
            last_changed: "2020-12-01T08:22:11+00:00"
        },
        {
            state: "21.78",
            last_changed: "2020-12-01T09:01:53+00:00"
        },
        {
            state: "21.92",
            last_changed: "2020-12-01T09:18:42+00:00"
        },
        {
            state: "21.95",
            last_changed: "2020-12-01T09:29:49+00:00"
        },
        {
            state: "21.97",
            last_changed: "2020-12-01T10:15:14+00:00"
        },
        {
            state: "22.02",
            last_changed: "2020-12-01T10:18:26+00:00"
        },
        {
            state: "21.51",
            last_changed: "2020-12-01T10:31:03+00:00"
        },
        {
            state: "21.73",
            last_changed: "2020-12-01T10:58:29+00:00"
        },
        {
            state: "21.2",
            last_changed: "2020-12-01T11:00:40+00:00"
        },
        {
            state: "21.61",
            last_changed: "2020-12-01T11:11:36+00:00"
        },
        {
            state: "21.71",
            last_changed: "2020-12-01T11:14:18+00:00"
        },
        {
            state: "21.18",
            last_changed: "2020-12-01T11:33:29+00:00"
        },
        {
            state: "21.69",
            last_changed: "2020-12-01T12:04:47+00:00"
        },
        {
            state: "21.72",
            last_changed: "2020-12-01T12:07:28+00:00"
        },
        {
            state: "21.96",
            last_changed: "2020-12-01T12:59:47+00:00"
        },
        {
            state: "21.93",
            last_changed: "2020-12-01T13:55:48+00:00"
        },
        {
            state: "21.83",
            last_changed: "2020-12-01T14:08:16+00:00"
        },
        {
            state: "21.86",
            last_changed: "2020-12-01T14:54:31+00:00"
        },
        {
            state: "22.02",
            last_changed: "2020-12-01T15:08:09+00:00"
        },
        {
            state: "22.4",
            last_changed: "2020-12-01T15:52:23+00:00"
        },
        {
            state: "22.55",
            last_changed: "2020-12-01T16:00:08+00:00"
        },
        {
            state: "22.53",
            last_changed: "2020-12-01T17:05:34+00:00"
        },
        {
            state: "22.44",
            last_changed: "2020-12-01T17:46:26+00:00"
        },
        {
            state: "21.91",
            last_changed: "2020-12-01T18:29:30+00:00"
        },
        {
            state: "22.41",
            last_changed: "2020-12-01T18:39:16+00:00"
        },
        {
            state: "22.74",
            last_changed: "2020-12-01T18:43:28+00:00"
        },
        {
            state: "22.92",
            last_changed: "2020-12-01T18:45:20+00:00"
        },
        {
            state: "23.85",
            last_changed: "2020-12-01T19:39:08+00:00"
        },
        {
            state: "23.96",
            last_changed: "2020-12-01T19:47:23+00:00"
        },
        {
            state: "24.06",
            last_changed: "2020-12-01T20:38:10+00:00"
        },
        {
            state: "24.4",
            last_changed: "2020-12-01T21:29:36+00:00"
        },
        {
            state: "24.47",
            last_changed: "2020-12-01T21:32:08+00:00"
        },
        {
            state: "24.32",
            last_changed: "2020-12-01T22:21:03+00:00"
        },
        {
            state: "23.44",
            last_changed: "2020-12-01T23:00:15+00:00"
        },
        {
            state: "23.3",
            last_changed: "2020-12-01T23:18:14+00:00"
        },
        {
            state: "23.06",
            last_changed: "2020-12-01T23:41:27+00:00"
        },
        {
            state: "22.78",
            last_changed: "2020-12-02T00:09:32+00:00"
        },
        {
            state: "22.55",
            last_changed: "2020-12-02T00:29:03+00:00"
        },
        {
            state: "22.34",
            last_changed: "2020-12-02T01:06:13+00:00"
        },
        {
            state: "22.33",
            last_changed: "2020-12-02T01:06:38+00:00"
        },
        {
            state: "22.05",
            last_changed: "2020-12-02T01:56:01+00:00"
        },
        {
            state: "22.02",
            last_changed: "2020-12-02T01:57:42+00:00"
        },
        {
            state: "21.86",
            last_changed: "2020-12-02T02:32:42+00:00"
        },
        {
            state: "21.76",
            last_changed: "2020-12-02T02:57:46+00:00"
        },
        {
            state: "21.78",
            last_changed: "2020-12-02T02:59:38+00:00"
        },
        {
            state: "21.52",
            last_changed: "2020-12-02T03:49:15+00:00"
        },
        {
            state: "21.4",
            last_changed: "2020-12-02T04:32:40+00:00"
        },
        {
            state: "21.38",
            last_changed: "2020-12-02T04:40:04+00:00"
        },
        {
            state: "21.57",
            last_changed: "2020-12-02T05:11:42+00:00"
        },
        {
            state: "21.61",
            last_changed: "2020-12-02T05:32:54+00:00"
        },
        {
            state: "21.69",
            last_changed: "2020-12-02T06:24:13+00:00"
        },
        {
            state: "21.73",
            last_changed: "2020-12-02T06:24:44+00:00"
        },
        {
            state: "21.95",
            last_changed: "2020-12-02T06:38:43+00:00"
        },
        {
            state: "22.05",
            last_changed: "2020-12-02T07:19:44+00:00"
        },
        {
            state: "22.45",
            last_changed: "2020-12-02T07:47:50+00:00"
        },
        {
            state: "22.44",
            last_changed: "2020-12-02T08:15:25+00:00"
        },
        {
            state: "22.4",
            last_changed: "2020-12-02T08:49:14+00:00"
        },
        {
            state: "22.33",
            last_changed: "2020-12-02T09:06:23+00:00"
        },
        {
            state: "21.86",
            last_changed: "2020-12-02T09:29:36+00:00"
        },
        {
            state: "21.36",
            last_changed: "2020-12-02T09:31:48+00:00"
        },
        {
            state: "21.76",
            last_changed: "2020-12-02T09:51:29+00:00"
        },
        {
            state: "21.82",
            last_changed: "2020-12-02T10:04:16+00:00"
        },
        {
            state: "21.96",
            last_changed: "2020-12-02T10:14:23+00:00"
        },
        {
            state: "22.03",
            last_changed: "2020-12-02T10:32:12+00:00"
        },
        {
            state: "21.52",
            last_changed: "2020-12-02T10:46:41+00:00"
        },
        {
            state: "21.65",
            last_changed: "2020-12-02T10:49:22+00:00"
        },
        {
            state: "21.76",
            last_changed: "2020-12-02T10:56:47+00:00"
        },
        {
            state: "22.17",
            last_changed: "2020-12-02T11:31:47+00:00"
        },
        {
            state: "22.22",
            last_changed: "2020-12-02T11:49:57+00:00"
        },
        {
            state: "21.72",
            last_changed: "2020-12-02T11:52:08+00:00"
        },
        {
            state: "21.64",
            last_changed: "2020-12-02T11:52:19+00:00"
        },
        {
            state: "22.24",
            last_changed: "2020-12-02T12:42:57+00:00"
        },
        {
            state: "22.27",
            last_changed: "2020-12-02T12:48:41+00:00"
        },
        {
            state: "22.26",
            last_changed: "2020-12-02T13:32:35+00:00"
        },
        {
            state: "22.13",
            last_changed: "2020-12-02T13:36:07+00:00"
        },
        {
            state: "21.69",
            last_changed: "2020-12-02T13:38:39+00:00"
        },
        {
            state: "21.62",
            last_changed: "2020-12-02T13:39:20+00:00"
        },
        {
            state: "22.02",
            last_changed: "2020-12-02T14:15:30+00:00"
        },
        {
            state: "22.05",
            last_changed: "2020-12-02T14:30:08+00:00"
        },
        {
            state: "21.95",
            last_changed: "2020-12-02T15:30:31+00:00"
        },
        {
            state: "21.91",
            last_changed: "2020-12-02T15:40:27+00:00"
        },
        {
            state: "21.8",
            last_changed: "2020-12-02T16:06:32+00:00"
        },
        {
            state: "21.92",
            last_changed: "2020-12-02T16:29:25+00:00"
        },
        {
            state: "21.91",
            last_changed: "2020-12-02T17:21:04+00:00"
        },
        {
            state: "21.92",
            last_changed: "2020-12-02T18:16:55+00:00"
        },
        {
            state: "21.79",
            last_changed: "2020-12-02T18:18:06+00:00"
        },
        {
            state: "21.29",
            last_changed: "2020-12-02T18:22:59+00:00"
        },
        {
            state: "21.79",
            last_changed: "2020-12-02T18:29:54+00:00"
        },
        {
            state: "22.33",
            last_changed: "2020-12-02T18:34:46+00:00"
        },
        {
            state: "22.88",
            last_changed: "2020-12-02T18:43:52+00:00"
        },
        {
            state: "22.6",
            last_changed: "2020-12-02T19:13:48+00:00"
        },
        {
            state: "23.15",
            last_changed: "2020-12-02T19:34:09+00:00"
        },
        {
            state: "23.46",
            last_changed: "2020-12-02T20:07:07+00:00"
        },
        {
            state: "23.65",
            last_changed: "2020-12-02T20:20:25+00:00"
        },
        {
            state: "23.87",
            last_changed: "2020-12-02T21:03:48+00:00"
        },
        {
            state: "24.18",
            last_changed: "2020-12-02T21:35:35+00:00"
        },
        {
            state: "24.15",
            last_changed: "2020-12-02T21:59:18+00:00"
        },
        {
            state: "23.64",
            last_changed: "2020-12-02T22:16:58+00:00"
        },
        {
            state: "23.58",
            last_changed: "2020-12-02T22:30:05+00:00"
        },
        {
            state: "23.47",
            last_changed: "2020-12-02T22:53:17+00:00"
        },
        {
            state: "23.4",
            last_changed: "2020-12-02T23:04:34+00:00"
        },
        {
            state: "23.2",
            last_changed: "2020-12-02T23:27:57+00:00"
        },
        {
            state: "23.03",
            last_changed: "2020-12-02T23:49:58+00:00"
        },
        {
            state: "22.88",
            last_changed: "2020-12-02T23:58:54+00:00"
        },
        {
            state: "22.75",
            last_changed: "2020-12-03T00:14:43+00:00"
        },
        {
            state: "22.51",
            last_changed: "2020-12-03T00:48:21+00:00"
        },
        {
            state: "22.24",
            last_changed: "2020-12-03T01:13:25+00:00"
        },
        {
            state: "22.05",
            last_changed: "2020-12-03T01:48:55+00:00"
        },
        {
            state: "21.89",
            last_changed: "2020-12-03T02:06:15+00:00"
        },
        {
            state: "21.82",
            last_changed: "2020-12-03T02:26:36+00:00"
        },
        {
            state: "21.73",
            last_changed: "2020-12-03T02:44:16+00:00"
        },
        {
            state: "21.67",
            last_changed: "2020-12-03T02:53:12+00:00"
        },
        {
            state: "21.54",
            last_changed: "2020-12-03T03:26:00+00:00"
        },
        {
            state: "21.5",
            last_changed: "2020-12-03T03:35:05+00:00"
        },
        {
            state: "21.47",
            last_changed: "2020-12-03T03:49:04+00:00"
        },
        {
            state: "21.27",
            last_changed: "2020-12-03T04:28:26+00:00"
        },
        {
            state: "21.31",
            last_changed: "2020-12-03T04:33:09+00:00"
        },
        {
            state: "21.36",
            last_changed: "2020-12-03T04:55:32+00:00"
        },
        {
            state: "21.44",
            last_changed: "2020-12-03T05:19:45+00:00"
        },
        {
            state: "21.45",
            last_changed: "2020-12-03T05:38:06+00:00"
        },
        {
            state: "21.54",
            last_changed: "2020-12-03T06:16:08+00:00"
        },
        {
            state: "21.85",
            last_changed: "2020-12-03T07:13:40+00:00"
        },
        {
            state: "22.05",
            last_changed: "2020-12-03T07:23:16+00:00"
        },
        {
            state: "unknown",
            last_changed: "2020-12-03T07:52:20+00:00"
        },
        {
            state: "0.0",
            last_changed: "2020-12-03T07:52:37+00:00"
        },
        {
            state: "22.0",
            last_changed: "2020-12-03T08:11:33+00:00"
        },
        {
            state: "22.13",
            last_changed: "2020-12-03T08:41:30+00:00"
        },
        {
            state: "22.09",
            last_changed: "2020-12-03T09:00:00+00:00"
        },
        {
            state: "22.05",
            last_changed: "2020-12-03T09:16:00+00:00"
        },
        {
            state: "21.83",
            last_changed: "2020-12-03T09:24:05+00:00"
        },
        {
            state: "21.65",
            last_changed: "2020-12-03T09:34:31+00:00"
        },
        {
            state: "21.78",
            last_changed: "2020-12-03T09:45:27+00:00"
        },
        {
            state: "21.83",
            last_changed: "2020-12-03T09:54:53+00:00"
        },
        {
            state: "21.68",
            last_changed: "2020-12-03T10:01:37+00:00"
        },
        {
            state: "21.14",
            last_changed: "2020-12-03T10:04:19+00:00"
        },
        {
            state: "21.36",
            last_changed: "2020-12-03T10:09:12+00:00"
        },
        {
            state: "21.41",
            last_changed: "2020-12-03T10:12:44+00:00"
        },
        {
            state: "21.58",
            last_changed: "2020-12-03T10:22:10+00:00"
        },
        {
            state: "21.69",
            last_changed: "2020-12-03T10:41:31+00:00"
        },
        {
            state: "21.47",
            last_changed: "2020-12-03T10:55:29+00:00"
        },
        {
            state: "21.4",
            last_changed: "2020-12-03T11:07:15+00:00"
        },
        {
            state: "21.27",
            last_changed: "2020-12-03T11:08:16+00:00"
        },
        {
            state: "21.59",
            last_changed: "2020-12-03T11:16:11+00:00"
        },
        {
            state: "22.12",
            last_changed: "2020-12-03T11:29:49+00:00"
        },
        {
            state: "21.79",
            last_changed: "2020-12-03T11:32:21+00:00"
        },
        {
            state: "21.29",
            last_changed: "2020-12-03T11:35:03+00:00"
        },
        {
            state: "21.8",
            last_changed: "2020-12-03T11:53:33+00:00"
        },
        {
            state: "22.07",
            last_changed: "2020-12-03T12:01:28+00:00"
        },
        {
            state: "22.31",
            last_changed: "2020-12-03T12:10:03+00:00"
        },
        {
            state: "22.4",
            last_changed: "2020-12-03T12:25:42+00:00"
        },
        {
            state: "22.37",
            last_changed: "2020-12-03T12:40:10+00:00"
        },
        {
            state: "22.16",
            last_changed: "2020-12-03T12:50:16+00:00"
        },
        {
            state: "21.62",
            last_changed: "2020-12-03T12:53:38+00:00"
        },
        {
            state: "21.36",
            last_changed: "2020-12-03T12:55:29+00:00"
        },
        {
            state: "21.57",
            last_changed: "2020-12-03T13:02:34+00:00"
        },
        {
            state: "21.75",
            last_changed: "2020-12-03T13:14:21+00:00"
        },
        {
            state: "21.85",
            last_changed: "2020-12-03T13:32:11+00:00"
        },
        {
            state: "21.91",
            last_changed: "2020-12-03T13:47:30+00:00"
        },
        {
            state: "21.88",
            last_changed: "2020-12-03T13:48:30+00:00"
        },
        {
            state: "21.91",
            last_changed: "2020-12-03T14:03:39+00:00"
        },
        {
            state: "21.83",
            last_changed: "2020-12-03T14:26:22+00:00"
        },
        {
            state: "21.79",
            last_changed: "2020-12-03T14:47:54+00:00"
        },
        {
            state: "21.75",
            last_changed: "2020-12-03T14:51:47+00:00"
        },
        {
            state: "21.71",
            last_changed: "2020-12-03T15:20:13+00:00"
        },
        {
            state: "21.73",
            last_changed: "2020-12-03T15:39:24+00:00"
        },
        {
            state: "21.72",
            last_changed: "2020-12-03T15:51:11+00:00"
        },
        {
            state: "21.69",
            last_changed: "2020-12-03T16:09:01+00:00"
        },
        {
            state: "21.64",
            last_changed: "2020-12-03T16:22:29+00:00"
        },
        {
            state: "21.69",
            last_changed: "2020-12-03T16:38:18+00:00"
        },
        {
            state: "21.65",
            last_changed: "2020-12-03T16:38:59+00:00"
        },
        {
            state: "21.64",
            last_changed: "2020-12-03T17:00:32+00:00"
        },
        {
            state: "21.65",
            last_changed: "2020-12-03T17:12:58+00:00"
        },
        {
            state: "21.64",
            last_changed: "2020-12-03T17:22:34+00:00"
        },
        {
            state: "21.71",
            last_changed: "2020-12-03T17:32:50+00:00"
        },
        {
            entity_id: "sensor.temp_sensor_temperature_kuche",
            state: "21.76",
            attributes: {
                unit_of_measurement: "°C",
                friendly_name: "Küche Temperatur",
                icon: "mdi:thermometer-lines"
            },
            last_changed: "2020-12-03T17:43:37+00:00",
            last_updated: "2020-12-03T17:43:37+00:00"
        }
    ],
    [
        {
            entity_id: "sensor.temperatur_eingang",
            state: "20.39",
            attributes: {
                battery: 68,
                device: {
                    applicationVersion: 3,
                    dateCode: "20161129",
                    friendlyName: "weatherflur1",
                    hardwareVersion: 30,
                    ieeeAddr: "0x00158d00036d3594",
                    manufacturerID: 4151,
                    manufacturerName: "LUMI",
                    model: "WSDCGQ11LM",
                    networkAddress: 1404,
                    powerSource: "Battery",
                    softwareBuildID: "3000-0001",
                    stackVersion: 2,
                    type: "EndDevice",
                    zclVersion: 1
                },
                elapsed: 3054729,
                humidity: 31.92,
                last_seen: "2020-11-30T00:54:32+01:00",
                linkquality: 13,
                pressure: 974.3,
                temperature: 20.39,
                voltage: 2945,
                unit_of_measurement: "°C",
                friendly_name: "Temperatur Eingang",
                icon: "mdi:thermometer-lines"
            },
            last_changed: "2020-11-30T00:00:00.271000+00:00",
            last_updated: "2020-11-30T00:00:00.271000+00:00"
        },
        {
            state: "20.45",
            last_changed: "2020-11-30T00:53:51+00:00"
        },
        {
            state: "20.29",
            last_changed: "2020-11-30T01:28:28+00:00"
        },
        {
            state: "20.31",
            last_changed: "2020-11-30T01:50:39+00:00"
        },
        {
            state: "20.32",
            last_changed: "2020-11-30T01:58:03+00:00"
        },
        {
            state: "20.25",
            last_changed: "2020-11-30T02:47:57+00:00"
        },
        {
            state: "20.22",
            last_changed: "2020-11-30T03:47:26+00:00"
        },
        {
            state: "20.19",
            last_changed: "2020-11-30T04:37:51+00:00"
        },
        {
            state: "20.15",
            last_changed: "2020-11-30T04:41:22+00:00"
        },
        {
            state: "20.09",
            last_changed: "2020-11-30T05:12:28+00:00"
        },
        {
            state: "20.07",
            last_changed: "2020-11-30T05:38:31+00:00"
        },
        {
            state: "20.03",
            last_changed: "2020-11-30T05:55:50+00:00"
        },
        {
            state: "20.09",
            last_changed: "2020-11-30T06:35:19+00:00"
        },
        {
            state: "20.11",
            last_changed: "2020-11-30T06:40:32+00:00"
        },
        {
            state: "20.04",
            last_changed: "2020-11-30T06:56:40+00:00"
        },
        {
            state: "20.09",
            last_changed: "2020-11-30T07:13:48+00:00"
        },
        {
            state: "20.04",
            last_changed: "2020-11-30T07:27:25+00:00"
        },
        {
            state: "19.97",
            last_changed: "2020-11-30T07:45:24+00:00"
        },
        {
            state: "20.11",
            last_changed: "2020-11-30T08:22:42+00:00"
        },
        {
            state: "20.07",
            last_changed: "2020-11-30T08:31:57+00:00"
        },
        {
            state: "20.08",
            last_changed: "2020-11-30T09:17:29+00:00"
        },
        {
            state: "20.11",
            last_changed: "2020-11-30T09:32:17+00:00"
        },
        {
            state: "20.12",
            last_changed: "2020-11-30T10:14:38+00:00"
        },
        {
            state: "20.09",
            last_changed: "2020-11-30T10:30:16+00:00"
        },
        {
            state: "20.15",
            last_changed: "2020-11-30T11:13:17+00:00"
        },
        {
            state: "20.08",
            last_changed: "2020-11-30T11:14:58+00:00"
        },
        {
            state: "20.09",
            last_changed: "2020-11-30T12:04:53+00:00"
        },
        {
            state: "20.15",
            last_changed: "2020-11-30T12:29:35+00:00"
        },
        {
            state: "20.11",
            last_changed: "2020-11-30T12:56:58+00:00"
        },
        {
            state: "20.07",
            last_changed: "2020-11-30T13:13:07+00:00"
        },
        {
            state: "20.12",
            last_changed: "2020-11-30T13:49:24+00:00"
        },
        {
            state: "20.15",
            last_changed: "2020-11-30T14:43:11+00:00"
        },
        {
            state: "20.18",
            last_changed: "2020-11-30T15:06:03+00:00"
        },
        {
            state: "20.22",
            last_changed: "2020-11-30T15:37:58+00:00"
        },
        {
            state: "20.25",
            last_changed: "2020-11-30T15:42:41+00:00"
        },
        {
            state: "20.27",
            last_changed: "2020-11-30T16:01:20+00:00"
        },
        {
            state: "20.22",
            last_changed: "2020-11-30T16:35:17+00:00"
        },
        {
            state: "20.21",
            last_changed: "2020-11-30T16:49:54+00:00"
        },
        {
            state: "20.25",
            last_changed: "2020-11-30T17:29:03+00:00"
        },
        {
            state: "20.24",
            last_changed: "2020-11-30T18:20:28+00:00"
        },
        {
            state: "20.21",
            last_changed: "2020-11-30T18:43:50+00:00"
        },
        {
            state: "20.28",
            last_changed: "2020-11-30T19:17:06+00:00"
        },
        {
            state: "20.25",
            last_changed: "2020-11-30T19:40:58+00:00"
        },
        {
            state: "20.19",
            last_changed: "2020-11-30T20:08:12+00:00"
        },
        {
            state: "20.24",
            last_changed: "2020-11-30T20:22:49+00:00"
        },
        {
            state: "20.28",
            last_changed: "2020-11-30T21:00:18+00:00"
        },
        {
            state: "20.29",
            last_changed: "2020-11-30T21:12:14+00:00"
        },
        {
            state: "20.28",
            last_changed: "2020-11-30T21:33:35+00:00"
        },
        {
            state: "20.29",
            last_changed: "2020-11-30T21:56:56+00:00"
        },
        {
            state: "20.28",
            last_changed: "2020-11-30T21:57:27+00:00"
        },
        {
            state: "20.32",
            last_changed: "2020-11-30T22:37:57+00:00"
        },
        {
            state: "20.39",
            last_changed: "2020-11-30T22:51:23+00:00"
        },
        {
            state: "20.35",
            last_changed: "2020-11-30T22:58:58+00:00"
        },
        {
            state: "20.31",
            last_changed: "2020-11-30T23:20:39+00:00"
        },
        {
            state: "20.29",
            last_changed: "2020-11-30T23:41:49+00:00"
        },
        {
            state: "20.32",
            last_changed: "2020-11-30T23:51:34+00:00"
        },
        {
            state: "20.34",
            last_changed: "2020-12-01T00:40:48+00:00"
        },
        {
            state: "20.27",
            last_changed: "2020-12-01T00:48:42+00:00"
        },
        {
            state: "20.28",
            last_changed: "2020-12-01T01:10:33+00:00"
        },
        {
            state: "20.25",
            last_changed: "2020-12-01T01:29:12+00:00"
        },
        {
            state: "20.24",
            last_changed: "2020-12-01T01:41:49+00:00"
        },
        {
            state: "20.19",
            last_changed: "2020-12-01T02:05:41+00:00"
        },
        {
            state: "20.18",
            last_changed: "2020-12-01T02:31:34+00:00"
        },
        {
            state: "20.15",
            last_changed: "2020-12-01T02:34:55+00:00"
        },
        {
            state: "20.22",
            last_changed: "2020-12-01T02:36:07+00:00"
        },
        {
            state: "20.14",
            last_changed: "2020-12-01T02:59:28+00:00"
        },
        {
            state: "20.12",
            last_changed: "2020-12-01T03:14:56+00:00"
        },
        {
            state: "20.11",
            last_changed: "2020-12-01T03:31:14+00:00"
        },
        {
            state: "20.08",
            last_changed: "2020-12-01T03:32:15+00:00"
        },
        {
            state: "20.11",
            last_changed: "2020-12-01T03:40:29+00:00"
        },
        {
            state: "20.08",
            last_changed: "2020-12-01T03:53:16+00:00"
        },
        {
            state: "20.04",
            last_changed: "2020-12-01T04:00:29+00:00"
        },
        {
            state: "20.03",
            last_changed: "2020-12-01T04:05:12+00:00"
        },
        {
            state: "20.01",
            last_changed: "2020-12-01T04:15:27+00:00"
        },
        {
            state: "19.98",
            last_changed: "2020-12-01T04:25:12+00:00"
        },
        {
            state: "19.96",
            last_changed: "2020-12-01T04:31:26+00:00"
        },
        {
            state: "19.94",
            last_changed: "2020-12-01T05:17:18+00:00"
        },
        {
            state: "19.92",
            last_changed: "2020-12-01T05:18:29+00:00"
        },
        {
            state: "19.85",
            last_changed: "2020-12-01T05:32:16+00:00"
        },
        {
            state: "19.87",
            last_changed: "2020-12-01T05:44:32+00:00"
        },
        {
            state: "19.89",
            last_changed: "2020-12-01T05:51:56+00:00"
        },
        {
            state: "19.88",
            last_changed: "2020-12-01T06:05:13+00:00"
        },
        {
            state: "19.84",
            last_changed: "2020-12-01T06:11:46+00:00"
        },
        {
            state: "19.83",
            last_changed: "2020-12-01T06:24:43+00:00"
        },
        {
            state: "19.84",
            last_changed: "2020-12-01T06:41:32+00:00"
        },
        {
            state: "19.87",
            last_changed: "2020-12-01T06:48:35+00:00"
        },
        {
            state: "19.84",
            last_changed: "2020-12-01T07:09:05+00:00"
        },
        {
            state: "19.81",
            last_changed: "2020-12-01T07:42:22+00:00"
        },
        {
            state: "19.96",
            last_changed: "2020-12-01T08:07:35+00:00"
        },
        {
            state: "19.91",
            last_changed: "2020-12-01T09:06:35+00:00"
        },
        {
            state: "20.01",
            last_changed: "2020-12-01T09:54:18+00:00"
        },
        {
            state: "19.91",
            last_changed: "2020-12-01T10:42:02+00:00"
        },
        {
            state: "19.88",
            last_changed: "2020-12-01T10:48:15+00:00"
        },
        {
            state: "19.91",
            last_changed: "2020-12-01T11:13:18+00:00"
        },
        {
            state: "19.89",
            last_changed: "2020-12-01T11:45:54+00:00"
        },
        {
            state: "19.92",
            last_changed: "2020-12-01T11:46:35+00:00"
        },
        {
            state: "19.96",
            last_changed: "2020-12-01T12:37:30+00:00"
        },
        {
            state: "19.91",
            last_changed: "2020-12-01T13:30:07+00:00"
        },
        {
            state: "19.94",
            last_changed: "2020-12-01T13:54:28+00:00"
        },
        {
            state: "19.92",
            last_changed: "2020-12-01T14:27:04+00:00"
        },
        {
            state: "20.0",
            last_changed: "2020-12-01T15:04:53+00:00"
        },
        {
            state: "20.03",
            last_changed: "2020-12-01T15:22:52+00:00"
        },
        {
            state: "20.01",
            last_changed: "2020-12-01T16:17:49+00:00"
        },
        {
            state: "20.05",
            last_changed: "2020-12-01T16:34:48+00:00"
        },
        {
            state: "20.15",
            last_changed: "2020-12-01T19:14:47+00:00"
        },
        {
            state: "20.17",
            last_changed: "2020-12-01T20:07:23+00:00"
        },
        {
            state: "20.31",
            last_changed: "2020-12-01T21:54:56+00:00"
        },
        {
            state: "20.35",
            last_changed: "2020-12-01T22:53:24+00:00"
        },
        {
            state: "20.39",
            last_changed: "2020-12-01T23:38:37+00:00"
        },
        {
            state: "20.34",
            last_changed: "2020-12-01T23:51:03+00:00"
        },
        {
            state: "20.36",
            last_changed: "2020-12-02T00:39:37+00:00"
        },
        {
            state: "20.31",
            last_changed: "2020-12-02T00:50:32+00:00"
        },
        {
            state: "20.27",
            last_changed: "2020-12-02T01:20:07+00:00"
        },
        {
            state: "20.28",
            last_changed: "2020-12-02T01:43:49+00:00"
        },
        {
            state: "20.27",
            last_changed: "2020-12-02T02:39:57+00:00"
        },
        {
            state: "20.24",
            last_changed: "2020-12-02T02:45:50+00:00"
        },
        {
            state: "20.22",
            last_changed: "2020-12-02T03:33:54+00:00"
        },
        {
            state: "20.21",
            last_changed: "2020-12-02T03:40:17+00:00"
        },
        {
            state: "20.12",
            last_changed: "2020-12-02T04:29:11+00:00"
        },
        {
            state: "20.07",
            last_changed: "2020-12-02T05:00:07+00:00"
        },
        {
            state: "20.03",
            last_changed: "2020-12-02T05:28:20+00:00"
        },
        {
            state: "20.05",
            last_changed: "2020-12-02T06:03:38+00:00"
        },
        {
            state: "20.01",
            last_changed: "2020-12-02T06:28:41+00:00"
        },
        {
            state: "20.0",
            last_changed: "2020-12-02T07:49:52+00:00"
        },
        {
            state: "20.01",
            last_changed: "2020-12-02T08:24:49+00:00"
        },
        {
            state: "20.0",
            last_changed: "2020-12-02T08:47:51+00:00"
        },
        {
            state: "19.94",
            last_changed: "2020-12-02T09:22:18+00:00"
        },
        {
            state: "20.03",
            last_changed: "2020-12-02T09:50:22+00:00"
        },
        {
            state: "20.01",
            last_changed: "2020-12-02T10:06:10+00:00"
        },
        {
            state: "20.0",
            last_changed: "2020-12-02T10:18:56+00:00"
        },
        {
            state: "19.98",
            last_changed: "2020-12-02T10:31:13+00:00"
        },
        {
            state: "19.97",
            last_changed: "2020-12-02T11:04:10+00:00"
        },
        {
            state: "19.98",
            last_changed: "2020-12-02T11:18:07+00:00"
        },
        {
            state: "19.87",
            last_changed: "2020-12-02T11:57:47+00:00"
        },
        {
            state: "19.88",
            last_changed: "2020-12-02T12:11:24+00:00"
        },
        {
            state: "19.89",
            last_changed: "2020-12-02T12:35:06+00:00"
        },
        {
            state: "19.92",
            last_changed: "2020-12-02T13:06:11+00:00"
        },
        {
            state: "19.91",
            last_changed: "2020-12-02T13:19:08+00:00"
        },
        {
            state: "19.89",
            last_changed: "2020-12-02T13:59:58+00:00"
        },
        {
            state: "19.84",
            last_changed: "2020-12-02T14:54:25+00:00"
        },
        {
            state: "19.83",
            last_changed: "2020-12-02T14:56:27+00:00"
        },
        {
            state: "19.87",
            last_changed: "2020-12-02T15:53:25+00:00"
        },
        {
            state: "19.81",
            last_changed: "2020-12-02T15:55:57+00:00"
        },
        {
            state: "19.8",
            last_changed: "2020-12-02T16:53:15+00:00"
        },
        {
            state: "19.83",
            last_changed: "2020-12-02T17:19:09+00:00"
        },
        {
            state: "19.85",
            last_changed: "2020-12-02T17:48:53+00:00"
        },
        {
            state: "19.84",
            last_changed: "2020-12-02T18:16:48+00:00"
        },
        {
            state: "19.77",
            last_changed: "2020-12-02T18:47:53+00:00"
        },
        {
            state: "19.83",
            last_changed: "2020-12-02T19:09:34+00:00"
        },
        {
            state: "19.89",
            last_changed: "2020-12-02T19:48:03+00:00"
        },
        {
            state: "19.85",
            last_changed: "2020-12-02T20:43:51+00:00"
        },
        {
            state: "19.92",
            last_changed: "2020-12-02T21:36:27+00:00"
        },
        {
            state: "19.89",
            last_changed: "2020-12-02T21:37:18+00:00"
        },
        {
            state: "19.88",
            last_changed: "2020-12-02T21:56:18+00:00"
        },
        {
            state: "19.92",
            last_changed: "2020-12-02T22:25:22+00:00"
        },
        {
            state: "19.94",
            last_changed: "2020-12-02T22:31:46+00:00"
        },
        {
            state: "19.88",
            last_changed: "2020-12-02T22:57:59+00:00"
        },
        {
            state: "19.91",
            last_changed: "2020-12-02T23:24:02+00:00"
        },
        {
            state: "19.92",
            last_changed: "2020-12-02T23:25:43+00:00"
        },
        {
            state: "19.96",
            last_changed: "2020-12-02T23:35:59+00:00"
        },
        {
            state: "19.94",
            last_changed: "2020-12-03T00:10:36+00:00"
        },
        {
            state: "19.91",
            last_changed: "2020-12-03T00:23:43+00:00"
        },
        {
            state: "19.89",
            last_changed: "2020-12-03T00:36:40+00:00"
        },
        {
            state: "19.94",
            last_changed: "2020-12-03T01:04:34+00:00"
        },
        {
            state: "19.91",
            last_changed: "2020-12-03T01:19:01+00:00"
        },
        {
            state: "19.78",
            last_changed: "2020-12-03T02:07:25+00:00"
        },
        {
            state: "19.84",
            last_changed: "2020-12-03T02:18:10+00:00"
        },
        {
            state: "19.81",
            last_changed: "2020-12-03T02:30:27+00:00"
        },
        {
            state: "19.8",
            last_changed: "2020-12-03T02:54:39+00:00"
        },
        {
            state: "19.78",
            last_changed: "2020-12-03T03:26:06+00:00"
        },
        {
            state: "19.76",
            last_changed: "2020-12-03T03:47:26+00:00"
        },
        {
            state: "19.71",
            last_changed: "2020-12-03T04:07:26+00:00"
        },
        {
            state: "19.66",
            last_changed: "2020-12-03T04:30:18+00:00"
        },
        {
            state: "19.6",
            last_changed: "2020-12-03T04:51:19+00:00"
        },
        {
            state: "19.68",
            last_changed: "2020-12-03T05:01:34+00:00"
        },
        {
            state: "19.59",
            last_changed: "2020-12-03T05:36:22+00:00"
        },
        {
            state: "19.54",
            last_changed: "2020-12-03T05:54:51+00:00"
        },
        {
            state: "19.57",
            last_changed: "2020-12-03T06:34:11+00:00"
        },
        {
            state: "19.56",
            last_changed: "2020-12-03T06:47:48+00:00"
        },
        {
            state: "19.5",
            last_changed: "2020-12-03T07:41:05+00:00"
        },
        {
            state: "unknown",
            last_changed: "2020-12-03T07:52:23+00:00"
        },
        {
            state: "19.52",
            last_changed: "2020-12-03T08:39:05+00:00"
        },
        {
            state: "19.49",
            last_changed: "2020-12-03T08:41:47+00:00"
        },
        {
            state: "19.46",
            last_changed: "2020-12-03T09:30:21+00:00"
        },
        {
            state: "19.47",
            last_changed: "2020-12-03T09:38:06+00:00"
        },
        {
            state: "19.52",
            last_changed: "2020-12-03T09:42:38+00:00"
        },
        {
            state: "19.5",
            last_changed: "2020-12-03T09:50:33+00:00"
        },
        {
            state: "19.54",
            last_changed: "2020-12-03T10:01:18+00:00"
        },
        {
            state: "19.5",
            last_changed: "2020-12-03T10:10:43+00:00"
        },
        {
            state: "19.52",
            last_changed: "2020-12-03T10:18:27+00:00"
        },
        {
            state: "19.49",
            last_changed: "2020-12-03T10:42:54+00:00"
        },
        {
            state: "19.54",
            last_changed: "2020-12-03T10:56:27+00:00"
        },
        {
            state: "19.64",
            last_changed: "2020-12-03T11:25:02+00:00"
        },
        {
            state: "19.61",
            last_changed: "2020-12-03T11:32:06+00:00"
        },
        {
            state: "19.67",
            last_changed: "2020-12-03T11:52:26+00:00"
        },
        {
            state: "19.66",
            last_changed: "2020-12-03T12:20:51+00:00"
        },
        {
            state: "19.74",
            last_changed: "2020-12-03T12:27:14+00:00"
        },
        {
            state: "19.67",
            last_changed: "2020-12-03T12:32:07+00:00"
        },
        {
            state: "19.89",
            last_changed: "2020-12-03T13:00:52+00:00"
        },
        {
            state: "19.97",
            last_changed: "2020-12-03T13:10:17+00:00"
        },
        {
            state: "20.01",
            last_changed: "2020-12-03T13:19:21+00:00"
        },
        {
            state: "19.92",
            last_changed: "2020-12-03T13:30:48+00:00"
        },
        {
            state: "19.97",
            last_changed: "2020-12-03T13:45:45+00:00"
        },
        {
            state: "20.05",
            last_changed: "2020-12-03T13:57:21+00:00"
        },
        {
            state: "20.04",
            last_changed: "2020-12-03T14:14:30+00:00"
        },
        {
            state: "20.09",
            last_changed: "2020-12-03T14:24:36+00:00"
        },
        {
            state: "20.07",
            last_changed: "2020-12-03T14:35:21+00:00"
        },
        {
            state: "20.09",
            last_changed: "2020-12-03T14:49:38+00:00"
        },
        {
            state: "20.08",
            last_changed: "2020-12-03T15:14:41+00:00"
        },
        {
            state: "20.09",
            last_changed: "2020-12-03T15:27:08+00:00"
        },
        {
            state: "20.14",
            last_changed: "2020-12-03T16:05:27+00:00"
        },
        {
            state: "20.17",
            last_changed: "2020-12-03T16:14:41+00:00"
        },
        {
            state: "20.14",
            last_changed: "2020-12-03T16:20:15+00:00"
        },
        {
            state: "20.15",
            last_changed: "2020-12-03T16:31:11+00:00"
        },
        {
            state: "20.17",
            last_changed: "2020-12-03T16:54:22+00:00"
        },
        {
            state: "20.14",
            last_changed: "2020-12-03T17:08:29+00:00"
        },
        {
            state: "20.17",
            last_changed: "2020-12-03T17:13:12+00:00"
        },
        {
            state: "20.21",
            last_changed: "2020-12-03T17:26:39+00:00"
        },
        {
            entity_id: "sensor.temperatur_eingang",
            state: "20.15",
            attributes: {
                battery: 62,
                device: {
                    applicationVersion: 3,
                    dateCode: "20161129",
                    friendlyName: "weatherflur1",
                    hardwareVersion: 30,
                    ieeeAddr: "0x00158d00036d3594",
                    manufacturerID: 4151,
                    manufacturerName: "LUMI",
                    model: "WSDCGQ11LM",
                    networkAddress: 1404,
                    powerSource: "Battery",
                    softwareBuildID: "3000-0001",
                    stackVersion: 2,
                    type: "EndDevice",
                    zclVersion: 1
                },
                elapsed: 655555,
                humidity: 32.28,
                last_seen: "2020-12-03T18:37:35+01:00",
                linkquality: 23,
                pressure: 952,
                temperature: 20.15,
                voltage: 2935,
                unit_of_measurement: "°C",
                friendly_name: "Temperatur Eingang",
                icon: "mdi:thermometer-lines"
            },
            last_changed: "2020-12-03T17:37:35+00:00",
            last_updated: "2020-12-03T17:37:35+00:00"
        }
    ]
];

let datalist = _getGroupHistoryData(_data[0], _dateFormatPattern("hour"), "last");
console.log(datalist);
