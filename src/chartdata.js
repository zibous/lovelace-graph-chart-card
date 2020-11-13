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
