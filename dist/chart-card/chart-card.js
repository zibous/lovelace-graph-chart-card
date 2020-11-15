/**
 * License: MIT
 * Generated on 2020
 * Author: Peter siebler
 */

/** ----------------------------------------------------------
 
	Lovelaces chartjs - tools
  	(c) 2020 Peter Siebler
  	Released under the MIT license
 
 * ----------------------------------------------------------*/

/**
 * data formatter
 * @param {*} d
 * @param {*} fmt
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

// console.log(new Intl.DateTimeFormat('default', {
//     hour: 'numeric',
//     minute: 'numeric',
//     second: 'numeric'
//   }).format(date))
//   // → '2:00:00 pm'

//   console.log(new Intl.DateTimeFormat('en-US', {
//     year: 'numeric',
//     month: 'numeric',
//     day: 'numeric'
//   }).format(date))
//   // → '12/19/2012'

// {
//     weekday: 'narrow' | 'short' | 'long',
//     era: 'narrow' | 'short' | 'long',
//     year: 'numeric' | '2-digit',
//     month: 'numeric' | '2-digit' | 'narrow' | 'short' | 'long',
//     day: 'numeric' | '2-digit',
//     hour: 'numeric' | '2-digit',
//     minute: 'numeric' | '2-digit',
//     second: 'numeric' | '2-digit',
//     timeZoneName: 'short' | 'long',

//     // Time zone to express it in
//     timeZone: 'Asia/Shanghai',
//     // Force 12-hour or 24-hour
//     hour12: true | false,

//     // Rarely-used options
//     hourCycle: 'h11' | 'h12' | 'h23' | 'h24',
//     formatMatcher: 'basic' | 'best fit'
//   }

/**
 * get the date based on the locale
 * @param {*} d
 * @param {*} locale
 */
function localDate(d, locale) {
    const date = new Date(d);
    return new Intl.DateTimeFormat(locale).format(date);
}

/**
 * get the date based on the locale
 * @param {*} d
 * @param {*} locale
 */
function localDatetime(d, locale) {
    const date = new Date(d);
    return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric"
    }).format(date);
}

function timeStampLabel(d, locale) {
    const date = new Date(d);
    const datestr = new Intl.DateTimeFormat(locale, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric"
    }).format(date);
    return datestr.split(",");
}

/**
 * remove node from object
 * @param {*} obj
 * @param {*} keys
 */
function reject(obj, keys) {
    return Object.keys(obj)
        .filter((k) => !keys.includes(k))
        .map((k) => Object.assign({}, { [k]: obj[k] }))
        .reduce((res, o) => Object.assign(res, o), {});
}

/**
 * number format integer or float
 * @param {*} n
 */
function num(n) {
    return n === parseInt(n) ? parseInt(n) : parseFloat(n).toFixed(2);
}


/**
 * Deep Merge
 * Used to merge the default and chart options, because the
 * helper.merge will not work...
 *
 * @param  {...any} sources
 * @returns combined object
 */
function deepMerge(...sources) {
    let acc = {};
    for (const source of sources) {
        if (source instanceof Array) {
            if (!(acc instanceof Array)) {
                acc = [];
            }
            acc = [...acc, ...source];
        } else if (source instanceof Object) {
            for (let [key, value] of Object.entries(source)) {
                if (value instanceof Object && key in acc) {
                    value = deepMerge(acc[key], value);
                }
                acc = {
                    ...acc,
                    [key]: value
                };
            }
        }
    }
    return acc;
}

/** ----------------------------------------------------------
 
	Lovelaces chartjs - colors
  	(c) 2020 Peter Siebler
  	Released under the MIT license
 
 * ----------------------------------------------------------*/
const DEFAULT_COLORS = [
    "rgba(237,212,0,0.85)",
    "rgba(115,210,22,0.85)",
    "rgba(245,121,0,0.85)",
    "rgba(52,101,164,0.85)",
    "rgba(89,161,79,0.85)",
    "rgba(182,153,45,0.85)",
    "rgba(73,152,148,0.85)",
    "rgba(225,87,89,0.85)",
    "rgba(121,112,110,0.85)",
    "rgba(211,114,149,0.85)",
    "rgba(176,122,161,0.85)",
    "rgba(157,118,96,0.85)",
    "rgba(52,152,219,0.85)",
    "rgba(46,204,113,0.85)",
    "rgba(241,196,15,0.85)",
    "rgba(155,89,182,0.85)",
    "rgba(26,188,156,0.85)",
    "rgba(39,174,96,0.85)",
    "rgba(41,128,185,0.85)",
    "rgba(142,68,173,0.85)",
    "rgba(44,62,80,0.85)",
    "rgba(230,126,34,0.85)",
    "rgba(231,76,60,0.85)",
    "rgba(236,240,241,0.85)",
    "rgba(149,165,166,0.85)",
    "rgba(243,156,18,0.85)",
    "rgba(211,84,0,0.85)",
    "rgba(192,57,43,0.85)",
    "rgba(229,28,35,0.85)",
    "rgba(205,220,57,0.85)",
    "rgba(52,152,219,0.85)",
    "rgba(231,76,60,0.85)",
    "rgba(155,89,182,0.85)",
    "rgba(241,196,15,0.85)",
    "rgba(46,204,113,0.85)",
    "rgba(26,188,156,0.85)",
    "rgba(52,73,94,0.85)",
    "rgba(230,126,34,0.85)",
    "rgba(127,140,141,0.85)",
    "rgba(39,174,96,0.85)",
    "rgba(41,128,185,0.85)",
    "rgba(142,68,173,0.85)"
];

const COLOR_RADARCHART = "rgba(41, 182, 246, 0.45)";
const COLOR_BUBBLECHAT = "rgba(255, 152, 0, 0.685)";
/**
 * get random color from DEFAULT_COLORS
 */
// var randomColor = DEFAULT_COLORS[Math.floor(Math.random()*DEFAULT_COLORS.length)];
const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);

/** ----------------------------------------------------------

  	chart data builder
  
  	TODO: this is not final, try to find a optimized methode
  
 * ----------------------------------------------------------*/

/**
 * class chart data builder
 */
class chartData {
    /**
     * constructor chart data
     * @param {*} config
     */
    constructor(config) {
        this.chart_type = config.chart_type;
        this.card_config = config.card_config;
        this.entities = config.entities;
        this.entityOptions = config.entityOptions;
        this.entityData = config.entityData;
        this.entityNames = config.entityNames;
        this.stateHistories = config.stateHistories;
        this.data_dateGroup = config.data_dateGroup || "%Y-%M-%d %H:00:00";
        this.settings = config.settings;
        this.data_aggregate = config.aggregate || "last";
        this.graphData = {};
    }

