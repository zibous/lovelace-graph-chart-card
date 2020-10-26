/*
 * Lovelaces chartjs
 * (c) 2020 Peter Siebler
 * Released under the MIT license
 *
 */

import Chart from "chart.js";
import "chartjs-plugin-colorschemes";
import ColorSchemesPlugin from "chartjs-plugin-colorschemes";

// import "chartjs-plugin-style";
// chartjs-plugin-gradient
// This plugin requires Chart.js 3.0.0 or later. Could work with v2, but it is not supported.
// import gradient from 'chartjs-plugin-gradient';

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
	 *		chart_colorschemes: this.chart_colorschemes,
	 *		chart_styles: this.chart_styles,
	 *		themeSettings: this.themeSettings,
	 *		chartconfig: this.chartconfig,
	 *	}
	 *	// init the graph chart
	 *	this.graphChart = new graphChart(settings);
	 */
	constructor(config) {
		this.ctx = config.ctx || null;
		this.chart_locale = config.locale || "de-DE";
		this.chart_type = config.chart_type || "bar";
		this.chart_colorschemes = config.chart_colorschemes;
		this.themeSettings = config.themeSettings || {};
		this.chartconfig = config.chartconfig || {};
		this.chart_styles = config.chart_styles || { dark: true };
		this.graphData = {};
		this.chart_ready = false;
	}

	/**
	 * default chart settings
	 * get the font and colorsettings from the hass view.
	 * optional the settings can be overwritten by the
	 * card definition "card_theme"
	 */
	_getChartThemeSettings() {
		if (!this.themeSettings) {
			this.themeSettings = {
				fontColor: "#333333",
				fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
				gridlineColor: "#DCDCDC",
				zeroLineColor: "#555555",
				tooltipsBackground: "#ecf0f1",
				tooltipsFontColor: "#647687",
			};
		}
	}

	/**
	 * build the options for the current graph
	 * Test, how to work ??
	 */
	_chartDefaultOptions() {
		// callbacks: this._chartTooltips.bind(this),
		const options = {
			charttype: this.chart_type,
			responsive: true,
			maintainAspectRatio: false,
			responsiveAnimationDuration: 0,
			defaultFontColor: this.themeSettings.fontColor,
			defaultFontFamily: this.themeSettings.fontFamily,
			units: this.data_units || "",
			animation: {
				duration: 0,
			},
			title: {
				text: "",
				display: false,
			},
			hover: {
				animationDuration: 0,
				mode: "nearest",
				interselect: true,
			},
			tooltips: {
				enabled: true,
				mode: "nearest",
				position: "nearest",
			},
			layout: {
				padding: {
					left: 18,
					right: 18,
					top: 0,
					bottom: 24,
				},
			},
			legend: {
				display: this.themeSettings.showLegend || false,
				position: "bottom",
				lineWidth: 0,
			},
			line: {
				spanGaps: true,
			},
			chartArea: {
				backgroundColor: "transparent",
			},
			elements: {
				font: this.themeSettings.fontFamily,
				responsive: true,
				maintainAspectRatio: false,
				point: {
					radius: 0.2,
					hitRadius: 8.0,
				},
			},
			// ticks: {
			// 	fontFamily: this.themeSettings.fontFamily,
			// 	autoSkip: true,
			// },
			scales: {
				yAxes: [
					{
						display: this.themeSettings.showGridLines || false,
						stacked: false,
						position: "left",
						ticks: {
							autoSkip: true,
							maxTicksLimit: 8,
						},
						// scaleLabel: {
						// 	display: this.themeSettings.showGridLines || false,
						// 	labelString: "",
						// },
						gridLines: {
							display: this.themeSettings.showGridLines || false,
							color: this.themeSettings.gridlineColor,
							lineWidth: 0.33,
							zeroLineWidth: 0.55,
							zeroLineColor: this.themeSettings.zeroLineColor,
						},
					},
				],
				xAxes: [
					{
						display: this.themeSettings.showGridLines || false,
						stacked: false,
						position: "left",
						ticks: {
							autoSkip: true,
							maxTicksLimit: 8,
						},
						// scaleLabel: {
						// 	display: this.themeSettings.showGridLines || false,
						// 	labelString: "",
						// },
						gridLines: {
							display: this.themeSettings.showLegend || false,
							color: this.themeSettings.gridlineColor,
							lineWidth: 0.33,
							zeroLineWidth: 0.55,
							zeroLineColor: this.themeSettings.zeroLineColor,
						},
					},
				],
			},
			plugins: {},
		};
		if (this.chartconfig.options) {
			this.chartconfig.options = deepMerge(options, this.chartconfig.options);
		} else {
			this.chartconfig.options = options;
		}
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
	 * Chart Global Configuration
	 * This way you can be as specific as you would like in your individual chart configuration,
	 * while still changing the defaults for all chart types where applicable.
	 * The global general options are defined in _defaults.global
	 *
	 * Options may be configured directly on the dataset. The dataset options can be
	 * changed at 3 different levels and are evaluated with the following priority:
	 *
	 *   per dataset: dataset.*
	 *   per chart: options.datasets[type].*
	 *   or globally: _defaults.global.datasets[type].*
	 *
	 * where type corresponds to the dataset type.
	 *
	 */
	_setChartDefaultGlobals() {
		const cd = Chart.defaults;
		try {
			this._getChartThemeSettings();

			// this._chartDefaultOptions();
			// return;

			cd.global.defaultFontColor = this.themeSettings.fontColor;
			cd.global.defaultFontFamily = this.themeSettings.fontFamily;

			// chart view scale
			cd.global.elements.responsive = true;
			cd.global.elements.maintainAspectRatio = false;
			cd.global.responsive = true;
			cd.global.maintainAspectRatio = false;

			cd.global.chartArea = {
				backgroundColor: "transparent",
			};

			// layout
			cd.global.layout.padding = {
				left: 18,
				right: 18,
				top: 0,
				bottom: 24,
			};

			// all for tooltips
			cd.global.tooltips.backgroundColor = this.themeSettings.tooltipsBackground;
			cd.global.tooltips.titleFontColor = this.themeSettings.tooltipsFontColor;
			cd.global.tooltips.titleFontSize = 14;
			cd.global.tooltips.titleSpacing = 1;
			cd.global.tooltips.titleMarginBottom = 10;
			cd.global.tooltips.bodyFontColor = this.themeSettings.tooltipsFontColor;
			cd.global.tooltips.bodyFontSize = 12;
			cd.global.tooltips.bodySpacing = 1;
			cd.global.tooltips.xPadding = 10;
			cd.global.tooltips.yPadding = 10;
			cd.global.tooltips.cornerRadius = 3;
			cd.global.tooltips.enabled = true;

			// Interaction Modes
			cd.global.hover.mode = "nearest";
			cd.global.hover.intersect = true;
			cd.global.tooltips.mode = "nearest";
			cd.global.tooltips.position = "nearest";

			// for bar, line, radar ..
			cd.global.tooltips.callbacks.label = function (tooltipItem, data) {
				let dataset = data.datasets[tooltipItem.datasetIndex];
				let datasetLabel = dataset.label ? dataset.label + ": " : "";
				datasetLabel += data.labels[tooltipItem.index] || "";
				let suffix = dataset.unit || "";
				return (
					" " +
					datasetLabel +
					": " +
					dataset.data[tooltipItem.index].toLocaleString() +
					" " +
					suffix
				);
			};

			// You should be able to override the defaults for the other chart
			// types with something like the following. You would need to override it for the
			// 'bubble', 'doughnut', 'pie', 'polarArea', and 'scatter' chart types.
			if (this.chart_type.toLowerCase() === "doughnut") {
				cd.doughnut.tooltips.callbacks.label = function (tooltipItem, data) {
					let dataset = data.datasets[tooltipItem.datasetIndex];
					let meta = dataset._meta[Object.keys(dataset._meta)[0]];
					let currentValue = dataset.data[tooltipItem.index];
					let datasetLabel = data.labels[tooltipItem.index] || "";
					let suffix = dataset.unit || "";
					if (meta.total) {
						let percentage = parseFloat(
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
				};
			}

			if (this.chart_type.toLowerCase() === "pie") {
				cd.pie.tooltips.callbacks.label = function (tooltipItem, data) {
					let dataset = data.datasets[tooltipItem.datasetIndex];
					let meta = dataset._meta[Object.keys(dataset._meta)[0]];
					let currentValue = dataset.data[tooltipItem.index];
					let datasetLabel = data.labels[tooltipItem.index] || "";
					let suffix = dataset.unit || "";
					if (meta.total) {
						let percentage = parseFloat(
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
				};
			}

			if (this.chart_type.toLowerCase() === "scatter") {
				cd.scatter.tooltips.callbacks.label = function (tooltipItem, data) {
					let dataset = data.datasets[tooltipItem.index];
					let datasetLabel = data.labels[tooltipItem.index] || "";
					let suffix = dataset.unit || "";
					return (
						" " +
						datasetLabel +
						": " +
						dataset.data[tooltipItem.index].toLocaleString() +
						" " +
						suffix
					);
				};
			}

			if (this.chart_type.toLowerCase() === "polararea") {
				cd.polarArea.tooltips.callbacks.label = function (tooltipItem, data) {
					let dataset = data.datasets[tooltipItem.datasetIndex];
					let datasetLabel = data.labels[tooltipItem.index] || "";
					let suffix = dataset && dataset.unit ? dataset.unit : "";
					return (
						" " +
						datasetLabel +
						": " +
						dataset.data[tooltipItem.index].toLocaleString() +
						" " +
						suffix
					);
				};
			}

			if (this.chart_type == "radar") {
				// cd.ticks.backdropColor = 'red'
				cd.radar.scale.gridLines = {
					display: true,
					color: this.themeSettings.gridlineColor,
				};
			}

			cd.global.elements.point.radius = 0.2;
			cd.global.elements.point.hitRadius = 8;

			cd.scale.gridLines.color = this.themeSettings.gridlineColor;
			cd.scale.gridLines.lineWidth = 0.33;

			cd.scale.gridLines.zeroLineWidth = 0.5;
			cd.scale.gridLines.zeroLineColor = this.themeSettings.zeroLineColor;

			cd.global.legend.display = false;

			if (["pie", "doughnut", "polarArea", "line"].includes(this.chart_type)) {
				cd.global.legend.display = true;
				cd.global.legend.position =
					this.chart_type === "line" ? "top" : "bottom";
			}

			// scale ticks format...
			Chart.scaleService.updateScaleDefaults("linear", {
				ticks: {
					callback: function (tick) {
						return "" + tick.toLocaleString();
					},
				},
			});

			// plugin colorschemes
			if (this.chart_colorschemes)
				cd.global.plugins.colorschemes.scheme = this.chart_colorschemes;

			// plugin chardbackground
			if (
				this.chartconfig &&
				this.chartconfig.options &&
				this.chartconfig.options.chartArea &&
				this.chartconfig.options.chartArea.backgroundColor !== ""
			) {
				Chart.pluginService.register({
					id: "chardbackground",
					beforeDraw: function (chart, easing) {
						if (
							chart.config.options.chartArea &&
							chart.config.options.chartArea.backgroundColor
						) {
							let ctx = chart.chart.ctx;
							let chartArea = chart.chartArea;
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
					},
				});
			}
		} catch (err) {
			console.error(
				"Set Chart DefaultGlobals Error:",
				this.chart_type,
				": ",
				err
			);
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
			this.chartconfig.data = {
				charttype: this.chart_type,
				unit: this.data_units,
				labels: this.graphData.data.labels,
				datasets: this.graphData.data.datasets,
			};
			// Chart declaration
			if (
				this.ctx &&
				this.chartconfig.data.datasets &&
				this.chartconfig.options
			) {
				this._setChartDefaultGlobals();
				this.chart = new Chart(this.ctx, this.chartconfig);
			}
		} catch (err) {
			console.log(this.chartconfig.options);
			console.error("Render Graph Error on", this.chart_type, ": ", err);
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
			if (this.chart && this.ctx) {
				this.chartconfig.data = {
					charttype: this.chart_type,
					unit: this.data_units,
					labels: this.graphData.data.labels,
					datasets: this.graphData.data.datasets,
				};
				this.chart.update({ duration: 0, easing: "linear" });
			}
		} catch (err) {
			console.log(this.chartconfig.options);
			console.error("Update Graph", err.message);
		}
	}
}

export { graphChart };
