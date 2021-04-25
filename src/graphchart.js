/** ----------------------------------------------------------
 
	Lovelaces chartjs
  	(c) 2021 Peter Siebler
  	Released under the MIT license
 
 * ----------------------------------------------------------*/

/**
 * format the x-axis date/time label
 * @param {*} tickValue
 * @param {*} index
 * @param {*} ticks
 * @returns formatted tick value
 */
function xAxisFormat(tickValue, index, ticks) {
    if (this && this.options.time && this.options.time.unit) {
        const dateFormatPattern = this.options.time.format || this.options.time.unit
        if (dateFormatPattern && Number.isInteger(tickValue)) {
            return formatdate(+tickValue, dateFormatPattern)
        }
    }
    return tickValue
}

/**
 * format the y-axis date/time label
 * @param {*} tickValue
 * @param {*} index
 * @param {*} ticks
 * @returns formated tick value
 */
function yAxisFormat(tickValue, index, ticks) {
    return tickValue
}

/**
 * format the tooltip title
 * if attribute localedate is present, this is returned
 * as label otherwise the data.label will be used.
 * @param {object} context
 * @returns string
 */
function formatToolTipTitle(context) {
    const _ct = context[0].chart.config._config.type
    if (_ct == "polarArea") return context[0].chart.config._config.data.labels[context[0].dataIndex] || ""
    if (_ct == "scatter") return ""
    if (context[0].label && context[0].raw && context[0].raw.localedate) {
        return context[0].raw.localedate || context[0].label
    }
    return context[0].label || ""
}

/**
 * format the tooltip label
 * @param {object} context
 * @returns string
 */
function formatToolTipLabel(context) {
    if (context.dataset.tooltip === false) {
        return null
    }
    let label = context.dataset.label || context.label || context.chart.data.labels[context.dataIndex] || ""
    const value = context.chart.config._config.type === "bubble" ? context.parsed._custom : context.formattedValue
    if (context.dataset.units && context.dataset.units.length > context.dataIndex) {
        label += `: ${value}  ${context.dataset.units[context.dataIndex] || ""}`
    } else {
        label += `: ${value}  ${context.dataset.unit || ""}`
    }
    return label
}

/**
 * Lovelaces chartjs
 * graph chart wrapper class
 *
 */