    /**
     * build the grouped historydata
     *
     *
     * TODO: this is not final, try to find a optimized methode
     * ---------------------------------------------------------
     * @param {*} array
     * @param {*} fmt
     * @param {*} aggr
     */
    _getGroupHistoryData(array, fmt, aggr) {
        try {
            let groups = {};
            array.forEach(function (o) {
                let group = formatDate(o.last_changed, fmt);
                groups[group] = groups[group] || [];
                o.timestamp = formatDate(o.last_changed, "timestamp");
                o.last_changed = group;
                groups[group].push(o);
            });
            return Object.keys(groups).map(function (group) {
                let items = groups[group].filter((item) => !isNaN(parseFloat(item.state)) && isFinite(item.state));
                if (aggr == "first") {
                    const item = items.shift();
                    return {
                        y: num(item.state),
                        x: item.last_changed
                    };
                }
                if (aggr == "last") {
                    const item = items[items.length - 1];
                    return {
                        y: num(item.state),
                        x: item.last_changed
                    };
                }
                if (aggr == "max") {
                    return items.reduce((a, b) =>
                        a.state > b.state
                            ? {
                                  y: num(a.state),
                                  x: a.last_changed
                              }
                            : { y: num(b.state), x: b.last_changed }
                    );
                }
                if (aggr == "min")
                    return items.reduce((a, b) =>
                        a.state < b.state
                            ? {
                                  y: num(a.state),
                                  x: a.last_changed
                              }
                            : {
                                  y: num(b.state),
                                  x: b.last_changed
                              }
                    );
                if (aggr == "sum") {
                    const val = items.reduce((sum, entry) => sum + num(entry.state), 0);
                    return {
                        y: num(val),
                        x: items[0].last_changed
                    };
                }
                if (aggr == "avg") {
                    const val = items.reduce((sum, entry) => sum + num(entry.state), 0) / items.length;
                    return {
                        y: num(val),
                        x: items[0].last_changed
                    };
                }
                return items.map((items) => {
                    return {
                        y: num(items.state),
                        x: items.timestamp
                    };
                });
            });
        } catch (err) {
            console.error("Build Histroydata", err.message);
        }
    }

    /**
     * the default graph data
     */
    getDefaultGraphData() {
        return {
            data: {
                labels: [],
                datasets: []
            },
            config: {
                secondaryAxis: false,
                series: 1,
                gradient: false,
                options: {},
                statistics: {}
            }
        };
    }

    /** ----------------------------------------------------------
     *
     * chart data builder state (current) data
     *
     * ----------------------------------------------------------*/

    /**
     * Create dataseries for scatter chart
     * @param {*} _entities
     */
    createScatterChartData() {
        let _graphData = null;
        let _entities = this.entities;
        if (_entities && _entities.length % 2 === 0) {
            _graphData = this.getDefaultGraphData();
            _graphData.config.mode = "simple";
            for (let i = 0; i < _entities.length; i += 2) {
                // first entity holds the attributes
                const _attr = _entities[i];
                let _options = {
                    label: _attr.name || "",
                    unit: _attr.unit || "",
                    backgroundColor: _attr.backgroundColor || DEFAULT_COLORS[20 + i],
                    borderColor: _attr.borderColor || COLOR_BUBBLECHAT
                };
                if (this.entityOptions) {
                    _options = { ...this.entityOptions, ..._options };
                    _graphData.config.options = this.entityOptions;
                }
                if (this.entityOptions && this.entityOptions.gradient !== undefined) {
                    _graphData.config.gradient = true;
                }
                _options.data = [
                    {
                        x: _entities[i].state || 0.0,
                        y: _entities[i + 1].state || 0.0
                    }
                ];
                _graphData.data.datasets.push(_options);
            }
            _graphData.config.options.scatter = true;
        } else {
            console.error("ScatterChart setting not valid", this.entities);
        }
        return _graphData;
    }

    /**
     * create the series data for the bubble chart
     *
     * Important: the radius property, r is not scaled by the chart,
     * it is the raw radius in pixels of the bubble
     * that is drawn on the canvas.
     */
    createBubbleChartData() {
        let _graphData = null;
        let _entities = this.entities;
        if (_entities && _entities.length % 3 === 0) {
            _graphData = this.getDefaultGraphData();
            _graphData.config.mode = "simple";
            for (let i = 0; i < _entities.length; i += 3) {
                const _attr = _entities[i + 2];
                let _options = {
                    label: _attr.name || "",
                    scale: _attr.scale || 1.0,
                    unit: _attr.unit || "",
                    backgroundColor: _attr.backgroundColor || COLOR_BUBBLECHAT,
                    borderColor: _attr.borderColor || COLOR_BUBBLECHAT
                };
                if (this.entityOptions) {
                    _options = { ...this.entityOptions, ..._options };
                    _graphData.config.options = this.entityOptions;
                }
                if (this.entityOptions && this.entityOptions.gradient !== undefined) {
                    _graphData.config.gradient = true;
                }
                _options.data = [
                    {
                        x: _entities[i].state || 0.0,
                        y: _entities[i + 1].state || 0.0,
                        r: _entities[i + 2].state || 0.0
                    }
                ];
                _graphData.data.datasets.push(_options);
            }
            _graphData.config.options.bubble = true;
        } else {
            console.error("BubbleChart setting not valid", this.entities);
        }
        return _graphData;
    }

    /**
     * create chart data
     * this is used for pie-, doughnut-, polarArea-,radar-, simple bar chart
     * because we do not need time series - only the current state values.
     *
     * this.graphData.config holds the configruation data
     *
     */
    createChartData() {
        let _data = [];
        const emptyIndexes = this.entityData.reduce((arr, e, i) => (e == 0 && arr.push(i), arr), []);
        _data = this.entityData.filter((element, index, array) => !emptyIndexes.includes(index));
        if (_data.length === 0) {
            console.error("No Histroydata present !");
            return null;
        }

        let _defaultDatasetConfig = {
            unit: this.data_units || "",
            mode: "current"
        };

        let _graphData = this.getDefaultGraphData();
        _graphData.config.mode = "simple";

        // merge entity options
        if (this.entityOptions) {
            _defaultDatasetConfig = {
                ..._defaultDatasetConfig,
                ...this.entityOptions
            };
        }
        // merge dataset_config
        _graphData.data.labels = this.entityNames.filter((element, index, array) => !emptyIndexes.includes(index));
        _graphData.data.datasets[0] = _defaultDatasetConfig;

        // case horizontal bar
        if (this.card_config.chart.toLowerCase() === "horizontalbar") {
            _graphData.data.datasets[0].indexAxis = "y";
        }

        // custom colors from the entities
        let entityColors = this.entities
            .map((x) => {
                if (x.color !== undefined || x.backgroundColor !== undefined) return x.color || x.backgroundColor;
            })
            .filter((notUndefined) => notUndefined !== undefined);

        if (this.entityOptions && this.entityOptions.gradient != undefined) {
            _graphData.config.gradient = true;
        }

        if (entityColors.length === _graphData.data.labels.length) {
            // list entity colors "backgroundColor": []
            _graphData.data.datasets[0].backgroundColor = entityColors;
        } else {
            if (this.chart_type === "radar") {
                _graphData.data.datasets[0].backgroundColor = COLOR_RADARCHART;
                _graphData.data.datasets[0].borderColor = COLOR_RADARCHART;
                _graphData.data.datasets[0].borderWidth = 1;
                _graphData.data.datasets[0].pointBorderColor = COLOR_RADARCHART;
                _graphData.data.datasets[0].pointBackgroundColor = COLOR_RADARCHART;
                _graphData.config.gradient = false;
            } else {
                // geht backgroundcolor from DEFAULT_COLORS
                entityColors = DEFAULT_COLORS.slice(1, _data.length + 1);
                _graphData.data.datasets[0].backgroundColor = entityColors;
            }
        }

        // add the data series and return the new graph data
        _graphData.data.datasets[0].data = _data;
        return _graphData;
    }

