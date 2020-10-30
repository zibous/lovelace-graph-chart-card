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

// randomColor({luminosity: 'light',count: 27});
const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);

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
		// chart default settings
		let options = {
			type: this.chart_type,
			responsive: true,
			maintainAspectRatio: false,
			animation: { duration: 0 },
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
				animation: null,
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
			plugins: {
				autocolors: {
					useAutoColors: true,
					enabled: this.themeSettings.useAutoColors,
					mode: "data",
				},
			},
		};

		if (this.themeSettings.showGridLines) {
			Chart.defaults.set("scale", {
				gridLines: {
					display: true,
					color: this.themeSettings.gridlineColor,
					lineWidth: 0.365,
					drawBorder: true,
				},
				ticks: {
					maxTicksLimit: 12,
				},
			});
		} else {
			Chart.defaults.set("scale", {
				gridLines: {
					display: false,
				},
				ticks: {
					maxTicksLimit: 8,
				},
			});
		}
		// check secondary axis
		if (
			this.themeSettings.secondaryAxis &&
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
				}
				if (dataset.xAxisID) {
					// TODO: if needed
				}
			});
			if (_scaleOptions) {
				options.scales = _scaleOptions;
			}
		}

		switch (this.chart_type.toLowerCase()) {
			case "radar":
				Chart.defaults.set("radar.scales.r", {
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
						lineWidth: 0.333,
					},
				});
				break;
			case "polararea":
				Chart.defaults.set("polarArea.scales.r", {
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
						lineWidth: 0.245,
					},
				});
				Chart.defaults.set("scale", {
					gridLines: {
						display: true,
					},
				});
				break;
			case "scatter":
			case "line":
			case "bar":
				break;
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
					if (autocolors) Chart.register(autocolors);
					if (gradient) Chart.register(gradient);
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
					// var canvs = document.getElementById(this.canvasId);
					// console.log(this.canvasId, canvs);
					// if(canvs){
					// 	canvs.addEventListener("mousemove", function (event) {
					// 		console.log(
					// 			"mousemove: " +
					// 				event.clientX +
					// 				"/" +
					// 				event.clientY +
					// 				" buttons: " +
					// 				event.buttons
					// 		);
					// 	});
					// }

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