class graphChart {
    /**
     * graph chart constructor
     * @param {*} config
     */
    constructor(config) {
        /**
         * settings
         */
        this.ctx = config.ctx || null // the chart canvas element
        this.canvasId = config.canvasId // canvas container id
        this.entity_items = config.entity_items // all entities
        this.chart_type = config.chart_type || "bar" // the chart type
        this.chartconfig = config.chartconfig || {} // the chart config from the template
        this.loader = config.loader // the loading animation
        this.DEBUGMODE = config.debugmode || 0 // internal debugging enabled
        this.DEBUGDATA = config.debugdata

        /**
         * all class based properties
         */
        this.chart = null // current chart
        this.graphData = {} // the graph data set by _buildGraphData...
        this.graphDataSets = [] // current graph settings
        this.chart_ready = false // boolean chart allready exits
        this.lastUpdate = null // timestamp last chart update
        this.ChartControl = window.Chart3 || Chart // chart global settings
        this.version = "1.0.1"
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
        /**
         * the animated loader
         */
        const _loader = this.loader
        /**
         * chart default options
         */
        let _options = {
            hoverOffset: 8,
            layout: {},
            chartArea: {
                backgroundColor: "transparent"
            },
            elements: {},
            spanGaps: true,
            plugins: {
                title: {},
                tooltip: {},
                legend: {
                    display: CT_SHOWLEGEND.includes(this.chart_type) || false
                }
            },
            animation: {
                onComplete: function () {
                    if (_loader) _loader.style.display = "none"
                }
            }
        }
        /**
         * check enable gradient colors for state charts or
         */
        if (this.graphData.config.gradient === true && this.graphData.config.mode === "simple") {
            _options.gradientcolor = {
                color: true,
                type: this.chart_type
            }
        }
        /**
         * check enable gradient colors for data series chart
         */
        if (plugin_gradient && this.graphData.config.gradient) {
            _options.plugins = {
                plugin_gradient
            }
        }
        /**
         * check secondary axis
         * this.graphData.config holds the configruation data
         * this.graphData.data.datasets data per series
         */
        if (this.graphData.config.secondaryAxis && this.graphData && this.graphData.data && this.graphData.data.datasets) {
            let _scaleOptions = {}
            this.graphData.data.datasets.forEach((dataset) => {
                if (dataset.yAxisID) {
                    _scaleOptions[dataset.yAxisID] = {}
                    _scaleOptions[dataset.yAxisID].id = dataset.yAxisID
                    _scaleOptions[dataset.yAxisID].type = "linear"
                    _scaleOptions[dataset.yAxisID].position = dataset.yAxisID
                    _scaleOptions[dataset.yAxisID].display = true
                    if (dataset.yAxisID.toLowerCase() == "right") {
                        _scaleOptions[dataset.yAxisID].grid = {
                            drawOnChartArea: false
                        }
                    }
                }
                if (dataset.xAxisID) {
                    _scaleOptions[dataset.xAxisID] = {}
                    _scaleOptions[dataset.xAxisID].id = dataset.xAxisID
                    _scaleOptions[dataset.xAxisID].type = "linear"
                    _scaleOptions[dataset.xAxisID].position = dataset.xAxisID
                    _scaleOptions[dataset.xAxisID].display = true
                    if (dataset.xAxisID.toLowerCase() == "top") {
                        _scaleOptions[dataset.xAxisID].grid = {
                            drawOnChartArea: false
                        }
                    }
                }
            })
            if (_scaleOptions) {
                _options.scales = _scaleOptions
            }
        }
        /**
         * bubble axis label based on the data settings
         *
         */
        if (this.chart_type.isChartType("bubble")) {
            const _itemlist = this.entity_items.getEntitieslist()
            let labelX = _itemlist[0].name
            labelX += _itemlist[0].unit ? " (" + _itemlist[0].unit + ")" : ""
            let labelY = _itemlist[1].name
            labelY += _itemlist[1].unit ? " (" + _itemlist[1].unit + ")" : ""
            _options.scales = {
                x: {
                    id: "x",
                    title: {
                        display: true,
                        text: labelX
                    }
                },
                y: {
                    id: "y",
                    title: {
                        display: true,
                        text: labelY
                    }
                }
            }
            /**
             * scale bubble (optional)
             */
            if (this.graphData.config.bubbleScale) {
                _options.elements = {
                    point: {
                        radius: (context) => {
                            const value = context.dataset.data[context.dataIndex]
                            return value._r * this.graphData.config.bubbleScale
                        }
                    }
                }
            }
        }
        /**
         * special case for timescales to translate the date format
         */
        if (this.graphData.config.timescale && this.graphData.config.datascales) {
            _options.scales = _options.scales || {}
            _options.scales.x = _options.scales.x || {}
            _options.scales.x.maxRotation = 0
            _options.scales.x.autoSkip = true
            _options.scales.x.major = true
            _options.scales.x.type = "time"
            _options.scales.x.time = {
                unit: this.graphData.config.datascales.unit,
                format: this.graphData.config.datascales.format,
                isoWeekday: this.graphData.config.datascales.isoWeekday
            }
            _options.scales.x.ticks = {
                callback: xAxisFormat
            }
        }
        /**
         * case barchart segment
         * TODO: better use a plugin for this feature.
         * set bar as stacked, hide the legend for the segmentbar,
         * hide the tooltip item for the segmentbar.
         */
        if (this.graphData.config.segmentbar === true) {
            _options.scales = {
                x: {
                    id: "x",
                    stacked: true
                },
                y: {
                    id: "y",
                    stacked: true
                }
            }
            _options.plugins.legend = {
                labels: {
                    filter: (legendItem, data) => {
                        return data.datasets[legendItem.datasetIndex].tooltip !== false
                    }
                },
                display: false
            }
            _options.plugins.tooltip.callbacks = {
                label: (chart) => {
                    if (chart.dataset.tooltip === false || !chart.dataset.label) {
                        return null
                    }
                    return `${chart.formattedValue} ${chart.dataset.unit || ""}`
                }
            }
            _options.interaction = {
                intersect: false,
                mode: "index"
            }
        } else {
            /**
             * callbacks for tooltip
             */
            _options.plugins.tooltip = {
                callbacks: {
                    label: formatToolTipLabel,
                    title: formatToolTipTitle
                }
            }
            _options.interaction = {
                intersect: true,
                mode: "point"
            }
        }
        /**
         * disable bubble legend
         */
        if (this.chart_type.isChartType("bubble")) {
            _options.plugins.legend = {
                display: false
            }
        }
        /**
         * multiseries for pie and doughnut charts
         */
        if (this.graphData.config.multiseries === true) {
            _options.plugins.legend = {
                labels: {
                    generateLabels: function (chart) {
                        const original = Chart.overrides.pie.plugins.legend.labels.generateLabels,
                            labelsOriginal = original.call(this, chart)
                        let datasetColors = chart.data.datasets.map(function (e) {
                            return e.backgroundColor
                        })
                        datasetColors = datasetColors.flat()
                        labelsOriginal.forEach((label) => {
                            label.datasetIndex = label.index
                            label.hidden = !chart.isDatasetVisible(label.datasetIndex)
                            label.fillStyle = datasetColors[label.index]
                        })
                        return labelsOriginal
                    }
                },
                onClick: function (mouseEvent, legendItem, legend) {
                    legend.chart.getDatasetMeta(legendItem.datasetIndex).hidden = legend.chart.isDatasetVisible(
                        legendItem.datasetIndex
                    )
                    legend.chart.update()
                }
            }
            _options.plugins.tooltip = {
                callbacks: {
                    label: function (context) {
                        const labelIndex = context.datasetIndex
                        return `${context.chart.data.labels[labelIndex]}: ${context.formattedValue} ${context.dataset.unit || ""}`
                    }
                }
            }
        }
        /**
         * preset cart current config
         */
        let chartCurrentConfig = {
            type: this.chart_type,
            data: {
                datasets: []
            },
            options: _options
        }
        /**
         * merge default with chart config options
         * this.chartconfig.options see yaml config
         * - chart
         *   - options:
         */
        if (this.chartconfig.options) {
            chartCurrentConfig.options = deepMerge(_options, this.chartconfig.options)
        } else {
            chartCurrentConfig.options = _options
        }
        return chartCurrentConfig
    }