    /**
     * get the graph data for the entities
     * all current states for the defined entities
     */
    getCurrentGraphData() {
        try {
            switch (this.chart_type.toLowerCase()) {
                case "bubble":
                    this.graphData = this.createBubbleChartData();
                    break;
                case "scatter":
                    this.graphData = this.createScatterChartData();
                    break;
                default:
                    this.graphData = this.createChartData();
                    break;
            }
            return this.graphData;
        } catch (err) {
            console.error("Current entities GraphData", err.message);
        }
        return null;
    }

    /**
     * get series data for bubble or scatter chart
     */
    getSeriesData() {
        let _seriesData = [];
        for (const list of this.stateHistories) {
            const items = this._getGroupHistoryData(list, this.data_dateGroup, this.data_aggregate);
            _seriesData.push(items);
        }
        return _seriesData;
    }

    /** ----------------------------------------------------------
     *
     * chart data builder history series data
     *
     * ----------------------------------------------------------*/

    /**
     * get the history bubble chart data
     */
    createHistoryBubbleData() {
        let _seriesData = this.getSeriesData();
        if (_seriesData && _seriesData.length % 3 === 0) {
            let _graphData = this.getDefaultGraphData();
            for (let r = 0; r < _seriesData.length; r += 3) {
                const _attr = this.entities[r + 2];
                let _data = [];
                _seriesData[r].forEach(function (e, i) {
                    if (_seriesData[r + 1][i] && _seriesData[r + 2][i]) {
                        _data.push({
                            x: parseFloat(_seriesData[r + 0][i].y) || 0.0,
                            y: parseFloat(_seriesData[r + 1][i].y || 0.0),
                            r: parseFloat(_seriesData[r + 2][i].y || 0.0)
                        });
                    }
                });
                let _options = {
                    label: _attr.name || "",
                    unit: _attr.unit || "",
                    scale: _attr.scale || 1,
                    backgroundColor: _attr.backgroundColor || COLOR_BUBBLECHAT,
                    borderColor: _attr.borderColor || COLOR_BUBBLECHAT
                    // TODO: min, max, avg values
                };
                if (this.entityOptions) {
                    // simple merge the default with the global options
                    _options = { ..._options, ...this.entityOptions };
                    _graphData.config.options = this.entityOptions;
                }
                _options.data = _data;
                _graphData.data.datasets.push(_options);
            }
            if (_graphData.data.datasets.length) {
                _graphData.config.options.bubble = true;
                return _graphData;
            }
        }
        console.error("BubbleChart setting not valid", this.entities);
        return null;
    }

    /**
     * get the history scatter chart data
     */
    createHistoryScatterData() {
        let _seriesData = this.getSeriesData();
        if (_seriesData && _seriesData.length % 2 === 0) {
            let _graphData = this.getDefaultGraphData();
            _graphData.config.mode = "history";
            for (let r = 0; r < _seriesData.length; r += 2) {
                // first entity hols the attributes
                const _attr = this.entities[r];
                let _data = [];
                _seriesData[r].forEach(function (e, i) {
                    if (_seriesData[r][i] && _seriesData[r + 1][i]) {
                        _data.push({
                            x: parseFloat(_seriesData[r + 0][i].y) || 0.0,
                            y: parseFloat(_seriesData[r + 1][i].y || 0.0)
                        });
                    }
                });
                let _options = {
                    label: _attr.name || "",
                    unit: _attr.unit || "",
                    backgroundColor: _attr.backgroundColor || DEFAULT_COLORS[10 + r],
                    borderColor: _attr.borderColor || DEFAULT_COLORS[10 + r]
                    // TODO: min, max, avg values ???
                };
                if (this.entityOptions) {
                    // simple merge the default with the global options
                    _options = { ..._options, ...this.entityOptions };
                    _graphData.config.options = this.entityOptions;
                }
                _options.data = _data;
                _graphData.data.datasets.push(_options);
            }
            if (_graphData.data.datasets.length) {
                _graphData.config.options.bubble = true;
                return _graphData;
            }
        }
        console.error("ScatterChart setting not valid", this.entities);
        return null;
    }

    /**
     * create the chart history data
     */
    createHistoryChartData() {
        let _graphData = this.getDefaultGraphData();
        _graphData.config.options.fill = false;
        _graphData.config.mode = "history";
        
        // all for other carts
        for (const list of this.stateHistories) {
            // interate throw all entities data
            const items = this._getGroupHistoryData(list, this.data_dateGroup, this.data_aggregate);

            const id = list[0].entity_id;

            // get all settings from the selected entity
            const _attr = this.entities.find((x) => x.entity === id);

            // build the dataseries and check ignore data with zero values
            let _items = this.data_ignoreZero ? items.map((d) => d.y).filter((x) => x != 0) : items.map((d) => d.y);

            // default Dataset Properties
            let _options = {
                label: _attr.name || "unkonwn",
                unit: _attr.unit || "",
                minval: Math.min(..._items),
                maxval: Math.max(..._items),
                sumval: 0.0,
                avgval: 0.0,
                current: _attr.state || 0.0,
                mode: "history"
            };

            if (this.card_config.chart.toLowerCase() === "horizontalbar") {
                _options.indexAxis = "y";
            }

            if (this.entityOptions) {
                // simple merge the default with the global options
                _options = { ..._options, ...this.entityOptions };
                _graphData.config.options = { ..._graphData.config.options, ...this.entityOptions };
            }

            // simple merge the entity options
            if (_attr) _options = { ..._options, ..._attr };
            
            if (_attr.fill !== undefined) {
                _graphData.config.options.fill = _attr.fill;
            }else{
                _attr.fill = ['bar','horizontalbar'].includes(this.card_config.chart.toLowerCase())
            }

            if (_attr.fill && _attr.gradient && _attr.gradient.colors) {
                const _axis = _options.indexAxis === "y"?"x":"y"
                _options.gradient = {
                    backgroundColor: {
                        axis: _axis,
                        colors: _attr.gradient.colors
                    }
                };
                _options.labelcolor = _attr.gradient.colors[0];
                _options.borderColor = _attr.gradient.colors[0] || DEFAULT_COLORS[_graphData.config.series];
                _graphData.config.gradient = true;
            } else {
                if (_attr.backgroundColor === undefined) {
                    _options.backgroundColor = DEFAULT_COLORS[_graphData.config.series];
                    _options.borderColor = DEFAULT_COLORS[_graphData.config.series];
                }
            }

            // check secondary axis
            if (!_graphData.config.secondaryAxis) {
                _graphData.config.secondaryAxis = _attr.yAxisID != undefined || _attr.xAxisID != undefined;
            }

            // assign the data for the current series
            _options.data = _items;

            // add the options, labels and data series
            _graphData.data.labels = items.map((l) => l.x);
            _graphData.config.labelType = this.data_dateGroup === "%Y-%M-%d %H:00:00" ? "timestamp" : "default";
            if (_graphData.config.labelType === "timestamp") {
                _graphData.data.labels = items.map((l) => timeStampLabel(l.x));
            }
            _graphData.data.datasets.push(_options);
            _graphData.config.series++;
        }
        return _graphData;
    }

