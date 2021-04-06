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
        const dateFormatPattern = this.options.time.unit
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
 * @param {*} context
 * @returns string
 */
function formatToolTipTitle(context) {
    const data = context[0].raw
    if (context[0].label && data && data.localedate) {
        return data.localedate || context[0].label
    }
    return context[0].label || ""
}

/**
 * format the tooltip label
 * @param {*} context
 * @returns string
 */
function formatToolTipLabel(context) {
    if (context.dataset.tooltip === false || !context.dataset.label) {
        return null
    }
    let label = context.dataset.label || ""
    const data = context.raw
    const unit = context.dataset.unit ? ` ${context.dataset.unit}` : ""
    label += ": " + context.formattedValue + unit
    // if (context.raw.statistics) {
    //   label = [label, "Statistics", context.raw.statistics]
    // }
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
     *
     * @example:
     *  called form setConfig(config)...
     *  let settings = {
     *		ctx: this.ctx,
     *		chart_locale: this.chart_locale,
     *		chart_type: this.chart_type,
     *		chartconfig: this.chartconfig,
     *	}
     *	// init the graph chart
     *	this.graphChart = new graphChart(settings);
     *
     */
    constructor(config) {
        this.chart = null // current chart
        this.ctx = config.ctx || null // the chart canvas element
        this.canvasId = config.canvasId // canvas container id
        this.card_config = config.card_config // current card settings
        this.entity_items = config.entity_items // all entities
        this.chart_locale = config.locale || "de-DE" // the locale for number(s) and date(s)
        this.chart_type = config.chart_type || "bar" // the chart type
        this.chartconfig = config.chartconfig || {} // the chart config from the template
        this.loader = config.loader // the loading animation
        this.DEBUGMODE = config.debugmode || 0 // internal debugging enabled
        this.DEBUGDATA = config.debugdata
        this.graphData = {} // the graph data
        this.graphDataSets = [] // current graph settings
        this.setting = config.setting
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
        // the animated loader
        const _loader = this.loader
        // chart default options
        let _options = {
            unit: "",
            hoverOffset: 8,
            layout: {},
            interaction: {
                mode: "nearest",
                intersect: false
            },
            chartArea: {
                backgroundColor: "transparent"
            },
            elements: {},
            spanGaps: true,
            plugins: {
                title: {},
                tooltip: {},
                legend: {
                    display: ["pie", "doughnut", "polararea", "line"].includes(this.chart_type.toLowerCase()) || false
                }
            },
            animation: {
                onComplete: function () {
                    if (_loader) _loader.style.display = "none"
                }
            },
            onResize: null
        }

        if (this.graphData.config.gradient === true && this.graphData.config.mode === "simple") {
            //enable gradient colors for state charts
            _options.gradientcolor = {
                color: true,
                type: this.chart_type
            }
        }
        if (gradient && this.graphData.config.gradient) {
            // enable gradient colors for data series chart
            _options.plugins = {
                gradient
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
         */
        if (this.chart_type.toLowerCase() === "bubble") {
            const _itemlist = this.entity_items.getEntitieslist()
            let labelX = _itemlist[0].name
            labelX += _itemlist[0].unit ? " (" + _itemlist[0].unit + ")" : ""
            let labelY = _itemlist[1].name
            labelY += _itemlist[1].unit ? " (" + _itemlist[1].unit + ")" : ""
            _options.scales = {
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
            }
            // scale bubble (optional)
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
        if (this.graphData.config.timescale && this.card_config.datascales) {
            _options.scales = _options.scales || {}
            _options.scales.x = _options.scales.x || {}
            _options.scales.x.type = "time"
            _options.scales.x.time = {
                unit: this.card_config.datascales.unit,
                displayFormats: {}
                //tooltipFormat: "EEEEEE, dd.MMM.yyyy H:ss" //this.card_config.datascales.format
            }
            _options.scales.x.ticks = {
                callback: xAxisFormat
            }
            // _options.scales.y = _options.scales.y || {}
            // _options.scales.y.ticks = {
            //     callback: yAxisFormat
            // }
            // _options.scales.x.time.displayFormats[_options.scales.x.time.unit] = this.card_config.datascales.format
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
                display: false,
                labels: {
                    filter: (legendItem, data) => {
                        return data.datasets[legendItem.datasetIndex].tooltip !== false
                    }
                }
            }
        }

        /**
         * callbacks for tooltip
         */
        _options.plugins.tooltip = {
            callbacks: {
                label: formatToolTipLabel,
                title: formatToolTipTitle
            }
        }

        /**
         * disable bubble legend
         */
        if (this.chart_type.toLowerCase() === "bubble") {
            _options.plugins.legend = {
                display: false
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
     * send the chart settings to the local server.
     * @param {*} chartdata
     */
    sendJSON(url, chartdata) {
        // Creating a XHR object
        let xhr = new XMLHttpRequest()
        // let url = "http://dev.siebler.at/test/getdata.php?file="+this.card_config.id+'.json';

        // open a connection
        xhr.open("POST", url, true)

        // Set the request header i.e. which type of content you are sending
        xhr.setRequestHeader("Content-Type", "application/json")

        // Create a state change callback
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                // Print received data from server
                console.info("sendJson", this.responseText)
            }
        }

        // Converting JSON data to string
        var data = JSON.stringify(chartdata)
        console.info(data)

        // Sending data with the request
        xhr.send(data)
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
                if (
                    this.graphDataSets &&
                    this.graphDataSets.length &&
                    JSON.stringify(this.graphDataSets) === JSON.stringify(this.graphData.data.datasets)
                ) {
                    // same data as before, skip redraw...
                    return
                }

                // append the data for the current chart settings
                let graphOptions = this._setChartOptions()
                graphOptions.data = {
                    datasets: this.graphData.data.datasets
                }
                if (this.graphData.data.labels) {
                    graphOptions.data.labels = this.graphData.data.labels
                }

                // Chart declaration
                if (this.ctx && graphOptions.data && graphOptions.options) {
                    if (doUpdate && this.chart && this.chart.data) {
                        // redraw the chart with the current options
                        // and updated data series
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
                        // set the chart options
                        if (this.chart_ready === false && this.ChartControl.register) {
                            // create and draw the new chart with the current settings
                            // and the dataseries. Register all plugins
                            if (this.graphData.config.gradient) {
                                this.ChartControl.register(gradient)
                            }
                            if (
                                this.ChartControl &&
                                this.chartconfig &&
                                this.chartconfig.options &&
                                this.chartconfig.options.chartArea &&
                                this.chartconfig.options.chartArea.backgroundColor !== ""
                            ) {
                                this.ChartControl.register({
                                    id: "chardbackground",
                                    beforeDraw: function (chart) {
                                        if (chart.config.options.chartArea && chart.config.options.chartArea.backgroundColor) {
                                            const chartArea = chart.chartArea
                                            const ctx = chart.ctx
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
                        }

                        // just for developer
                        // console.log(this.chart_type, graphOptions)
                        // if (this.card_config.testcase) this.sendJSON(this.card_config.testcase, graphOptions)

                        if (this.chart) {
                            // be shure that no chart exits before create..
                            this.chart.destroy()
                            this.chart = null
                        }

                        if (this.DEBUGMODE) {
                            console.log(graphOptions)
                        }

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
                console.error("Missing settings or data", graphOptions)
            }
        } catch (err) {
            console.error("Render Graph Error on ", this.chart_type, ": ", err, err.message)
        }
    }
}