    /**
     * developer test
     * send the chart settings to the server.
     * @param {*} chartdata
     */
    sendJSON(url, chartdata) {
        let xhr = new XMLHttpRequest()
        xhr.open("POST", url, true)
        xhr.withCredentials = false
        xhr.setRequestHeader("Content-Type", "application/json")
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                console.info("sendJson", this.responseText)
            }
        }
        xhr.send(JSON.stringify(chartdata))
    }

    /**
     * render the graph based on the settings and datasets.
     * @example:
     *    this.graphChart.graphData = this.graphData
     *    this.graphChart.renderGraph()
     */
    renderGraph(doUpdate) {
        try {
            if (this.graphData && this.graphData.data && this.graphData.config) {
                if (
                    this.graphDataSets &&
                    this.graphDataSets.length &&
                    JSON.stringify(this.graphDataSets) === JSON.stringify(this.graphData.data.datasets)
                ) {
                    /**
                     * same data as before, we have nothing to do.
                     */
                    return
                }
                /**
                 * append the data for the current chart settings
                 */
                let graphOptions = this._setChartOptions()
                graphOptions.data = {
                    datasets: this.graphData.data.datasets
                }
                if (this.graphData.data.labels) {
                    graphOptions.data.labels = this.graphData.data.labels
                }
                /**
                 * Chart declaration
                 */
                if (this.ctx && graphOptions.data && graphOptions.options) {
                    if (doUpdate && this.chart && this.chart.data) {
                        /**
                         * redraw the chart with the current options
                         * and updated data series
                         */
                        this.chart.data = graphOptions.data
                        this.chart.update({
                            duration: 0,
                            easing: "linear"
                        })
                        if (this.DEBUGMODE) {
                            this.DEBUGDATA.CHARD = {
                                chartOptions: graphOptions,
                                chartMode: "update data ready",
                                chartjs: window.Chart3.version,
                                chartGraphdata: this.graphData.config
                            }
                        }
                    } else {
                        /**
                         * set the chart options
                         */
                        if (this.chart_ready === false && this.ChartControl.register) {
                            /**
                             * create and draw the new chart with the current settings
                             * and the dataseries. Register all plugins
                             */
                            if (this.graphData.config.gradient) {
                                this.ChartControl.register(plugin_gradient)
                            }
                            /**
                             * check trendline
                             */
                            if (this.graphData.config.trendline && window.plugin_trendline)
                                this.ChartControl.register(window.plugin_trendline)

                            if (
                                this.ChartControl &&
                                this.chartconfig &&
                                this.chartconfig.options &&
                                this.chartconfig.options.chartArea &&
                                this.chartconfig.options.chartArea.backgroundColor !== ""
                            ) {
                                /**
                                 * chart background color uses
                                 */
                                this.ChartControl.register({
                                    id: "chardbackground",
                                    beforeDraw: function (chart) {
                                        if (chart.config.options.chartArea && chart.config.options.chartArea.backgroundColor) {
                                            const chartArea = chart.chartArea,
                                                ctx = chart.ctx
                                            ctx.save()
                                            ctx.fillStyle = chart.config.options.chartArea.backgroundColor
                                            ctx.fillRect(
                                                chartArea.left,
                                                chartArea.top,
                                                chartArea.right - chartArea.left,
                                                chartArea.bottom - chartArea.top
                                            )
                                            ctx.restore()
                                        }
                                    }
                                })
                            }

                            if (this.graphData.config.thresholds) {
                                /**
                                 * chart thresholds area
                                 * 
                                 * thresholds: {
                                      linecolor: 'rgba(244, 67, 54,0.8)',                                      
                                      backgroundColor: 'rgba(255, 87, 34,0.15)',
                                      value: 150,
                                      yScaleID: 'y'
                                   }
                                 * 
                                 */
                                this.ChartControl.register({
                                    id: "thresholds",
                                    beforeDraw: function (chart) {
                                        const _options = chart.config.options.thresholds,
                                            _rect = getRect(chart, _options),
                                            ctx = chart.ctx

                                        if (!_options) return
                                        /**
                                         * get the rect for the thresholds
                                         * @param {*} chart
                                         * @returns
                                         */
                                        function getRect(chart, _options) {
                                            if (_options) {
                                                const _axis = chart.scales[_options.yScaleID || _options.xScaleID],
                                                    _dir = _options.xScaleID ? "x" : "y"
                                                return {
                                                    x: chart.chartArea.left,
                                                    x2: chart.chartArea.right,
                                                    y: _dir === "y" ? _axis.getPixelForValue(_options.value) : chart.chartArea.top,
                                                    y2: chart.chartArea.bottom,
                                                    w:
                                                        _dir === "x"
                                                            ? chart.chartArea.right - _axis.getPixelForValue(_options.value)
                                                            : chart.chartArea.width,
                                                    h:
                                                        _dir === "y"
                                                            ? chart.chartArea.bottom - _axis.getPixelForValue(_options.value)
                                                            : chart.chartArea.height,
                                                    width: chart.chartArea.width,
                                                    height: chart.chartArea.height,
                                                    axis: _dir
                                                }
                                            }
                                            return null
                                        }
                                        /**
                                         * render the thresholds area
                                         */
                                        if (_options && _rect) {
                                            ctx.save()
                                            const _gradient =
                                                    _rect.axis === "y"
                                                        ? ctx.createLinearGradient(0, 0, 0, _rect.h)
                                                        : ctx.createLinearGradient(0, 0, _rect.w, 0),
                                                _color = _options.backgroundColor || "rgb(249, 70, 12)"
                                            _gradient.addColorStop(0, window.Chart3.helpers.color(_color).alpha(0.85).rgbString())
                                            _gradient.addColorStop(1.0, window.Chart3.helpers.color(_color).alpha(0.15).rgbString())
                                            ctx.fillStyle = _gradient
                                            ctx.fillRect(_rect.x, _rect.y, _rect.width, _rect.h)
                                            ctx.beginPath()
                                            ctx.lineWidth = 1.25
                                            ctx.strokeStyle = _color
                                            if (_rect.axis === "y") {
                                                ctx.moveTo(_rect.x - 5.0, _rect.y)
                                                ctx.lineTo(_rect.x2, _rect.y)
                                            } else {
                                                ctx.moveTo(_rect.x, _rect.y - 5.0)
                                                ctx.lineTo(_rect.x, _rect.y2)
                                            }
                                            ctx.stroke()
                                            ctx.restore()
                                        }
                                    }
                                })
                            }
                        }

                        if (this.chart) {
                            /**
                             * be shure that no chart exits before create..
                             */
                            this.chart.destroy()
                            this.chart = null
                        }
                        if (this.DEBUGMODE) {
                            this.DEBUGDATA.CHARD = {}
                            this.DEBUGDATA.CHARD.cart3Options = graphOptions
                        }
                        /**
                         * create new chart and render the content
                         */
                        this.chart = new window.Chart3(this.ctx, graphOptions)
                        this.graphDataSets = this.graphData.data.datasets
                        if (this.DEBUGMODE) {
                            this.DEBUGDATA.CHARD = {
                                chartOptions: graphOptions,
                                chartMode: "new data ready",
                                chartjs: window.Chart3.version,
                                chartmodul: "v " + this.version,
                                chartGraphdata: this.graphData.config
                            }
                        }
                        if (this.chart) {
                            this.chart_ready = true
                        }
                    }
                }
            } else {
                console.error("Fatal Error, missing graphdata", graphOptions)
            }
        } catch (err) {
            console.error("Error Render Graph Error on ", this.chart_type, ": ", err, err.message)
        }
    }
}