    /**
     * build the graph cart data and datasets for the
     * defined graph chart. Uses the history data
     * for each entity
     *
     * @param {*} stateHistories
     * @param {*} update
     */
    getHistoryGraphData() {
        try {
            if (this.stateHistories && this.stateHistories.length) {
                switch (this.chart_type.toLowerCase()) {
                    case "bubble":
                        this.graphData = this.createHistoryBubbleData();
                        break;
                    case "scatter":
                        this.graphData = this.createHistoryScatterData();
                        break;
                    default:
                        this.graphData = this.createHistoryChartData();
                        break;
                }
                return this.graphData;
            }
        } catch (err) {
            console.error("Build History GraphData", err.message);
        }
        return null;
    }
}

/** ----------------------------------------------------------
 
	Lovelaces chartjs
  	(c) 2020 Peter Siebler
  	Released under the MIT license
 
 * ----------------------------------------------------------*/


/**
 * Lovelaces chartjs
 * graph chart wrapper class
 *
 */
class graphChart {
    /**
     * graph chart constructor
     * @param {*} config
     *
     * @example:
     *  called form setConfig(config)...
     *  let settings = {
     *		ctx: this.ctx,
     *		chart_locale: this.chart_locale,
     *		chart_type: this.chart_type,
     *		themeSettings: this.themeSettings,
     *		chartconfig: this.chartconfig,
     *	}
     *	// init the graph chart
     *	this.graphChart = new graphChart(settings);
     *
     */
    constructor(config) {
        this.chart = null; // current chart
        this.ctx = config.ctx || null; // the chart canvas element
        this.canvasId = config.canvasId;
        this.card_config = config.card_config;
        this.chart_locale = config.locale || "de-DE"; // the locale for number(s) and date(s)
        this.chart_type = config.chart_type || "bar"; // the chart type
        this.themeSettings = config.themeSettings || {}; // the theme settings (dark or light)
        this.chartconfig = config.chartconfig || {}; // the chart config from the template
        this.chartCurrentConfig = this.chartconfig; // current chart settings
        this.graphData = {}; // the graph data
        this.setting = config.setting;
        this.chart_ready = false; // boolean chart allready exits
        this.lastUpdate = null
    }

    /**
     * change the theme settings
     * @param {*} options
     */
    setThemeSettings(options) {
        this.themeSettings = options;
        return true;
    }
    /**
     * chartjs Callback for toolips
     * TODO:// not active !
     * @param {*} tooltipItem
     * @param {*} data
     */
    _chartTooltips(tooltipItem, data) {
        const dataset = data.datasets[tooltipItem.datasetIndex];
        let datasetLabel = "";
        let suffix = "";

        switch (this.chart_type.toLowerCase()) {
            case "pie":
            case "doughnut":
                const meta = dataset._meta[Object.keys(dataset._meta)[0]];
                const currentValue = dataset.data[tooltipItem.index];
                datasetLabel = data.labels[tooltipItem.index] || "";
                suffix = dataset.unit || "";
                if (meta.total) {
                    const percentage = parseFloat(((currentValue / meta.total) * 100).toFixed(1));
                    suffix += " (" + percentage + "%)";
                }
                return " " + datasetLabel + ": " + dataset.data[tooltipItem.index].toLocaleString() + " " + suffix;
            case "polararea":
            case "scatter":
            case "line":
            case "bar":
            case "radar":
            default:
                // for bar, line, radar ..
                datasetLabel = dataset.label ? dataset.label + ": " : "";
                datasetLabel += data.labels[tooltipItem.index] || "";
                suffix = dataset.unit || "";
                return " " + datasetLabel + ": " + dataset.data[tooltipItem.index].toLocaleString() + " " + suffix;
        }
    }

