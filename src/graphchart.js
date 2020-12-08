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
        this.loader = config.loader; // the loading animation
        this.graphData = {}; // the graph data
        this.setting = config.setting;
        this.chart_ready = false; // boolean chart allready exits
        this.lastUpdate = null;
        this.ChartControl = Chart;
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
     * chart global settings
     */
    _setChartDefaults() {
        // global default settings
        try {
            if (this.ChartControl && this.ChartControl.defaults) {
                this.ChartControl.defaults.responsive = true;
                this.ChartControl.defaults.maintainAspectRatio = false;
                this.ChartControl.defaults.animation = false;
                this.ChartControl.defaults.locale = this.chart_locale;

                // global font settings
                if (
                    this.ChartControl.defaults &&
                    this.ChartControl.defaults.font &&
                    this.ChartControl.defaults.font.family
                ) {
                    this.ChartControl.defaults.font.family = this.themeSettings.fontFamily;
                }
                if (this.ChartControl.defaults && this.ChartControl.defaults.color) {
                    this.ChartControl.defaults.color = this.themeSettings.fontColor;
                    // new beta 7 !
                    this.ChartControl.defaults.plugins.legend.labels.color = this.themeSettings.fontColor;
                }

                // new beta 7 !
                this.ChartControl.defaults.plugins.legend.position = "bottom";
                this.ChartControl.defaults.plugins.legend.labels.usePointStyle = true;
                this.ChartControl.defaults.plugins.legend.labels.boxWidth = 8;

                // Tooltips new beta 7 !
                this.ChartControl.defaults.plugins.tooltip.enabled = true;
                this.ChartControl.defaults.plugins.tooltip.backgroundColor = this.themeSettings.tooltipsBackground;
                this.ChartControl.defaults.plugins.tooltip.titleColor = this.themeSettings.tooltipsFontColor;
                this.ChartControl.defaults.plugins.tooltip.bodyColor = this.themeSettings.tooltipsFontColor;
                this.ChartControl.defaults.plugins.tooltip.footerColor = this.themeSettings.tooltipsFontColor;

                // gridlines
                if (this.themeSettings && this.themeSettings.showGridLines) {
                    this.ChartControl.defaults.scale.gridLines.lineWidth = this.themeSettings.gridLineWidth;
                    if (this.ChartControl.defaults.set) {
                        this.ChartControl.defaults.set("scale", {
                            gridLines: {
                                display: true,
                                color: this.themeSettings.gridlineColor,
                                drawBorder: true,
                                borderDash: this.themeSettings.borderDash,
                                zeroLineWidth: 8
                            }
                        });
                    }
                }

                // element settings
                if (this.ChartControl.defaults.elements && this.ChartControl.defaults.elements.arc)
                    this.ChartControl.defaults.elements.arc.borderWidth = 0;
                if (this.ChartControl.defaults.elements && this.ChartControl.defaults.elements.line) {
                    this.ChartControl.defaults.elements.line.fill = false;
                    this.ChartControl.defaults.elements.line.tension = 0;
                }
                if (this.ChartControl.defaults.elements && this.ChartControl.defaults.elements.point) {
                    this.ChartControl.defaults.elements.point.radius = 0;
                    this.ChartControl.defaults.elements.point.borderWidth = 0;
                    this.ChartControl.defaults.elements.point.hoverRadius = 8;
                }

                // chart type based
                if (this.ChartControl.defaults.set) {
                    switch (this.chart_type.toLowerCase()) {
                        case "radar":
                            this.ChartControl.defaults.set("controllers.radar.scales.r", {
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
                            this.ChartControl.defaults.set("scale", {
                                gridLines: {
                                    display: true,
                                    lineWidth: this.themeSettings.gridLineWidth * 2,
                                    borderDash: [0]
                                }
                            });
                            this.ChartControl.defaults.elements.point.hoverRadius = 8;
                            this.ChartControl.defaults.elements.point.pointRadius = 8;
                            break;

                        case "polararea":
                            this.ChartControl.defaults.set("controllers.polarArea.scales.r", {
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
                            this.ChartControl.defaults.set("scale", {
                                gridLines: {
                                    display: true
                                }
                            });
                            break;
                        case "scatter":
                        case "bubble":
                        case "line":
                        case "bar":
                        case "pie":
                        case "doughnut":
                        default:
                            break;
                    }
                }
            }
        } catch (err) {
            console.error(
                "Error Set Chart defaults for",
                this.chart_type,
                ": ",
                err,
                this.chartCurrentConfig,
                err,
                err.message
            );
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
        // chart global settings
        this._setChartDefaults();
        const _loader = this.loader;
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
            layout: {
                padding: {
                    left: 24,
                    right: 24,
                    top: 0,
                    bottom: 24
                }
            },
            chartArea: {
                backgroundColor: "transparent"
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
            plugins: {
                tooltip: {
                    // enabled: true,
                    // mode: "nearest",
                    // position: "nearest",
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
                legend: {
                    display: this.themeSettings.showLegend || false,
                    position: "bottom",
                    lineWidth: 0,
                    labels: {
                        usePointStyle: true,
                        boxWidth: 8
                    }
                },
                scales: {}
            },
            animation: {
                onComplete: function () {
                    if (_loader) _loader.style.display = "none";
                }
            }
        };

        if (this.graphData.config.gradient === true && this.graphData.config.mode === "simple") {
            //enable gradient colors for state charts
            options.gradientcolor = {
                color: true,
                type: this.chart_type
            };
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
        // set the axis label based on the data settings
        if (this.chart_type.toLowerCase() === "bubble") {
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
            // scale bubble (optional)
            options.elements = {
                point: {
                    radius: (context) => {
                        const value = context.dataset.data[context.dataIndex];
                        return value._r * 0.5;
                    }
                }
            };
        }

        // case barchart segment
        if (this.graphData.config.segmentbar === true) {
            options.scales = {
                x: {
                    id: "x",
                    stacked: true
                },
                y: {
                    id: "y",
                    stacked: true
                }
            };
            options.plugins.tooltip.callbacks = {
                label: (chart) => {
                    if (chart.dataset.tooltip === false || !chart.dataset.label) {
                        return null;
                    }
                    return chart.formattedValue + " " + chart.dataset.unit || "";
                }
            };
        }

        this.chartCurrentConfig = {
            type: this.chart_type,
            data: {
                labels: [],
                datasets: []
            },
            options: {}
        };

        // ---------------------------------------
        // merge default with chart config options
        // this.chartconfig.options see yaml config
        // - chart
        //   - options:
        // ---------------------------------------
        if (this.chartconfig.options) {
            //this.chartCurrentConfig.options = Chart.helpers.merge(options, this.chartconfig.options);
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
                            this.ChartControl.register(gradient);
                        }
                        if (
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
            console.error(
                "Render Graph Error on ",
                this.chart_type,
                ": ",
                err,
                this.chartCurrentConfig,
                err,
                err.message
            );
        }
    }
}
