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
        this.chart_type = config.chart_type
        this.card_config = config.card_config
        this.entities = config.entities
        this.entityOptions = config.entityOptions
        this.entityData = config.entityData
        this.entityNames = config.entityNames
        this.stateHistories = config.stateHistories
        this.data_group_by = config.data_group_by || "day"
        this.data_aggregate = config.data_aggregate || "last"
        this.settings = config.settings
        this.chart_locale = config.chart_locale
        this.data_pointStyles = [
            "circle",
            "triangle",
            "rectRounded",
            "rect",
            "rectRot",
            "cross",
            "star",
            "line",
            "dash"
        ]
        this.indicators = {
            up: "▲",
            down: "▼",
            equal: "≃"
        }
        this.graphData = {}
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
    _getGroupHistoryData(array) {
        try {
            if (!array) return
            if (array && !array.length) return

            let groups = {}
            const _num = (n) => (n === parseInt(n) ? Number(parseInt(n)) : Number(parseFloat(n).toFixed(2)))

            const _itemvalue = (item) => {
                if (item.field) return _num(item[item.field] || 0.0)
                return _num(item.state || 0.0)
            }

            const _fmd = (d) => {
                const t = new Date(d)
                if (isNaN(t)) return d
                if (this.data_group_by === "weekday") {
                    return {
                        name: date.toLocaleDateString(this.chart_locale, { weekday: "short" }),
                        label: date.toLocaleDateString(this.chart_locale, { weekday: "long" })
                    }
                }
                const day = ("0" + t.getDate()).slice(-2)
                const month = ("0" + (t.getMonth() + 1)).slice(-2)
                const year = t.getFullYear()
                const hours = ("0" + t.getHours()).slice(-2)
                const minutes = ("0" + t.getMinutes()).slice(-2)
                const seconds = ("0" + t.getSeconds()).slice(-2)
                // sorry not using Intl.DateTimeFormat because this is to slow
                switch (this.data_group_by) {
                    case "year":
                        return { name: year, label: year }
                    case "month":
                        return { name: `${year}.${month}`, label: `${month}.${year}` }
                    case "day":
                        return { name: `${month}.${day}`, label: `${day}.${month}` }
                    case "hour":
                        return { name: `${month}.${day} ${hours}`, label: [`${day}.${month}`, `${hours}.${minutes}`] }
                    case "minutes":
                        return {
                            name: `${month}.${day} ${hours}:${minutes}`,
                            label: [`${day}.${month}`, `${hours}.${minutes}`]
                        }
                    default:
                        return {
                            name: `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`,
                            label: `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`
                        }
                }
            }

            // first build the groups for all entities
            let _useAlias = this.settings.aliasfield
            let _df = this.settings.datafields
            array.forEach(function (o) {
                if (o && o.last_changed) {
                    let group = _fmd(o.last_changed)
                    if (group) {
                        groups[group.name] = groups[group.name] || []
                        if (_useAlias && _df) {
                            // use the attribute value
                            let fld = _df[o.entity_id].attribute || 0.0
                            let _factor = _df[o.entity_id]._factor || 1.0
                            if (fld in o.attributes) {
                                groups[group.name].push({
                                    timelabel: group.label,
                                    state: (o.attributes[fld] || 0.0) * _factor,
                                    last_changed: o.last_changed
                                })
                            }
                        } else {
                            // use the state value
                            let _factor = _df && _df[o.entity_id] ? _df[o.entity_id]._factor || 1.0 : 1.0
                            groups[group.name].push({
                                timelabel: group.label,
                                state: (o.state || 0.0) * _factor,
                                last_changed: o.last_changed
                            })
                        }
                    }
                }
            })

            // create the grouped seriesdata
            const aggr = this.data_aggregate
            return Object.keys(groups).map(function (group) {
                let items = groups[group].filter(
                    (item) => item.state && !isNaN(parseFloat(item.state)) && isFinite(item.state)
                )
                if (items && items.length === 0) {
                    return {
                        y: 0.0,
                        x: ""
                    }
                }
                if (aggr == "first") {
                    const item = items.shift()
                    return {
                        y: _itemvalue(item),
                        x: item.timelabel
                    }
                }
                if (aggr == "last") {
                    const item = items[items.length - 1]
                    return {
                        y: _itemvalue(item),
                        x: item.timelabel
                    }
                }
                if (aggr == "max") {
                    return items.reduce((a, b) =>
                        _itemvalue(a) > _itemvalue(b)
                            ? {
                                  y: _itemvalue(a),
                                  x: a.timelabel
                              }
                            : { y: _itemvalue(b), x: b.timelabel }
                    )
                }
                if (aggr == "min")
                    return items.reduce((a, b) =>
                        _itemvalue(a) < _itemvalue(b)
                            ? {
                                  y: _itemvalue(a),
                                  x: a.timelabel
                              }
                            : {
                                  y: _itemvalue(b),
                                  x: b.timelabel
                              }
                    )
                if (aggr == "sum") {
                    const val = items.reduce((sum, entry) => sum + _itemvalue(entry), 0)
                    return {
                        y: val,
                        x: items[0].timelabel
                    }
                }
                if (aggr == "avg") {
                    const val = items.reduce((sum, entry) => sum + _itemvalue(entry), 0) / items.length
                    return {
                        y: val,
                        x: items[0].timelabel
                    }
                }
                return items.map((item) => {
                    return {
                        y: _itemvalue(item),
                        x: items.timelabel
                    }
                })
            })
        } catch (err) {
            console.error("Build Histroydata", err.message, err)
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
        let _graphData = null
        let _entities = this.entities
        if (_entities && _entities.length % 2 === 0) {
            _graphData = this.getDefaultGraphData()
            _graphData.config.mode = "simple"
            for (let i = 0; i < _entities.length; i += 2) {
                // first entity holds the attributes
                const _attr = _entities[i]
                let _options = {
                    label: _attr.name || "",
                    unit: _attr.unit || "",
                    hoverRadius: 20,
                    radius: 15,
                    pointRadius: 15,
                    hitRadius: 20,
                    backgroundColor: _attr.backgroundColor || DEFAULT_COLORS[20 + i],
                    borderColor: _attr.borderColor || COLOR_BUBBLECHAT
                }
                if (this.entityOptions) {
                    _options = { ...this.entityOptions, ..._options }
                    _graphData.config.options = this.entityOptions
                }
                if (this.entityOptions && this.entityOptions.gradient !== undefined) {
                    _graphData.config.gradient = true
                }
                _options.data = [
                    {
                        x: _entities[i].state || 0.0,
                        y: _entities[i + 1].state || 0.0
                    }
                ]
                _graphData.data.datasets.push(_options)
            }
            _graphData.config.options.scatter = true
        } else {
            console.error("ScatterChart setting not valid", this.entities)
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
        let _graphData = null
        let _entities = this.entities
        if (_entities && _entities.length % 3 === 0) {
            _graphData = this.getDefaultGraphData()
            _graphData.config.mode = "simple"
            for (let i = 0; i < _entities.length; i += 3) {
                const _attr = _entities[i + 2]
                let _options = {
                    label: _attr.name || "",
                    scale: _attr.scale || 1.0,
                    unit: _attr.unit || "",
                    backgroundColor: _attr.backgroundColor || COLOR_BUBBLECHAT,
                    borderColor: _attr.borderColor || COLOR_BUBBLECHAT
                }
                if (this.entityOptions) {
                    _options = { ...this.entityOptions, ..._options }
                    _graphData.config.options = this.entityOptions
                }
                if (this.entityOptions && this.entityOptions.gradient !== undefined) {
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
                _graphData.data.datasets.push(_options)
            }
            _graphData.config.options.bubble = true
        } else {
            console.error("BubbleChart setting not valid", this.entities)
        }
        return _graphData
    }

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
    }

    /**
     * --------------------------------------
     * create chart data - entity state based
     * --------------------------------------
     * this is used for pie-, doughnut-, polarArea-,radar-, simple bar chart
     * because we do not need time series - only the current state values.
     *
     * this.graphData.config holds the configruation data
     *
     */
    createChartData() {
        let _data = []

        // entityData    : holds all  current values
        // entityNames   : holds all entities names

        // entities      : all entities data and options
        // entityOptions : global entities options

        const emptyIndexes = this.entityData.reduce((arr, e, i) => (e == 0 && arr.push(i), arr), [])
        _data = this.entityData.filter((element, index, array) => !emptyIndexes.includes(index))

        if (_data.length === 0) {
            console.error("No Data present !")
            return null
        }

        let _defaultDatasetConfig = {
            unit: this.data_units || "",
            mode: "current"
        }

        let _graphData = this.getDefaultGraphData()
        _graphData.config.mode = "simple"

        // merge entity options
        if (this.entityOptions) {
            _defaultDatasetConfig = {
                ..._defaultDatasetConfig,
                ...this.entityOptions
            }
        }

        // merge dataset_config
        _graphData.data.labels = this.entityNames.filter((element, index, array) => !emptyIndexes.includes(index))

        _graphData.data.datasets[0] = _defaultDatasetConfig
        _graphData.data.datasets[0].unit = this.card_config.units || ""
        _graphData.data.datasets[0].label = this.card_config.title || ""

        // case horizontal bar
        if (this.card_config.chart.toLowerCase() === "horizontalbar") {
            _graphData.data.datasets[0].indexAxis = "y"
        }

        // custom colors from the entities
        let entityColors = this.entities
            .map((x) => {
                if (x.color !== undefined || x.backgroundColor !== undefined) return x.color || x.backgroundColor
            })
            .filter((notUndefined) => notUndefined !== undefined)

        if (this.entityOptions && this.entityOptions.gradient != undefined) {
            _graphData.config.gradient = true
        }

        if (entityColors.length === _graphData.data.labels.length) {
            _graphData.data.datasets[0].backgroundColor = entityColors
            _graphData.data.datasets[0].showLine = false
        } else {
            if (this.chart_type === "radar") {
                _graphData.data.datasets[0].backgroundColor = COLOR_RADARCHART
                _graphData.data.datasets[0].borderColor = COLOR_RADARCHART
                _graphData.data.datasets[0].borderWidth = 1
                _graphData.data.datasets[0].pointBorderColor = COLOR_RADARCHART
                _graphData.data.datasets[0].pointBackgroundColor = COLOR_RADARCHART
                _graphData.data.datasets[0].tooltip = true
                _graphData.config.gradient = false
            } else {
                // get backgroundcolor from DEFAULT_COLORS
                entityColors = DEFAULT_COLORS.slice(1, _data.length + 1)
                _graphData.data.datasets[0].backgroundColor = entityColors
                _graphData.data.datasets[0].borderWidth = 0
                _graphData.data.datasets[0].showLine = false
            }
        }
        _graphData.data.datasets[0].data = _data
        _graphData.config.segmentbar = false

        // add the data series and return the new graph data
        if (this.chart_type === "bar" && this.card_config.show && this.card_config.show.segmented) {
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
            switch (this.chart_type.toLowerCase()) {
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

    /**
     * get series data for bubble or scatter chart
     */
    getSeriesData() {
        let _seriesData = []
        for (const list of this.stateHistories) {
            if (list.length === 0) continue
            if (!list[0].state) continue
            const items = this._getGroupHistoryData(list)
            _seriesData.push(items)
        }
        return _seriesData
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
        let _seriesData = this.getSeriesData()
        if (_seriesData && _seriesData.length % 3 === 0) {
            let _graphData = this.getDefaultGraphData()
            for (let r = 0; r < _seriesData.length; r += 3) {
                const _attr = this.entities[r + 2]
                let _data = []
                _seriesData[r].forEach(function (e, i) {
                    if (_seriesData[r + 1][i] && _seriesData[r + 2][i]) {
                        _data.push({
                            x: parseFloat(_seriesData[r + 0][i].y) || 0.0,
                            y: parseFloat(_seriesData[r + 1][i].y || 0.0),
                            r: parseFloat(_seriesData[r + 2][i].y || 0.0)
                        })
                    }
                })
                let _options = {
                    label: _attr.name || "",
                    unit: _attr.unit || "",
                    scale: _attr.scale || 1,
                    backgroundColor: _attr.backgroundColor || COLOR_BUBBLECHAT,
                    borderColor: _attr.borderColor || COLOR_BUBBLECHAT
                    // TODO: min, max, avg values
                }
                if (_attr && _attr.pointStyle) {
                    _options.pointStyle = _attr.pointStyle
                    _options.pointRadius = 6
                }
                if (_attr && _attr.pointRadius) {
                    _options.pointRadius = _attr.pointRadius
                }
                if (this.entityOptions) {
                    // simple merge the default with the global options
                    _options = { ..._options, ...this.entityOptions }
                    _graphData.config.options = this.entityOptions
                }
                _options.data = _data
                _graphData.data.datasets.push(_options)
            }
            if (_graphData.data.datasets.length) {
                _graphData.config.options.bubble = true
                return _graphData
            }
        }
        console.error("BubbleChart setting not valid", this.entities)
        return null
    }

    /**
     * get the history scatter chart data
     */
    createHistoryScatterData() {
        let _seriesData = this.getSeriesData()
        if (_seriesData && _seriesData.length % 2 === 0) {
            let _graphData = this.getDefaultGraphData()
            _graphData.config.mode = "history"
            for (let r = 0; r < _seriesData.length; r += 2) {
                // first entity hols the attributes
                const _attr = this.entities[r]
                let _data = []
                _seriesData[r].forEach(function (e, i) {
                    if (_seriesData[r][i] && _seriesData[r + 1][i]) {
                        _data.push({
                            x: parseFloat(_seriesData[r + 0][i].y) || 0.0,
                            y: parseFloat(_seriesData[r + 1][i].y || 0.0)
                        })
                    }
                })
                // default options
                let _options = {
                    label: _attr.name || "",
                    unit: _attr.unit || "",
                    hoverRadius: 18,
                    pointRadius: 16,
                    hitRadius: 22,
                    backgroundColor: _attr.backgroundColor || DEFAULT_COLORS[10 + r],
                    borderColor: _attr.borderColor || DEFAULT_COLORS[10 + r]
                    // TODO: min, max, avg values ???
                }
                if (this.entityOptions) {
                    // simple merge the default with the global options
                    _options = { ..._options, ...this.entityOptions }
                    _graphData.config.options = this.entityOptions
                }
                _options.data = _data
                _graphData.data.datasets.push(_options)
            }
            if (_graphData.data.datasets.length) {
                _graphData.config.options.bubble = true
                return _graphData
            }
        }
        console.error("ScatterChart setting not valid", this.entities)
        return null
    }

    /**
     * ----------------------------------------
     * create chart data - history state based
     * ----------------------------------------
     * Get the series data for all entities from the
     * history and create the chart history data
     */
    createHistoryChartData() {
        let _graphData = this.getDefaultGraphData()
        _graphData.config.options.fill = false
        _graphData.config.mode = "history"

        // all for other carts
        for (const list of this.stateHistories) {
            if (list.length === 0) continue
            //if (!list[0].state) continue

            // interate throw all entities data
            const items = this._getGroupHistoryData(list)
            const id = list[0].entity_id

            // get all settings from the selected entity
            const _attr = this.entities.find((x) => x.entity === id)

            // build the dataseries and check ignore data with zero values

            let _items = this.card_config.ignoreZero
                ? items.map((d) => d.y).filter((x) => x != 0)
                : items.map((d) => d.y)

            // default Dataset Properties
            let _options = {
                label: _attr.name || "unkonwn",
                unit: _attr.unit || "",
                minval: 0.0,
                maxval: 0.0,
                sumval: 0.0,
                avgval: 0.0,
                pointRadius: 0,
                current: _attr.state || 0.0,
                last_changed: items[0].last_changed || new Date(),
                mode: "history"
            }

            if (this.card_config.showdetails) {
                _options.minval = Math.min(..._items)
                _options.maxval = Math.max(..._items)
                _options.sumval = arrSum(_items)
                _options.avgval = arrAvg(_items)
            }

            if (this.card_config.chart.toLowerCase() === "horizontalbar") {
                _options.indexAxis = "y"
            }

            if (this.card_config.chart.toLowerCase() === "radar") {
                _options.pointRadius = 12
                _options.hoverRadius = 18
                _options.hitRadius = 22
            }

            if (_attr && _attr.pointStyle) {
                _options.pointStyle = _attr.pointStyle
                //_options.pointRadius = 6
            }
            if (_attr && _attr.pointRadius) {
                _options.pointRadius = _attr.pointRadius
            }

            if (this.entityOptions) {
                // simple merge the default with the global options
                _options = { ..._options, ...this.entityOptions }
                _graphData.config.options = { ..._graphData.config.options, ...this.entityOptions }
            }

            // simple merge the entity options
            if (_attr) _options = { ..._options, ..._attr }

            if (_attr.fill !== undefined) {
                _graphData.config.options.fill = _attr.fill
            } else {
                _attr.fill = ["bar", "horizontalbar"].includes(this.card_config.chart.toLowerCase())
            }

            if (_attr.fill && _attr.gradient && _attr.gradient.colors) {
                const _axis = _options.indexAxis === "y" ? "x" : "y"
                _options.gradient = {
                    backgroundColor: {
                        axis: _axis,
                        colors: _attr.gradient.colors
                    }
                }
                _options.labelcolor = _attr.gradient.colors[0]
                _options.borderColor = _attr.gradient.colors[0] || DEFAULT_COLORS[_graphData.config.series]
                _graphData.config.gradient = true
            } else {
                if (_attr.backgroundColor === undefined) {
                    _options.backgroundColor = DEFAULT_COLORS[_graphData.config.series]
                    _options.borderColor = DEFAULT_COLORS[_graphData.config.series]
                }
            }

            // check secondary axis
            if (!_graphData.config.secondaryAxis) {
                _graphData.config.secondaryAxis = _attr.yAxisID != undefined || _attr.xAxisID != undefined
            }

            // assign the data for the current series
            _options.data = _items

            // add the options, labels and data series
            _graphData.data.labels = items.map((l) => l.x)

            _graphData.data.datasets.push(_options)
            _graphData.config.series++
        }
        return _graphData
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
                        this.graphData = this.createHistoryBubbleData()
                        break
                    case "scatter":
                        this.graphData = this.createHistoryScatterData()
                        break
                    default:
                        this.graphData = this.createHistoryChartData()
                        break
                }
                return this.graphData
            }
        } catch (err) {
            console.error("Build History GraphData", err.message, err)
        }
        return null
    }
}