    /**
     * set the chart option based on the default
     * and the chart settings.
     * 
     * this.graphData.config holds the configruation data
     * from the data service
     * 
     * @called: from rendergraph and updategraph
     */
    _setChartOptions() {

        // global default settings
        Chart.defaults.responsive = true;
        Chart.defaults.maintainAspectRatio = false;
        Chart.defaults.animation = false;
        Chart.defaults.locale = this.chart_locale;

        Chart.defaults.defaultFontColor = this.themeSettings.fontColor;
        Chart.defaults.defaultFontFamily = this.themeSettings.fontFamily;

        Chart.defaults.scale.gridLines.lineWidth = this.themeSettings.gridLineWidth;
    
        // element settings
        if (Chart.defaults.elements && Chart.defaults.elements.arc) Chart.defaults.elements.arc.borderWidth = 0;

        if (Chart.defaults.elements && Chart.defaults.elements.line) {
            Chart.defaults.elements.line.fill = false;
            Chart.defaults.elements.line.tension = 0;
        }

        if (Chart.defaults.elements && Chart.defaults.elements.point) {
            Chart.defaults.elements.point.radius = 0;
            Chart.defaults.elements.point.borderWidth = 0;
            Chart.defaults.elements.point.hoverRadius = 8;
        }

        // chart default options
        let options = {
            type: this.chart_type,
            units: this.data_units || "",
            font: {
                size: 12,
                style: "normal",
                lineHeight: 1.2,
                lineWidth: 0
            },
            title: {
                display: this.chartconfig.title != "",
                text: "",
                font: {
                    style: "normal",
                    color: this.themeSettings.fontColor
                }
            },
            layout: {
                padding: {
                    left: 16,
                    right: 16,
                    top: 0,
                    bottom: 16
                }
            },
            chartArea: {
                backgroundColor: "transparent"
            },
            legend: {
                display: this.themeSettings.showLegend || false,
                position: "bottom",
                lineWidth: 0,
                labels: {
                    usePointStyle: true,
                    boxWidth: 8
                }
            },
            tooltips: {
                enabled: true,
                mode: "nearest",
                position: "nearest",
                backgroundColor: this.themeSettings.tooltipsBackground,
                titleFont: {
                    style: "normal",
                    color: this.themeSettings.tooltipsFontColor
                },
                bodyFont: {
                    style: "normal",
                    color: this.themeSettings.tooltipsFontColor
                },
                footerFont: {
                    style: "normal",
                    color: this.themeSettings.tooltipsFontColor
                },
                animation: false
            },
            hover: {
                mode: "nearest",
                intersect: true
            },
            elements: {
                point: {
                    radius: 0.33,
                    hitRadius: 8.0
                }
            },
            spanGaps: true,
            plugins: {}
        };
        
        if(this.graphData.config.gradient===true && this.graphData.config.mode ==='simple'){
            //enable gradient colors for state charts
            options.gradientcolor = {
                color: true,
                type: this.chart_type,
            }
            options.plugins = {
                gradient
            };
        }

        if (gradient && this.graphData.config.gradient) {
            // enable gradient colors for data series chart
            options.plugins = {
                gradient
            };
        }
        if (this.themeSettings.showGridLines) {
            Chart.defaults.set("scale", {
                gridLines: {
                    display: true,
                    color: this.themeSettings.gridlineColor,
                    drawBorder: true,
                    borderDash: this.themeSettings.borderDash,
                    zeroLineWidth: 8,
                }
            });
        }
        // ---------------------------------------------------
        // check secondary axis
        // this.graphData.config holds the configruation data
        // this.graphData.data.datasets data per series
        // ---------------------------------------------------
        if (
            this.graphData.config.secondaryAxis &&
            this.graphData &&
            this.graphData.data &&
            this.graphData.data.datasets
        ) {
            let _scaleOptions = {};
            this.graphData.data.datasets.forEach((dataset) => {
                if (dataset.yAxisID) {
                    _scaleOptions[dataset.yAxisID] = {};
                    _scaleOptions[dataset.yAxisID].id = dataset.yAxisID;
                    _scaleOptions[dataset.yAxisID].type = "linear";
                    _scaleOptions[dataset.yAxisID].position = dataset.yAxisID;
                    _scaleOptions[dataset.yAxisID].display = true;
                    if (dataset.yAxisID.toLowerCase() == "right") {
                        _scaleOptions[dataset.yAxisID].gridLines = {
                            borderDash: [2, 5],
                            drawOnChartArea: false
                        };
                    }
                }
                if (dataset.xAxisID) {
                    _scaleOptions[dataset.xAxisID] = {};
                    _scaleOptions[dataset.xAxisID].id = dataset.xAxisID;
                    _scaleOptions[dataset.xAxisID].type = "linear";
                    _scaleOptions[dataset.xAxisID].position = dataset.xAxisID;
                    _scaleOptions[dataset.xAxisID].display = true;
                    if (dataset.xAxisID.toLowerCase() == "top") {
                        _scaleOptions[dataset.xAxisID].gridLines = {
                            borderDash: [2, 5],
                            drawOnChartArea: false
                        };
                    }
                }
            });
            if (_scaleOptions) {
                options.scales = _scaleOptions;
            }
        }

        switch (this.chart_type.toLowerCase()) {
            case "radar":
                Chart.defaults.set("controllers.radar.scales.r", {
                    ticks: {
                        backdropColor: "transparent"
                    },
                    angleLines: {
                        display: true,
                        color: this.themeSettings.gridlineColor,
                        lineWidth: this.themeSettings.gridLineWidth
                    },
                    gridLines: {
                        circular: true
                    }
                });
                Chart.defaults.set("scale", {
                    gridLines: {
                        display: true,
                        lineWidth: this.themeSettings.gridLineWidth * 2,
                        borderDash: [0]
                    }
                });
                break;
            case "polararea":
                Chart.defaults.set("controllers.polarArea.scales.r", {
                    ticks: {
                        backdropColor: "transparent"
                    },
                    angleLines: {
                        display: true,
                        color: this.themeSettings.gridlineColor,
                        lineWidth: this.themeSettings.gridLineWidth * 2
                    },
                    gridLines: {
                        circular: true,
                        lineWidth: this.themeSettings.gridLineWidth * 1.6,
                        borderDash: [0]
                    }
                });
                Chart.defaults.set("scale", {
                    gridLines: {
                        display: true
                    }
                });
                break;
            case "bubble":
                let labelX = this.card_config.entities[0].name;
                labelX += this.card_config.entities[0].unit ? " (" + this.card_config.entities[0].unit + ")" : "";
                let labelY = this.card_config.entities[1].name;
                labelY += this.card_config.entities[1].unit ? " (" + this.card_config.entities[1].unit + ")" : "";
                options.scales = {
                    x: {
                        id: "x",
                        scaleLabel: {
                            display: true,
                            labelString: labelX
                        }
                    },
                    y: {
                        id: "y",
                        scaleLabel: {
                            display: true,
                            labelString: labelY
                        }
                    }
                };
                options.elements = {
                    point: {
                        radius: (context) => {
                            const value = context.dataset.data[context.dataIndex];
                            return value._r * 0.5;
                        }
                    }
                };
                break;
            case "scatter":
                Chart.defaults.elements.point.hoverRadius = 20;
                options.elements = {
                    point: {
                        radius: 15,
                        hitRadius: 20
                    }
                };
                break;
            case "line":
            case "bar":
            case "pie":
            case "doughnut":
            default:
                break;
        }

        this.chartCurrentConfig = {
            type: this.chart_type,
            data: {
                labels: [],
                datasets: []
            },
            options: {}
        };

        // merge default with chart config options
        if (this.chartconfig.options) {
            this.chartCurrentConfig.options = deepMerge(options, this.chartconfig.options);
        } else {
            this.chartCurrentConfig.options = options;
        }
    }

    /**
     * render the graph based on the settings and datasets.
     * @example:
     *    this.graphChart.graphData = this.graphData
     *    this.graphChart.renderGraph()
     */
    renderGraph(doUpdate) {
        try {
            if (this.graphData) {
                // set the chart options
                this._setChartOptions();

                // append the data for the current chart settings
                this.chartCurrentConfig.data = {
                    labels: this.graphData.data.labels,
                    datasets: this.graphData.data.datasets
                };

                // Chart declaration
                if (this.ctx && this.chartCurrentConfig.data && this.chartCurrentConfig.options) {
                    if (doUpdate) {
                        // redraw the chart with the current options
                        // and updated data series
                        this.chart.update({
                            duration: 0,
                            easing: "linear"
                        });
                    } else {
                        // create and draw the new chart with the current settings
                        // and the dataseries. Register all plugins
                        if (gradient && this.graphData.config.gradient) {
                            Chart.register(gradient);
                        }
                        if (
                            this.chartconfig &&
                            this.chartconfig.options &&
                            this.chartconfig.options.chartArea &&
                            this.chartconfig.options.chartArea.backgroundColor !== ""
                        ) {
                            Chart.register({
                                id: "chardbackground",
                                beforeDraw: function (chart) {
                                    if (
                                        chart.config.options.chartArea &&
                                        chart.config.options.chartArea.backgroundColor
                                    ) {
                                        const chartArea = chart.chartArea;
                                        const ctx = chart.ctx;
                                        ctx.save();
                                        ctx.fillStyle = chart.config.options.chartArea.backgroundColor;
                                        ctx.fillRect(
                                            chartArea.left,
                                            chartArea.top,
                                            chartArea.right - chartArea.left,
                                            chartArea.bottom - chartArea.top
                                        );
                                        ctx.restore();
                                    }
                                }
                            });
                        }
                        
                        if (this.chart) {
                            this.chart.destroy(); // sorry, but ...
                        }
                        this.chart = new Chart(this.ctx, this.chartCurrentConfig);
                        if (this.chart) {
                            this.chart_ready = true;
                        }
                    }
                }
            } else {
                console.log("Missing settings or data", this.chartCurrentConfig);
            }
        } catch (err) {
            console.error("Render Graph Error on ", this.chart_type, ": ", err, this.chartCurrentConfig);
        }
    }
}

