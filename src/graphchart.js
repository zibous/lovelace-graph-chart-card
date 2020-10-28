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
		this.ctx = config.ctx || null; // the chart canvas element
		this.chart = null; // current chart
		this.chart_locale = config.locale || "de-DE"; // the locale for number(s) and date(s)
		this.chart_type = config.chart_type || "bar"; // the chart type
		this.themeSettings = config.themeSettings || {}; // the theme settings (dark or light)
		this.chartconfig = config.chartconfig || {}; // the chart config from the template
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
		// global default settings for Chart.js vv3.0.0-beta.4
		// Chart.defaults.font.color = this.themeSettings.fontColor;
		// Chart.defaults.font.family = this.themeSettings.fontFamily;
		// Chart.defaults.showGridLines = this.themeSettings.showGridLines;
		// Chart.defaults.elements.line.tension = 0.4;

		// chart default settings
		let options = {
			charttype: this.chart_type,
			responsive: true,
			maintainAspectRatio: false,
			animation: { duration: 0 },
			units: this.data_units || "",
			title: { display: false, fontStyle: "normal", text: "", fontSize: 18 },
			layout: { padding: { left: 8, right: 8, top: 0, bottom: 20 } },
			chartArea: { backgroundColor: "transparent" },
			legend: {
				display: this.themeSettings.showLegend || false,
				position: "bottom",
				lineWidth: 0,
			},
			tooltips: {
				enabled: true,
				mode: "nearest",
				position: "nearest",
				//backgroundColor: this.themeSettings.tooltipsBackground,
				//titleFontColor: this.themeSettings.tooltipsFontColor,
				//bodyFontColor: this.themeSettings.tooltipsFontColor,
			},
			hover: {
				mode: "nearest",
				intersect: true,
			},
			elements: {
				point: {
					radius: 0.2,
					hitRadius: 8,
				},
			},
			plugins: {
				autocolors: {
					useAutoColors: true,
					enabled: this.themeSettings.useAutoColors,
					mode: "data",
				},
			},
		};

		switch (this.chart_type.toLowerCase()) {
			case "radar":
				if (CHARTJSv3) {
					Chart.defaults.set("radar.scales.r.ticks", {
						backdropColor: "transparent",
					});
				}
				break;
			case "polararea":
				if (CHARTJSv3) {
					Chart.defaults.set("polarArea.scales.r.ticks", {
						backdropColor: "transparent",
					});
				}
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

		// merge default with chart config options
		if (this.chartconfig.options) {
			this.chartconfig.options = deepMerge(options, this.chartconfig.options);
		} else {
			this.chartconfig.options = options;
		}
	}

	/**
	 * render the graph based on the settings and datasets.
	 * @example:
	 *    this.graphChart.graphData = this.graphData
	 *    this.graphChart.renderGraph()
	 */
	renderGraph() {
		try {
			if (this.chart && this.chart_ready) {
				// allread present, so we can update
				this.updateGraph();
				return;
			}

			// set the chart options
			this._setChartOptions();

			// set the data for the current chart
			this.chartconfig.data = {
				labels: this.graphData.data.labels,
				datasets: this.graphData.data.datasets,
			};

			// Chart declaration
			if (
				this.ctx &&
				this.chartconfig.data.datasets &&
				this.chartconfig.options
			) {
				if (CHARTJSv3) {
					if (autocolors) Chart.register(autocolors);
					if (gradient) Chart.register(gradient);
				}
				this.chart = new Chart(this.ctx, this.chartconfig);
				if (this.chart) {
					this.chart_ready = true;
				}
			}
		} catch (err) {
			console.error(
				"Render Graph Error on ",
				this.chart_type,
				": ",
				err,
				this.chartconfig.options
			);
		}
	}

	/**
	 * calls the chart update and render all new data.
	 * * @example:
	 *    this.graphChart.graphData = this.graphData
	 *    this.graphChart.updateGraph()
	 */
	updateGraph() {
		try {
			if (this.chart && this.ctx && this.chart_ready) {
				// set the new data
				this.chartconfig.data = {
					charttype: this.chart_type,
					unit: this.data_units,
					labels: this.graphData.data.labels,
					datasets: this.graphData.data.datasets,
				};

				// get the current settings
				this.chart.options = this.chartconfig.options;
				this.chart.data = this.chartconfig.data;

				// update the chart
				this.chart.update({ duration: 0, easing: "linear" });
				this.chart_update = true;
			}
		} catch (err) {
			console.error("Update Graph", err.message, this.chartconfig.options);
		}
	}
}
