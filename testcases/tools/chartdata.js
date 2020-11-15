"use strict";

/**
 * simulate data provider
 */
var Data = global.Data || (global.Data = {});
Data = {
    /**
     * Get a random floating point number between `min` and `max`.
     * 
     * @param {number} min - min number
     * @param {number} max - max number
     * @return {number} a random floating point number
     */
    getRandomFloat(min, max) {
        return Math.random() * (max - min) + min;
    },
    /**
     * Get a random integer between `min` and `max`.
     * 
     * @param {number} min - min number
     * @param {number} max - max number
     * @return {number} a random integer
     */
    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    },
    /**
     * Get simulated history data for the defined sensors
     * @param {number} rows 
     * @param {list} sensorlist 
     */
    histroydata(rows, sensorlist) {
        let records = [];
        sensorlist.forEach((sensor, i) => {
            let startTime = new Date();
            let dataset = []
            for (let row = 0; row < rows; ++row) {
                startTime.setHours(startTime.getHours() + row)
                let data = {
                    id: sensor,
                    state: this.getRandomFloat(100, 1000).toFixed(2),
                    timestamp: startTime.toISOString(),
                }
                dataset.push(data)
            }
            records.push(dataset)
        })
        return records
    }
}




/**
 * Data transformation for charts.js
 */
var Transform = global.Transform || (global.Transform = {});
Transform = {
    /**
     * get the data labels 
     * @param {list} data 
     */
    datalabels(data) {
        console.log(data)
        return data.map((items, index) => ([
            items.reduce((a, b) => a.id),
        ]))
    },
    /**
     * get the statistics data min, max, sum, avg values for the 
     * series data
     * @param {list} data 
     */
    statistics(data) {
        return data.map((items, index) => ([{
            item: items.reduce((a, b) => a.id),
            min: Math.max.apply(Math, items.map(function(o) {
                return o.state;
            })),
            max: Math.max.apply(Math, items.map(function(o) {
                return o.state;
            })),
            sum: (items.reduce((n, {
                state
            }) => n + parseFloat(state), 0)).toFixed(2),
            avg: ((items.reduce((n, {
                state
            }) => n + parseFloat(state), 0)) / items.length).toFixed(2),
            count: items.length + 1
        }]))
    },
    /**
     * get the dataset for the selected chart
     * @param {list} historydata 
     * @param {string} type 
     */
    dataset(historydata, type) {
        let datasets = {
            data: [],
            labels: [],
            statistics: []
        }
        let mode = ['line', "bar", "horizontalBar"].includes(type) ? 1 : type === 'scatter' ? 2 : 3;
        if (mode == 1) {
            // ---------------------------------------------
            // line, bar charts
            // ---------------------------------------------
            datasets.data = historydata.map((item, index) => (
                item.map((d, index) => ({
                    x: d.timestamp,
                    y: parseFloat(d.state),
                }))
            ))
            datasets.labels = this.datalabels(historydata)
            datasets.statistics = this.statistics(historydata)
        } else if (mode == 2) {
            // ---------------------------------------------
            // scatter chart 
            // ---------------------------------------------
            for (let r = 0; r < historydata.length; r += 2) {
                historydata[r].forEach(function(e, i) {
                    if (r + 1 > historydata.length - 1) return
                    if (historydata[r][i] && historydata[r][i]) {
                        datasets.data.push({
                            x: parseFloat(historydata[r + 0][i].state) || 0.0,
                            y: parseFloat(historydata[r + 1][i].state || 0.0)
                        });
                    }
                });
            }
        } else {
            // ---------------------------------------------
            // pie, doughnut, polarArea, bubble
            // ---------------------------------------------
            let items = [];
            for (let r = 0; r < historydata.length; r += 3) {
                historydata[r].forEach(function(e, i) {
                    if (historydata[r + 1][i] && historydata[r + 2][i]) {
                        let _value = parseFloat(historydata[r + 2][i].state || 0.0)
                        datasets.data.push({
                            x: parseFloat(historydata[r + 0][i].state) || 0.0,
                            y: parseFloat(historydata[r + 1][i].state || 0.0),
                            r: _value
                        });
                        items.push({
                            id: historydata[r + 2][i].id,
                            state: _value
                        })
                    }
                });
                datasets.statistics.push({
                    max: Math.max(...items.map(item => item.state)),
                    min: Math.min(...items.map(item => item.state)),
                    sum: (items.reduce((n, {
                        state
                    }) => n + parseFloat(state), 0)).toFixed(2),
                    avg: ((items.reduce((n, {
                        state
                    }) => n + parseFloat(state), 0)) / items.length).toFixed(2),
                    count: historydata.length

                })
                datasets.labels = items.map(item => item.id).filter((value, index, self) => self.indexOf(value) === index)
            }
        }
        return datasets
    }
}

const availableTypes = [
    "line", // [{x:1,y:1},{x:2,y:2},{x:2,y:2},{x:2,y:2}...],[...]...
    "bar", // data: [{x:'2016-12-25', y:20}, {x:'2016-12-26', y:10}]
    "horizontalBar", // data: [{x:'2016-12-25', y:20}, {x:'2016-12-26', y:10}]
    "radar", // [1,1,1],[2,2,2],[3,3,3]....
    "pie", // data: [[10, 20, 30],[10, 20, 30]
    "doughnut", // data: [10, 20, 30]
    "polarArea", // data: [10, 20, 30]
    "bubble", // data: [10, 20, 30] 
    "scatter", // data: [10, 20]

];

// build the data for 12h...
let historydata = Data.histroydata(4, ['data1', 'data2', 'data3','data4','data5','data6']);
availableTypes.forEach((type) => {
    console.log(JSON.stringify(Transform.dataset(historydata, type)));
})