/** --------------------------------------------------------------------

  Custom Chart Card
  based on https://github.com/sdelliot/pie-chart-card

  chartjs:    https://www.chartjs.org/
  gradient:   https://github.com/kurkle/chartjs-plugin-gradient#readme

/** -------------------------------------------------------------------*/

// Chart.js v3.0.0-beta.4 and used plugins, production use min.js
import "/hacsfiles/chart-card/chart.js?module";

// gradient
// const gradient = window["chartjs-plugin-gradient"];
const gradient = window["chartjs-gradient"];

console.info(
    "%c CHARTJS-CARD-DEV %c ".concat("1.0.1", " "),
    "color: white; background: #2980b9; font-weight: 700;",
    "color: white; background: #e74c3c; font-weight: 700;"
);

/**
 * lovelace card chart graph
 */
class ChartCard extends HTMLElement {
    static get properties() {
        return {
            _config: {},
            _hass: {}
        };
    }

    /**
     * Chartjs Card constructor
     */
    constructor() {
        // TODO: Why is this called 3-6 times on startup ?
        super();

        this._hass = null;
        this._config = null;

        this.attachShadow({
            mode: "open"
        });

        // card settings
        this.card_icon = null;
        this.card_title = null;
        this.card_height = 240;

        // all for chart
        this.theme = "";
        this.themeSettings = null;
        this.graphChart = null;
        this.chart_type = "bar";
        this.chart_locale = "de-DE";
        this.chart_update = false;
        this.ctx = null;
        this.chartconfig = null;
        this.graphData = {};

        // data providers
        this.hassEntities = [];
        this.entities = [];
        this.entityOptions = null;
        this.entity_ids = [];
        this.entityData = [];
        this.entityNames = [];

        // data service
        this.updateInterval = 60;
        this.data_hoursToShow = 0;
        this.data_group_by = "day";
        this.data_dateGroup = null;
        this.data_ignoreZero = false;
        this.data_units = "";
        this.startTime = new Date();
        this.lastEndTime = new Date();
        this.skipRender = false;
        this.lastUpdate = null;
        this.ready = false;
        this._initialized = false;
    }

