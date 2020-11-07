/** ----------------------------------------------------------
 
	Lovelaces chartjs
  	(c) 2020 Peter Siebler
  	Released under the MIT license
 
 * ----------------------------------------------------------*/

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
				acc = { ...acc, [key]: value };
			}
		}
	}
	return acc;
}

/**
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
		this.chart_update = false; // boolean for update the chart
		this.chart_ready = false; // boolean chart allready exits
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
					const percentage = parseFloat(
						((currentValue / meta.total) * 100).toFixed(1)
					);
					suffix += " (" + percentage + "%)";
				}
				return (
					" " +
					datasetLabel +
					": " +
					dataset.data[tooltipItem.index].toLocaleString() +
					" " +
					suffix
				);
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
				return (
					" " +
					datasetLabel +
					": " +
					dataset.data[tooltipItem.index].toLocaleString() +
					" " +
					suffix
				);
		}
	}

	/**
	 * set the chart option based on the default
	 * and the chart settings.
	 *
	 * @called: from rendergraph and updategraph
	 */
	_setChartOptions() {
		const _chartGridLineWidth = 0.165;

		// global default settings
		Chart.defaults.responsive = true;
		Chart.defaults.maintainAspectRatio = false;
		Chart.defaults.animation = false;
		Chart.defaults.locale = this.chart_locale;

		// If false, NaN data causes a break in the line.
		// Chart.defaults.controllers.line.spanGaps = true;
		// Chart.defaults.controllers.radar.spanGaps = true;

		Chart.defaults.defaultFontColor = this.themeSettings.fontColor;
		Chart.defaults.defaultFontFamily = this.themeSettings.fontFamily;

		Chart.defaults.scale.gridLines.lineWidth = _chartGridLineWidth;

		// element settings
		if (Chart.defaults.elements && Chart.defaults.elements.arc)
			Chart.defaults.elements.arc.borderWidth = 0;

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
				color: this.themeSettings.fontColor,
				family: this.themeSettings.fontFamily,
				size: 12,
				style: "normal",
				lineHeight: 1.2,
				lineWidth: 0,
			},
			title: {
				display: this.chartconfig.title != "",
				text: "",
				font: {
					style: "normal",
					color: this.themeSettings.fontColor,
				},
			},
			layout: { padding: { left: 16, right: 16, top: 0, bottom: 20 } },
			chartArea: { backgroundColor: "transparent" },
			legend: {
				display: this.themeSettings.showLegend || false,
				position: "bottom",
				lineWidth: 0,
				labels: {
					usePointStyle: true,
					boxWidth: 8,
				},
			},
			tooltips: {
				enabled: true,
				mode: "nearest",
				position: "nearest",
				backgroundColor: this.themeSettings.tooltipsBackground,
				titleFont: {
					style: "normal",
					color: this.themeSettings.tooltipsFontColor,
				},
				bodyFont: {
					style: "normal",
					color: this.themeSettings.tooltipsFontColor,
				},
				footerFont: {
					style: "normal",
					color: this.themeSettings.tooltipsFontColor,
				},
				animation: false,
			},
			hover: {
				mode: "nearest",
				intersect: true,
			},
			elements: {
				point: {
					radius: 0.33,
					hitRadius: 8.0,
				},
			},
			spanGaps: true,
			plugins: {},
		};

		if (gradient && this.graphData.config.gradient) {
			options.plugins = {
				gradient,
			};
		}
		if (this.themeSettings.showGridLines) {
			Chart.defaults.set("scale", {
				gridLines: {
					display: true,
					color: this.themeSettings.gridlineColor,
					drawBorder: true,
				},
			});
		} else {
			Chart.defaults.set("scale", {
				gridLines: {
					display: false,
				},
			});
		}
		// ------------------------------------
		// check secondary axis
		// ------------------------------------
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
					_scaleOptions[dataset.yAxisID].borderDash = [8, 4];
				}
				if (dataset.xAxisID) {
					_scaleOptions[dataset.xAxisID] = {};
					_scaleOptions[dataset.xAxisID].id = dataset.xAxisID;
					_scaleOptions[dataset.xAxisID].type = "linear";
					_scaleOptions[dataset.xAxisID].position = dataset.xAxisID;
					_scaleOptions[dataset.xAxisID].display = true;
					_scaleOptions[dataset.xAxisID].borderDash = [8, 4];
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
						backdropColor: "transparent",
					},
					angleLines: {
						display: true,
						color: this.themeSettings.gridlineColor,
						lineWidth: 0.3333,
					},
					gridLines: {
						circular: true,
					},
				});
				Chart.defaults.set("scale", {
					gridLines: {
						display: true,
						lineWidth: _chartGridLineWidth * 2,
					},
				});
				break;
			case "polararea":
				Chart.defaults.set("controllers.polarArea.scales.r", {
					ticks: {
						backdropColor: "transparent",
					},
					angleLines: {
						display: true,
						color: this.themeSettings.gridlineColor,
						lineWidth: _chartGridLineWidth * 2,
					},
					gridLines: {
						circular: true,
						lineWidth: _chartGridLineWidth * 1.6,
					},
				});
				Chart.defaults.set("scale", {
					gridLines: {
						display: true,
					},
				});
				break;
			case "bubble":
				let labelX = this.card_config.entities[0].name;
				labelX += this.card_config.entities[0].unit
					? " (" + this.card_config.entities[0].unit + ")"
					: "";
				let labelY = this.card_config.entities[1].name;
				labelY += this.card_config.entities[1].unit
					? " (" + this.card_config.entities[1].unit + ")"
					: "";
				options.scales = {
					x: {
						id: "x",
						scaleLabel: {
							display: true,
							labelString: labelX,
						},
					},
					y: {
						id: "y",
						scaleLabel: {
							display: true,
							labelString: labelY,
						},
					},
				};
				options.elements = {
					point: {
					  radius: (context) => {
						const value = context.dataset.data[context.dataIndex];
						return value._r * .5;
					  }
					}
				};
				break;
			case "scatter":
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
				datasets: [],
			},
			options: {},
		};

		// merge default with chart config options
		if (this.chartconfig.options) {
			this.chartCurrentConfig.options = deepMerge(
				options,
				this.chartconfig.options
			);
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
			// check if chart exits
			if (this.chart && !doUpdate) {
				doUpdate = true;
			}

			// set the chart options
			this._setChartOptions();

			// append the data for the current chart settings
			this.chartCurrentConfig.data = {
				labels: this.graphData.data.labels,
				datasets: this.graphData.data.datasets,
			};

			// Chart declaration
			if (
				this.ctx &&
				this.chartCurrentConfig.data &&
				this.chartCurrentConfig.options
			) {
				if (doUpdate || this.chart_update) {
					this.chart.update({ duration: 0, easing: "linear" });
					this.chart_update = true;
				} else {
					// -----------------------------------------
					// all used plugins
					// -----------------------------------------
					if (gradient && this.graphData.config.gradient)
						Chart.register(gradient);
					// chart background
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
									ctx.fillStyle =
										chart.config.options.chartArea.backgroundColor;
									ctx.fillRect(
										chartArea.left,
										chartArea.top,
										chartArea.right - chartArea.left,
										chartArea.bottom - chartArea.top
									);
									ctx.restore();
								}
							},
						});
					}
					// ------------------------------------------------------
					// register new chart
					// ------------------------------------------------------
					this.chart = new Chart(this.ctx, this.chartCurrentConfig);
					if (this.chart) {
						this.chart_ready = true;
						this.chart_update = true;
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
				this.chartCurrentConfig
			);
		}
	}
}
