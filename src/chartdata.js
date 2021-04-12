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
        this.card_config = config.card_config
        this.entity_options = config.entityOptions
        this.entity_items = config.entity_items
        this.DEBUGMODE = config.debugmode
        this.data_pointStyles = CT_DATAPOINTSTYLE
        this.indicators = {
            up: "▲",
            down: "▼",
            equal: "≃"
        }
        this.graphData = {}
        this.version = "1.0.1"
    }

    /**
     * the default graph data
     */
    getDefaultGraphData() {
        return {
            data: {
                datasets: []
            },
            config: {
                mode: "init",
                secondaryAxis: false,
                series: 0,
                gradient: false,
                options: {},
                segmentbar: false,
                timescale: false
            }
        }
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
        if (!this.entity_items.isValid()) return null
        let _graphData = null

        let numEntyties = this.entity_items.getSize()
        let _entities = this.entity_items.getEntitieslist()

        if (numEntyties % 2 === 0) {
            _graphData = this.getDefaultGraphData()
            _graphData.config.mode = "simple"
            for (let i = 0; i < numEntyties; i += 2) {
                /**
                 * first entity holds the attributes
                 */
                const _attr = this.entity_items.getOptions(i)
                let _options = {
                    label: _entities[i].name || "",
                    unit: _entities[i].unit || "",
                    hoverRadius: 20,
                    radius: 15,
                    pointRadius: 15,
                    hitRadius: 20,
                    backgroundColor: _attr.backgroundColor || DEFAULT_COLORS[20 + i * 5],
                    borderColor: _attr.borderColor || DEFAULT_COLORS[20 + i * 5]
                }
                if (this.entity_options) {
                    _options = { ...this.entity_options, ..._options }
                    _graphData.config.options = this.entity_options
                }
                if (this.entity_options && this.entity_options.gradient !== undefined) {
                    _graphData.config.gradient = true
                }
                _options.data = [
                    {
                        x: _entities[i].state || 0.0,
                        y: _entities[i + 1].state || 0.0
                    }
                ]
                if (_attr) _options = { ..._options, ..._attr }
                _graphData.data.datasets.push(_options)
            }
            _graphData.config.options.scatter = true
        } else {
            console.error("ScatterChart setting not valid ", _entities)
        }
        return _graphData
    }

    /**
     * create the series data for the bubble chart
     *
     * Important: the radius property, r is not scaled by the chart,
     * it is the raw radius in pixels of the bubble
     * that is drawn on the canvas.
     */
    createBubbleChartData() {
        if (!this.entity_items.isValid()) return null
        let _graphData = null

        let numEntyties = this.entity_items.getSize()
        let _entities = this.entity_items.getEntitieslist()

        if (numEntyties % 3 === 0) {
            _graphData = this.getDefaultGraphData()
            _graphData.config.mode = "simple"
            for (let i = 0; i < _entities.length; i += 3) {
                const _attr = this.entity_items.getOptions(i + 1)
                let _options = {
                    label: _entities[i + 2].name || "",
                    scale: _attr.scale || 1.0,
                    unit: _entities[i + 2].unit || "",
                    backgroundColor: _attr.backgroundColor || DEFAULT_COLORS[24 + i * 5],
                    borderColor: _attr.borderColor || DEFAULT_COLORS[24 + i * 5]
                }
                if (this.entity_options) {
                    _options = { ...this.entity_options, ..._options }
                    _graphData.config.options = this.entity_options
                }
                if (this.entity_options && this.entity_options.gradient !== undefined) {
                    _graphData.config.gradient = true
                }
                if (_attr && _attr.pointStyle) {
                    _options.pointStyle = _attr.pointStyle
                    _options.pointRadius = 6
                }
                if (_attr && _attr.pointRadius) {
                    _options.pointRadius = _attr.pointRadius
                }
                _options.data = [
                    {
                        x: _entities[i].state || 0.0,
                        y: _entities[i + 1].state || 0.0,
                        r: _entities[i + 2].state || 0.0
                    }
                ]
                if (_attr) _options = { ..._options, ..._attr }
                _graphData.data.datasets.push(_options)
            }
            _graphData.config.options.bubble = true
        } else {
            console.error("BubbleChart setting not valid", _entities)
        }
        return _graphData
    }

    /** ----------------------------------------------------------
     *
     * chart data builder state series data
     *
     * ----------------------------------------------------------*/

    /**
     * create the segment data for the bars
     * @param {*} dataset
     */
    createSimpleBarSegmentedData(dataset) {
        if (dataset.data && dataset.data.length) {
            dataset.data = dataset.data.map((i) => Number(i))
            const _max = Math.max(...dataset.data)
            const _min = Math.min(...dataset.data)
            const _helpers = Chart.helpers
            return {
                data: dataset.data.map((i) => _max - i),
                backgroundColors: dataset.backgroundColor.map((color) => _helpers.color(color).alpha(0.25).rgbString())
            }
        }
        return null
    }

    /**
     * create chart data - entity state based
     * this is used for pie-, doughnut-, polarArea-,radar-, simple bar chart
     * because we do not need time series - only the current state values.
     */
    createChartData() {
        /**
         * entities      : all entities data and options
         * entityOptions : global entities options
         */
        if (!this.entity_items.isValid()) return null
        const _data = this.entity_items.getData()

        if (_data.length === 0) {
            console.error("Create Chart Data, no Data present !")
            return null
        }

        let _defaultDatasetConfig = {
            mode: "current",
            unit: ""
        }

        let _graphData = this.getDefaultGraphData()
        _graphData.config.mode = "simple"

        /**
         * merge entity options
         */
        if (this.entity_options) {
            _defaultDatasetConfig = {
                ..._defaultDatasetConfig,
                ...this.entity_options
            }
        }

        /**
         * merge dataset_config
         * all entity labels
         * add dataset entities
         */
        _graphData.data.labels = this.entity_items.getNames()
        _graphData.data.datasets[0] = _defaultDatasetConfig
        _graphData.data.datasets[0].label = this.card_config.title || ""
        /**
         * add the unit
         */
        if (this.entity_options && this.entity_options.unit) {
            _graphData.data.datasets[0].unit = this.entity_options.unit || ""
        } else {
            _graphData.data.datasets[0].units = this.entity_items.getEntitieslist().map((item) => item.unit)
        }

        /**
         * case horizontal bar
         */

        if (this.card_config.chart.isChartType("horizontalbar")) {
            _graphData.data.datasets[0].indexAxis = "y"
        }

        /**
         * custom colors from the entities
         */
        let entityColors = this.entity_items.getColors()

        if (this.entity_options && this.entity_options.gradient != undefined) {
            _graphData.config.gradient = true
        }

        if (entityColors.length === _graphData.data.labels.length) {
            _graphData.data.datasets[0].backgroundColor = entityColors
            _graphData.data.datasets[0].showLine = false
        } else {
            if (this.card_config.chart.isChartType("radar")) {
                _graphData.data.datasets[0].backgroundColor = COLOR_RADARCHART
                _graphData.data.datasets[0].borderColor = COLOR_RADARCHART
                _graphData.data.datasets[0].borderWidth = 1
                _graphData.data.datasets[0].pointBorderColor = COLOR_RADARCHART
                _graphData.data.datasets[0].pointBackgroundColor = COLOR_RADARCHART
                _graphData.data.datasets[0].tooltip = true
                _graphData.config.gradient = false
            } else {
                /**
                 * get backgroundcolor from DEFAULT_COLORS
                 */
                entityColors = DEFAULT_COLORS.slice(1, _data.length + 1)
                _graphData.data.datasets[0].backgroundColor = entityColors
                _graphData.data.datasets[0].borderWidth = 0
                _graphData.data.datasets[0].showLine = false
            }
        }
        _graphData.data.datasets[0].data = _data
        _graphData.config.segmentbar = false

        /**
         * add the data series and return the new graph data
         */
        if (this.card_config.chart.isChartType("bar") && this.card_config.chartOptions && this.card_config.chartOptions.segmented) {
            const newData = this.createSimpleBarSegmentedData(_graphData.data.datasets[0])
            if (newData) {
                _graphData.data.datasets[1] = {}
                _graphData.data.datasets[1].data = newData.data
                _graphData.data.datasets[1].tooltip = false
                _graphData.data.datasets[1].backgroundColor = newData.backgroundColors
                _graphData.data.datasets[1].borderWidth = 0
                _graphData.data.datasets[1].showLine = false
                _graphData.config.segmentbar = newData.data.length !== 0
            }
        }
        return _graphData
    }

    /**
     * get the graph data for the entities
     * all current states for the defined entities
     */
    getCurrentGraphData() {
        try {
            switch (this.card_config.chart) {
                case "bubble":
                    this.graphData = this.createBubbleChartData()
                    break
                case "scatter":
                    this.graphData = this.createScatterChartData()
                    break
                default:
                    this.graphData = this.createChartData()
                    break
            }
            return this.graphData
        } catch (err) {
            console.error("Current entities GraphData", err.message, err)
        }
        return null
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
        if (!this.entity_items.isValid()) return null

        let _seriesData = this.entity_items.getSeriesData()

        if (_seriesData && _seriesData.length % 3 === 0) {
            let _graphData = this.getDefaultGraphData()
            for (let r = 0; r < _seriesData.length; r += 3) {
                const _attr = this.entity_items.getOptions(r + 2) || {}
                let _data = []
                _seriesData[r].data.forEach(function (e, i) {
                    if (_seriesData[r + 1].data[i] && _seriesData[r + 2].data[i]) {
                        _data.push({
                            x: parseFloat(_seriesData[r + 0].data[i].y) || 0.0,
                            y: parseFloat(_seriesData[r + 1].data[i].y || 0.0),
                            r: parseFloat(_seriesData[r + 2].data[i].y || 0.0)
                        })
                    }
                })
                let _options = {
                    label: this.entity_items.getEntity(r + 2).name || "",
                    unit: this.entity_items.getEntity(r + 2).unit || "",
                    scale: this.entity_items.getEntity(r + 2).scale || 1,
                    backgroundColor: _attr.backgroundColor || DEFAULT_COLORS[17 + r * 5],
                    borderColor: _attr.borderColor || DEFAULT_COLORS[17 + r * 5]
                    // TODO: min, max, avg values
                }
                if (_attr && _attr.pointStyle) {
                    _options.pointStyle = _attr.pointStyle
                    _options.pointRadius = 6
                }
                if (_attr && _attr.pointRadius) {
                    _options.pointRadius = _attr.pointRadius
                }
                if (this.entity_options) {
                    _options = { ..._options, ...this.entity_options }
                    _graphData.config.options = this.entity_options
                }
                if (_attr) _options = { ..._options, ..._attr }
                _options.data = _data
                _graphData.data.datasets.push(_options)
            }
            if (_graphData.data.datasets.length) {
                _graphData.config.options.bubble = true
                return _graphData
            }
        }
        console.error("BubbleChart setting not valid for ", this.entity_items.getNames())
        return null
    }

    /**
     * get the history scatter chart data
     */
    createHistoryScatterData() {
        if (!this.entity_items.isValid()) return null

        let _seriesData = this.entity_items.getSeriesData()

        if (_seriesData && _seriesData.length % 2 === 0) {
            let _graphData = this.getDefaultGraphData()
            _graphData.config.mode = "history"

            for (let r = 0; r < _seriesData.length; r += 2) {
                const _attr = this.entity_items.getOptions(r) || {}
                let _data = []
                _seriesData[r].data.forEach(function (e, i) {
                    if (_seriesData[r].data[i] && _seriesData[r + 1].data[i]) {
                        _data.push({
                            x: parseFloat(_seriesData[r + 0].data[i].y) || 0.0,
                            y: parseFloat(_seriesData[r + 1].data[i].y || 0.0)
                        })
                    }
                })
                /**
                 * default options
                 */
                let _options = {
                    label: this.entity_items.getEntity(r).name || "",
                    unit: this.entity_items.getEntity(r).unit || "",
                    hoverRadius: 18,
                    pointRadius: 16,
                    hitRadius: 22,
                    backgroundColor: _attr.backgroundColor || DEFAULT_COLORS[27 + r * 5],
                    borderColor: _attr.borderColor || DEFAULT_COLORS[27 + r * 5]
                    // TODO: min, max, avg values ???
                }
                if (this.entity_options) {
                    _options = { ..._options, ...this.entity_options }
                    _graphData.config.options = this.entity_options
                }
                if (_attr) _options = { ..._options, ..._attr }

                _options.data = _data
                _graphData.data.datasets.push(_options)
            }
            if (_graphData.data.datasets.length) {
                _graphData.config.options.bubble = true
                return _graphData
            }
        }
        console.error("ScatterChart setting not valid for ", this.entity_items.getNames())
        return null
    }

    /**
     * ----------------------------------------------------------------------
     * create chart data - history state based
     * ----------------------------------------------------------------------
     * Get the series data for all entities from the
     * history and create the chart history data
     */
    createHistoryChartData() {
        let _graphData = this.getDefaultGraphData()

        _graphData.config.options.fill = false
        _graphData.config.mode = "history"

        const entities = this.entity_items.getEntityIds()
        entities.forEach((id) => {
            /**
             * current selected entity
             */
            const _entity = this.entity_items.items[id]
            let _entityOptions = { ...this.entity_items.getOptions(_entity.entity) }

            /**
             * default Dataset Properties
             */
            let _options = {
                label: _entity.name || "unkonwn",
                unit: _entity.unit || "",
                pointRadius: 0,
                current: _entity.state || 0.0,
                last_changed: _entity.last_changed || new Date(),
                mode: "history"
            }
            if (this.card_config.chart.isChartType("horizontalbar")) {
                _options.indexAxis = "y"
            }

            if (this.card_config.chart.isChartType("radar")) {
                _options.pointRadius = 12
                _options.hoverRadius = 18
                _options.hitRadius = 22
            }

            if (this.entity_options) {
                _options = { ..._options, ...this.entity_options }
                _graphData.config.options = { ..._graphData.config.options, ...this.entity_options }
            }

            /**
             * add all options from style settings
             */
            _options = { ..._options, ..._entityOptions }
            _graphData.config.options.fill = _entityOptions.fill || CT_BARCHARTS.includes(this.card_config.chart)

            if (_entityOptions.fill && _entityOptions.gradient && _entityOptions.gradient.colors) {
                const _axis = _options.indexAxis === "y" ? "x" : "y"
                _options.gradient = {
                    backgroundColor: {
                        axis: _axis,
                        colors: _entityOptions.gradient.colors
                    }
                }
                _options.labelcolor = _entityOptions.gradient.colors[0]
                _options.borderColor = _entityOptions.gradient.colors[0] || DEFAULT_COLORS[_graphData.config.series]
                _graphData.config.gradient = true
            } else {
                if (_entityOptions.backgroundColor === undefined) {
                    _options.backgroundColor = DEFAULT_COLORS[_graphData.config.series]
                    _options.borderColor = DEFAULT_COLORS[_graphData.config.series]
                }
            }

            /**
             * check secondary axis
             */
            if (!_graphData.config.secondaryAxis) {
                _graphData.config.secondaryAxis = _entityOptions.yAxisID != undefined || _entityOptions.xAxisID != undefined
            }

            /**
             * add the options, labels and data series
             */
            if (_graphData.config.options.mode.timeaxis == false) {
                /**
                 * category based datasets
                 */
                const _seriesdata = this.entity_items.getDataset(id)
                _graphData.config.multiseries = false
                if (_seriesdata && _seriesdata.data) {
                    _graphData.data.labels = _seriesdata.labels
                    if (this.card_config.chart.isChartType("pie") || this.card_config.chart.isChartType("doughnut")) {
                        _graphData.data.labels = this.entity_items.getNames()
                        _graphData.config.multiseries = true
                    }
                    _options.data = _seriesdata.data
                    _graphData.config.useTimeSeries = _graphData.config.options.mode.timescale
                }
            } else {
                /**
                 *  time axis based datasets
                 */
                if (_entity.seriesdata && _entity.seriesdata.data) {
                    _options.data = _entity.seriesdata.data
                    _graphData.config.datascales = _entity.datascales
                    _graphData.config.timescale = _graphData.config.options.mode.timescale
                }
            }

            _graphData.data.datasets.push(_options)
            _graphData.config.series++
        })
        return _graphData
    }

    /**
     * build the graph cart data and datasets for the
     * defined graph chart. Uses the history data for each entity
     */
    getHistoryGraphData() {
        try {
            switch (this.card_config.chart) {
                case "bubble":
                    this.entity_options.mode = CT_DATASCALEMODES[this.card_config.chart]
                    this.graphData = this.createHistoryBubbleData()
                    break
                case "scatter":
                    this.entity_options.mode = CT_DATASCALEMODES[this.card_config.chart]
                    this.graphData = this.createHistoryScatterData()
                    break
                case "bar":
                case "horizontalbar_":
                    if (this.entity_options && this.entity_options.mode && this.entity_options.mode.history) {
                        this.graphData = this.createHistoryChartData()
                    } else {
                        this.graphData = this.createChartData()
                    }
                    break
                case "pie":
                    if (this.entity_options && this.entity_options.mode && this.entity_options.mode.history) {
                        this.graphData = this.createHistoryChartData()
                    } else {
                        this.entity_options.mode = CT_DATASCALEMODES[this.card_config.chart]
                        this.graphData = this.createChartData()
                    }
                    break
                case "doughnut":
                    this.entity_options.mode = CT_DATASCALEMODES[this.card_config.chart]
                    this.graphData = this.createChartData()
                    break
                default:
                    this.graphData = this.createHistoryChartData()
                    break
            }
            if (this.graphData) {
                return this.graphData
            } else {
                console.error("Error getHistoryGraphData, no data present!")
            }
        } catch (err) {
            console.error("Build History GraphData", err.message, err)
        }
        return null
    }
}