    /**
     * get the date format patter for the
     * data series group
     * @param {*} key
     */
    _dateFormatPattern(key) {
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
     * evaluate the CSS variable
     * @param {*} variable
     */
    _evaluateCssVariable(v) {
        try {
            return getComputedStyle(document.documentElement).getPropertyValue(v).trim();
        } catch (err) {
            console.log("ERROR evaluateCssVariable:", v, "ERROR", err);
        }
        return v;
    }

    _setDefaultThemeSettings() {
        this.themeSettings = {
            theme: { theme: "system", dark: false },
            fontColor: "#333333",
            fontFamily: "Quicksand, Roboto,'Open Sans','Rubik','Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
            gridlineColor: "#DCDCDC",
            zeroLineColor: "#555555",
            tooltipsBackground: "#ecf0f1",
            tooltipsFontColor: "#647687",
            showLegend: ["pie", "doughnut", "polararea", "line"].includes(this.chart_type.toLowerCase()) || false,
            showGridLines: ["bar", "line", "bubble", "scatter"].includes(this.chart_type.toLowerCase()) || false,
            secondaryAxis: false,
            gridLineWidth: 0.18,
            borderDash: [2]
        };
    }
    /**
	 * THEME SETTINGS
	 * get the font and colorsettings from the hass view.
	 * optional the settings can be overwritten by the
	 * card definition "card_theme" and the theme css
		--chartjs-text-fontColor: '#2F3846'
  		--chartjs-fontFamily: "Quicksand, Roboto, 'Open Sans','Rubik',sans-serif"
  		--chartjs-gridline-color: '#EAEEF1'
  		--chartjs-zero-gridline-color: '#C9CBD0'
  		--chartjs-tooltip-background: '#EAEEF1'
        --chartjs-text-fontcolor: '#292F33'
	 */
    _getThemeSettings() {
        this._setDefaultThemeSettings();
        try {
            this.themeSettings = {
                fontColor:
                    this._evaluateCssVariable("--chartjs-text-fontColor") ||
                    this._evaluateCssVariable("--primary-text-color") ||
                    this.themeSettings.fontFamily,
                fontFamily:
                    this._evaluateCssVariable("--chartjs-fontFamily") ||
                    this._evaluateCssVariable("--paper-font-common-base_-_font-family") ||
                    "Quicksand, Roboto,'Open Sans','Rubik','Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
                gridlineColor:
                    this._evaluateCssVariable("--chartjs-gridline-color") ||
                    this._evaluateCssVariable("--light-primary-color") ||
                    this.themeSettings.gridlineColor,
                zeroLineColor:
                    this._evaluateCssVariable("--chartjs-zero-gridline-color") ||
                    this._evaluateCssVariable("--dark-primary-color") ||
                    this.themeSettings.zeroLineColor,
                tooltipsBackground:
                    this._evaluateCssVariable("--chartjs-tooltip-background") || this.themeSettings.tooltipsBackground,
                tooltipsFontColor:
                    this._evaluateCssVariable("--chartjs-text-fontcolor") || this.themeSettings.tooltipsFontColor,
                showLegend:
                    ["pie", "doughnut", "polararea", "line"].includes(this.chart_type.toLowerCase()) ||
                    this.themeSettings.showLegend,
                showGridLines:
                    ["bar", "line", "bubble", "scatter"].includes(this.chart_type.toLowerCase()) || this.showGridLines,
                secondaryAxis: false
            };
            if (this.theme && this.theme.dark != undefined) {
                this.themeSettings.theme = this.theme;
            }
            this.themeSettings.gridLineWidth = this.themeSettings.theme.dark ? 0.18 : 0.45;
            this.themeSettings.borderDash = this.themeSettings.theme.dark ? [2] : [0];
            if (this._config.options && this._config.options.scale && this._config.options.scale.gridLines)
                this.themeSettings.showGridLines = true;
            if (this._config.options && this._config.options.legend) this.themeSettings.showLegend = true;
            return true;
        } catch (err) {
            console.err("Fatal Error theme settings");
        }
        return false;
    }

    /**
     * set the chart config
     * if the options tag is present, this will
     * overwrite the default settings
     */
    _setChartConfig() {
        let config = {};
        // get the config
        config.type = this.chart_type;
        if (this._config.options) {
            config.options = {};
            config.options = this._config.options;
        }
        this.chartconfig = config;
        // get the theme settings (color, font...)
        this._getThemeSettings();
        // init the graph chart
        if (this.ctx) {
            let settings = {
                ctx: this.ctx,
                canvasId: this.canvasId,
                card_config: this._config,
                chart_locale: this.chart_locale,
                chart_type: this.chart_type,
                themeSettings: this.themeSettings,
                chartconfig: this.chartconfig,
                setting: this._config
            };
            this.graphChart = new graphChart(settings);
        } else {
            console.error("No chart.js container found !");
        }
    }

    /**
     * create the HA card
     * ha-icon and title and the canavas container
     * for the chartjs graph
     */
    _creatHACard() {
        // card and chart elements
        this.id = "i" + Math.random().toString(36).substr(2, 3).toLocaleLowerCase();
        const card = document.createElement("ha-card");
        const content = document.createElement("div");
        const canvas = document.createElement("canvas");
        this.ctx = canvas.getContext("2d");
        this.canvasId = this.id + "-chart";
        card.id = this.id + "-card";
        card.setAttribute("data-graphtype", this.chart_type);

        // create the header and icon (optional)
        if (this.card_title || this.card_icon) {
            const cardHeader = document.createElement("div");
            cardHeader.setAttribute("class", "card-header header flex");
            cardHeader.id = this.id + "-header";
            cardHeader.style.cssText = "padding-bottom:0 !important;white-space:nowrap";
            if (this.card_icon) {
                const iconel = document.createElement("ha-icon");
                iconel.setAttribute("icon", this.card_icon);
                iconel.style.cssText = "position:relative;top:-2px;padding:0 6px 0 4px;";
                cardHeader.appendChild(iconel);
            }
            if (this.card_title) {
                const cardTitle = document.createElement("span");
                cardTitle.style.cssText = "overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-block;vertical-align:top;width:70%";
                cardTitle.innerHTML = this.card_title;
                cardHeader.appendChild(cardTitle);
            }
            card.append(cardHeader);
        }

        // card content
        content.id = this.id + "-view";
        content.style.height = this.card_height + "px";
        content.style.width = "100%";

        // the canvas element for chartjs (required)
        canvas.id = this.canvasId;
        canvas.height = this.card_height;
        canvas.style.cssText = "-moz-user-select: none; -webkit-user-select: none; -ms-user-select: none;";

        // create the show state layer
        if (this.chart_showstate) {
            this.currentData = document.createElement("div");
            this.currentData.style.cssText =
                "position:absolute;top:12px;right:24px;background-color:transparent;z-index:100";
        }

        // apply the content and the card
        card.appendChild(content);
        if (this.chart_showstate && this.currentData) card.appendChild(this.currentData);
        content.appendChild(canvas);
        this.root.appendChild(card);
    }

    /**
     * Home Assistant will call setConfig(config) when the configuration changes (rare).
     * If you throw an exception if the configuration is invalid,
     * Lovelace will render an error card to notify the user.
     */
    setConfig(config) {
        if (!config.entities) {
            throw new Error("You need to define an entity");
        }

        try {
            this.root = this.shadowRoot;
            while (this.root.hasChildNodes()) {
                this.root.removeChild(root.lastChild);
            }

            if (this._config) {
                console.log("CHART-CART Config", config.title, " allready loaded");
                return;
            }

            // get the config from the lovelace
            this._config = config;

            // ha-card settings
            this.card_title = this._config.title || "";
            this.card_icon = this._config.icon || null;
            this.card_height = this._config.height || 240;

            // all settings for the chart
            this.chart_type = this._config.chart || "bar";
            this.chart_showstate = this._config.showstate || false;

            const availableTypes = [
                "line",
                "radar",
                "bar",
                "horizontalBar",
                "pie",
                "doughnut",
                "polarArea",
                "bubble",
                "scatter"
            ];
            if (!this.chart_type) {
                throw new Error("You need to define type of chart");
            } else if (!availableTypes.includes(this.chart_type)) {
                throw new Error(
                    "Invalid config for 'chart:'" +
                        this.chart_type +
                        ". Available options are: " +
                        availableTypes.join(", ")
                );
            }
            if (this.chart_type.toLowerCase() === "horizontalbar") {
                this.chart_type = "bar";
            }
            this.chart_locale = this._config.locale || "de-DE";

            // setting for data handling
            this.updateInterval = this._config.update || 60;
            this.data_hoursToShow = this._config.hours_to_show || 0;
            this.data_group_by = this._config.group_by || "day";
            this.data_dateGroup = this._dateFormatPattern(this.data_group_by);
            this.data_aggregate = this._config.aggregate || "last";
            this.data_ignoreZero = this._config.ignoreZero || false;

            this.data_units = this._config.units || "";
            
            // check if we can use showstate
            if (["bubble", "scatter"].includes(this.chart_type.toLocaleLowerCase())) {
                this.chart_showstate = false;
            } else {
                if (this.data_hoursToShow === 0 && this.chart_showstate) {
                    this.chart_showstate = false;
                }
            }

            // create the card and apply the chartjs config
            this._creatHACard();
            this._initialized = true;
        } catch (err) {
            console.log(err.message, config);
        }
    }

    /**
     * HASS settings
     *
     */
    set hass(hass) {
        if (hass === undefined) return;
        if (!this._initialized) return;

        if (this.theme && this.theme.dark !== hass.selectedTheme.dark) {
            // theme has changed
            this.theme = hass.selectedTheme;
            this._getThemeSettings();
            if (this.graphChart) {
                this.themeSettings.theme = this.theme;
                this.graphChart.setThemeSettings(this.themeSettings);
                this.graphChart.renderGraph(false);
            }
        }

        this._hass = hass;
        this.theme = hass.selectedTheme;

        // TODO : find a better methode ??
        if (this.updateInterval) {
            let endTime = new Date();
            let elapsed = (endTime.getTime() - this.startTime.getTime()) / 1000;
            if (elapsed >= this.updateInterval) {
                // refresh and update the graph
                this._getThemeSettings();
                this.graphChart.setThemeSettings(this.themeSettings);
                this._getHistory();
                this.startTime = new Date();
                if (this.skipRender) return;
            }
        }

        if (!this.graphChart) {
            // create the graph chart
            this._getThemeSettings();
            this.themeSettings.theme = this.theme;
            this._setChartConfig();
        }

        // check if the Entities has changed
        if (this.skipRender && this.hassEntities && this.hassEntities.length) {
            let changed = false;
            this.hassEntities.forEach((entity) => {
                changed = changed || Boolean(this.hass && hass.states[entity] !== this._hass.states[entity]);
            });
            if (changed) {
                console.log("NEW DATA !!!!");
                this.skipRender = false;
            }
        }

        if (this.skipRender) return;

        // An object list containing the states of all entities in Home Assistant.
        // The key is the entity_id, the value is the state object.
        this.hassEntities = this._config.entities
            .map((x) => hass.states[x.entity])
            .filter((notUndefined) => notUndefined !== undefined);

        // check if we have valid entities and skip if we can'nt find the
        // entities in the hass entities list.
        if (!this.hassEntities || this.hassEntities.length === 0) return;

        // all entity data
        this.entityData = this.hassEntities.map((x) => (x === undefined ? 0 : x.state));
        this.entityOptions = null;

        if (this.ready === false && this.entities.length !== this.hassEntities.length) {
            this.entities = [];
            // interate throw all _config.entities
            for (let entity of this._config.entities) {
                if (entity.options) {
                    // all global entity options
                    this.entityOptions = entity.options;
                } else {
                    // hass entity
                    const h = this.hassEntities.find((x) => x.entity_id === entity.entity);
                    if (h) {
                        let item = Object.assign({}, entity);
                        if (item.name == undefined && h.attributes) {
                            item.name = h.attributes.friendly_name || item.name;
                            item.unit = h.attributes.unit_of_measurement || item.unit || "";
                        }
                        if (item.name !== undefined) {
                            item.last_changed = h.last_changed || this.startTime;
                            item.state = h.state || 0.0;
                            this.entities.push(item);
                            this.entity_ids.push(entity.entity);
                        }
                    }
                }
            }
            this.ready = (this.entity_ids && this.entity_ids.length) !== 0;
        }

        // all entity names this.entities
        this.entityNames = this.entities.map((x) =>
            x.name !== undefined
                ? x.name
                : hass.states[x.entity]["attributes"]["friendly_name"] !== undefined
                ? hass.states[x.entity]["attributes"]["friendly_name"]
                : x.entity
        );

        if (this.skipRender == false && this._initialized) {
            // get the histroy data and render the graph
            this.themeSettings.theme = this.theme;
            this._getHistory();
            this.skipRender = true;
        }
    }

    // connectedCallback() {
    // 	console.log("connectedCallback");
    // }

    /**
     * Get all histroy data for all registrated entity ids
     * or get the entity data if no time slot (hoursToShow) is defined.
     * Call an API on the Home Assistant server.
     */
    _getHistory() {
        if (this.ready) {
            if (this.data_hoursToShow && this.data_hoursToShow > 0 && this.entity_ids.length) {
                // get all data for the selected timeslot and entities...
                let startTime;
                if (this.chart_update) {
                    startTime = this.lastEndTime;
                } else {
                    startTime = new Date();
                    startTime.setHours(startTime.getHours() - this.data_hoursToShow);
                }
                let endTime = new Date();
                this.lastEndTime = endTime;
                const filter =
                    startTime.toISOString() +
                    "?end_time=" +
                    endTime.toISOString() +
                    "&filter_entity_id=" +
                    this.entity_ids.join(",");
                // get all Data for the sensors
                this.lastUpdate = new Date().toISOString();
                let url = "history/period/" + filter + "&minimal_response";
                const prom = this._hass.callApi("GET", url).then(
                    (stateHistory) => this._buildGraphData(stateHistory, 1),
                    () => null
                );
            } else {
                this.lastUpdate = new Date().toISOString();
                this._buildGraphData(null, 2);
            }
        }
    }

    /**
     * render the state data layer
     * @param {*} data
     */
    renderStateData(data) {
        if (this.currentData && this.chart_showstate && data) {
            let _visible = "margin:0;line-height:1.2em";
            let _html = [];
            _html.push('<div style="font-weight:400;margin:0;cursor:pointer;">');
            for (const item of data) {
                let _style = ' style="' + _visible + ";color:" + item.color + '"';
                _html.push('<div id="' + item.name + '"' + _style + '">');
                _html.push(
                    '<p style="font-size:2.0em;line-height:1.2em;text-align:right;margin:0;border-bottom: 1px dotted ' +
                        item.color +
                        ';">' +
                        item.current +
                        '<span style="font-size:0.5em;vertical-align:top">' +
                        item.unit +
                        "</span></p>"
                );
                _html.push(
                    '<p style="font-size:0.85em;text-align:center;margin:0;line-height:2em">' + item.name + "</p>"
                );
                _html.push("</div>");
                _visible = "margin:0;display:none;line-height:1.2em";
            }
            _html.push("</div>");
            this.currentData.innerHTML = _html.join("");
        }
    }

    /**
     * build the graph cart data and datasets for the
     * defined graph chart. Uses the history data and the
     * entity data.
     *
     * @param {*} stateHistories
     */
    _buildGraphData(stateHistories, mode) {
        if ((mode === 1 && !stateHistories) || (stateHistories && !stateHistories.length)) {
            return null;
        }
        // start get chart data
        const _chartData = new chartData({
            chart_type: this.chart_type,
            card_config: this._config,
            entities: this.entities,
            entityOptions: this.entityOptions,
            entityData: this.entityData,
            entityNames: this.entityNames,
            stateHistories: stateHistories,
            data_dateGroup: this.data_dateGroup,
            data_aggregate: this.data_aggregate,
            setting: this._config,
            lastUpdate: this.lastUpdate
        });

        // get the chart data
        if (mode === 1) {
            this.graphData = _chartData.getHistoryGraphData();
        } else {
            this.graphData = _chartData.getCurrentGraphData();
        }

        if (this.graphData === null) {
            console.error("No GraphData found for ", this.entityNames);
            return;
        } else {
            if (this.graphData && this.graphData.config) {
                this.themeSettings.secondaryAxis = this.graphData.config.secondaryAxis || false;
            }
        }

        // TODO : HANDLING !!!
        if (this.chart_update) {
            if (this.graphChart && this.graphData) {
                this.graphChart.graphData = this.graphData;
                this.graphChart.renderGraph(true);
            }
        } else {
            if (this.graphChart && this.graphData) {
                this.graphChart.graphData = this.graphData;
                this.graphChart.renderGraph(false);
            }
        }
        if (mode === 1 && this.chart_showstate) {
            let _data = this.graphData.data.datasets.map(function (item) {
                return {
                    name: item.label || "",
                    min: item.minval,
                    max: item.maxval,
                    avg: null,
                    sum: null,
                    current: item.current,
                    unit: item.unit || "",
                    color: item.labelcolor || item.backgroundColor,
                    timestamp: item.last_changed || ""
                };
            });
            if (_data) this.renderStateData(_data);
        }
    }

    /**
     * The height of the card. Home Assistant uses this to automatically
     * distribute all cards over the available columns.
     */
    getCardSize() {
        return 4;
    }
}

customElements.define("chart-card", ChartCard);
