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
        this.chart = null // current chart
        this.ctx = config.ctx || null // the chart canvas element
        this.canvasId = config.canvasId // canvas container id
        this.card_config = config.card_config // current card settings
        this.entities = config.entities // all entities
        this.chart_locale = config.locale || "de-DE" // the locale for number(s) and date(s)
        this.chart_type = config.chart_type || "bar" // the chart type
        this.themeSettings = config.themeSettings || {} // the theme settings (dark or light)
        this.chartconfig = config.chartconfig || {} // the chart config from the template
        this.loader = config.loader // the loading animation
        this.graphData = {} // the graph data
        this.graphDataSets = [] // current graph settings
        this.setting = config.setting
        this.chart_ready = false // boolean chart allready exits
        this.lastUpdate = null // timestamp last chart update
        this.ChartControl = window.Chart3 || Chart // chart global settings
    }

    /**
     * change the theme settings
     * @param {*} options
     */
    setThemeSettings(options) {
        this.themeSettings = options
        return true
    }

    /**
     * chart global settings
     */
    _setChartDefaults() {
        // global default settings
        if (this.themeSettings.chartdefault === true) return
        this.ChartControl = window.Chart3
        try {
            if (this.ChartControl && this.ChartControl.defaults) {
                // global defailt settings
                this.ChartControl.defaults.responsive = true
                this.ChartControl.defaults.maintainAspectRatio = false
                this.ChartControl.defaults.animation = 0
                this.ChartControl.defaults.locale = this.chart_locale

                // global font settings
                if (
                    this.ChartControl.defaults &&
                    this.ChartControl.defaults.font &&
                    this.ChartControl.defaults.font.family
                ) {
                    this.ChartControl.defaults.font.family = this.themeSettings.fontFamily
                }

                if (this.ChartControl.defaults && this.ChartControl.defaults.color) {
                    this.ChartControl.defaults.color = this.themeSettings.fontColor
                    // new beta 7 !
                    this.ChartControl.defaults.plugins.legend.labels.color = this.themeSettings.fontColor
                }

                if (this.ChartControl.defaults.layout && this.ChartControl.defaults.layout.padding) {
                    this.ChartControl.defaults.layout.padding = {
                        top: 24,
                        left: 0,
                        right: 0,
                        bottom: 0
                    }
                }

                if (this.ChartControl.defaults.plugins && this.ChartControl.defaults.plugins.legend) {
                    this.ChartControl.defaults.plugins.legend.position = "top"
                    this.ChartControl.defaults.plugins.legend.labels.usePointStyle = true
                    this.ChartControl.defaults.plugins.legend.labels.boxWidth = 8
                    this.ChartControl.defaults.plugins.legend.show = false
                }

                if (this.ChartControl.defaults.plugins && this.ChartControl.defaults.plugins.tooltip) {
                    this.ChartControl.defaults.plugins.tooltip.enabled = true
                    this.ChartControl.defaults.plugins.tooltip.backgroundColor = this.themeSettings.tooltipsBackground
                    this.ChartControl.defaults.plugins.tooltip.titleColor = this.themeSettings.tooltipsFontColor
                    this.ChartControl.defaults.plugins.tooltip.bodyColor = this.themeSettings.tooltipsFontColor
                    this.ChartControl.defaults.plugins.tooltip.footerColor = this.themeSettings.tooltipsFontColor
                }

                if (this.themeSettings && this.themeSettings.showGridLines) {
                    if (this.ChartControl.defaults.set) {
                        this.ChartControl.defaults.set("scale", {
                            grid: {
                                display: true,
                                color: this.themeSettings.gridlineColor,
                                drawBorder: true,
                                lineWidth: this.themeSettings.gridLineWidth,
                                borderDash: this.themeSettings.borderDash,
                                zeroLineWidth: 8
                            }
                        })
                    }
                }

                // arc element settings
                if (this.ChartControl.defaults.elements && this.ChartControl.defaults.elements.arc)
                    this.ChartControl.defaults.elements.arc.borderWidth = 0

                // line element
                if (this.ChartControl.defaults.elements && this.ChartControl.defaults.elements.line) {
                    this.ChartControl.defaults.elements.line.fill = false
                    this.ChartControl.defaults.elements.line.tension = 0.225
                }

                if (this.ChartControl.defaults.elements && this.ChartControl.defaults.elements.point) {
                    this.ChartControl.defaults.elements.point.borderWidth = 0
                    this.ChartControl.defaults.elements.point.hoverRadius = 8
                    this.ChartControl.defaults.elements.point.hitRadius = 8
                }

                // chart type based
                if (this.ChartControl.defaults.set) {
                    switch (this.chart_type.toLowerCase()) {
                        case "polararea":
                        case "radar":
                            this.ChartControl.defaults.set("scales.radialLinear", {
                                ticks: {
                                    backdropColor: "transparent"
                                },
                                angleLines: {
                                    display: true,
                                    color: this.themeSettings.gridlineColor,
                                    lineWidth: this.themeSettings.gridLineWidth * 0.95
                                },
                                grid: {
                                    circular: true,
                                    lineWidth: this.themeSettings.gridLineWidth * 1.4,
                                    borderDash: [1, 4]
                                }
                            })
                            break
                        case "scatter":
                        case "bubble":
                            break
                        case "line":
                            break
                        case "bar":
                        case "pie":
                        case "doughnut":
                        default:
                            break
                    }
                }
                this.themeSettings.chartdefault = true
            }
        } catch (err) {
            console.error("Error Set Chart defaults for", this.chart_type, ": ", err, err.message)
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
        // the animated loader
        const _loader = this.loader
        // chart default options
        let _options = {
            units: this.data_units || "",
            layout: {},
            chartArea: {
                backgroundColor: "transparent"
            },
            hover: {
                mode: "nearest",
                intersect: true
            },
            elements: {},
            spanGaps: true,
            plugins: {
                title: {},
                tooltip: {},
                legend: {
                    display: this.themeSettings.showLegend || false
                },
                scales: {}
            },
            animation: {
                onComplete: function () {
                    if (_loader) _loader.style.display = "none"
                }
            },
            onResize: null
        }

        if (this.themeSettings.gradient === true) {
            if (this.graphData.config.gradient === true && this.graphData.config.mode === "simple") {
                //enable gradient colors for state charts
                _options.gradientcolor = {
                    color: true,
                    type: this.chart_type
                }
            }
            if (this.graphData.config.gradient) {
                // enable gradient colors for data series chart
                _options.plugins = {
                    gradient
                }
            }
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
            let _scaleOptions = {}
            this.graphData.data.datasets.forEach((dataset) => {
                if (dataset.yAxisID) {
                    _scaleOptions[dataset.yAxisID] = {}
                    _scaleOptions[dataset.yAxisID].id = dataset.yAxisID
                    _scaleOptions[dataset.yAxisID].type = "linear"
                    _scaleOptions[dataset.yAxisID].position = dataset.yAxisID
                    _scaleOptions[dataset.yAxisID].display = true
                    if (dataset.yAxisID.toLowerCase() == "right") {
                        _scaleOptions[dataset.yAxisID].gridLines = {
                            borderDash: [2, 5],
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
                        _scaleOptions[dataset.xAxisID].gridLines = {
                            borderDash: [2, 5],
                            drawOnChartArea: false
                        }
                    }
                }
            })
            if (_scaleOptions) {
                _options.scales = _scaleOptions
            }
        }
        // set the axis label based on the data settings
        if (this.chart_type.toLowerCase() === "bubble") {
            let labelX = this.entities[0].name
            labelX += this.entities[0].unit ? " (" + this.entities[0].unit + ")" : ""
            let labelY = this.entities[1].name
            labelY += this.entities[1].unit ? " (" + this.entities[1].unit + ")" : ""
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
            // _options.elements = {
            //     point: {
            //         radius: (context) => {
            //             const value = context.dataset.data[context.dataIndex];
            //             return value._r * 0.5;
            //         }
            //     }
            // };
        }

        // case barchart segment
        // TODO: better use a plugin for this feature.
        // set bar as stacked, hide the legend for the segmentbar,
        // hide the tooltip item for the segmentbar.
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
            _options.plugins.tooltip.callbacks = {
                label: (chart) => {
                    if (chart.dataset.tooltip === false || !chart.dataset.label) {
                        return null
                    }
                    return chart.formattedValue + " " + chart.dataset.unit || ""
                }
            }
        }
        if (this.chart_type.toLowerCase() === "bubble") {
            _options.plugins.legend = {
                display: false
            }
        }
        // preset cart current config
        let chartCurrentConfig = {
            type: this.chart_type,
            data: {
                labels: [],
                datasets: []
            },
            options: _options
        }

        // chart global settings
        this._setChartDefaults()

        // ---------------------------------------
        // merge default with chart config options
        // this.chartconfig.options see yaml config
        // - chart
        //   - options:
        // ---------------------------------------
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
                console.log("sendJson", this.responseText)
            }
        }

        // Converting JSON data to string
        var data = JSON.stringify(chartdata)
        console.log(data)

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
                    labels: this.graphData.data.labels,
                    datasets: this.graphData.data.datasets
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
                    } else {
                        // set the chart options
                        if (this.chart_ready === false && this.ChartControl.register) {
                            // create and draw the new chart with the current settings
                            // and the dataseries. Register all plugins
                            if (this.graphData.config.gradient && this.themeSettings.gradient === true) {
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
                                        if (
                                            chart.config.options.chartArea &&
                                            chart.config.options.chartArea.backgroundColor
                                        ) {
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
                        // if (this.card_config.testcase) this.sendJSON(this.card_config.testcase, graphOptions)

                        if (this.chart) {
                            // be shure that no chart exits before create..
                            this.chart.destroy()
                            this.chart = null
                        }
                        this.chart = new window.Chart3(this.ctx, graphOptions)
                        this.graphDataSets = this.graphData.data.datasets

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
