/**
 * License: MIT
 * Generated on 2020
 * Author: Peter siebler
 */

/** ----------------------------------------------------------

  	chart data builder
  
  	TODO: this is not final, try to find a optimized methode
  
 * ----------------------------------------------------------*/
const DEFAULT_COLORS = [
	"#c6e2ff",
	"#a8acf7",
	"#95f4ad",
	"#def785",
	"#bae0ff",
	"#8d99f4",
	"#92f4a8",
	"#80e9f7",
	"#ffed8c",
	"#e5c7fc",
	"#ffa5a0",
	"#9779f2",
	"#95f99a",
	"#75f4e5",
	"#fffdb2",
	"#f1bdfc",
	"#f690f9",
	"#f99fde",
	"#f4ea8d",
	"#fce5b3",
	"#ccffb2",
	"#9bf7a3",
	"#9cb9fc",
	"#8ffcb2",
	"#afffce",
	"#fca9ee",
	"#efccff",
	"#c5ff84",
	"#f7e2a5",
	"#cbed82",
	"#aabaff",
	"#e5fca6",
	"#a5ff91",
	"#a8a5f7",
	"#74c1e0",
	"#f7f179",
	"#bb8fea",
	"#f2c582",
	"#f174fc",
	"#99c6ff",
	"#e4b5fc",
	"#f1f993",
	"#c9cdff",
	"#fcc9b8",
	"#c2a3ed",
	"#f98ee2",
	"#aeb3f9",
	"#cbff9b",
	"#ab79f7",
	"#fc97b0",
	"#ef6ec6",
	"#a384ff",
	"#a4baf9",
	"#bab5f4",
	"#70efa9",
	"#f9bfb3",
	"#ffc6cf",
	"#ffccea",
	"#a4fcd7",
	"#f77f6f",
	"#7cf4ea",
	"#fcccc4",
	"#a0fffa",
	"#bd81f4",
	"#77f4be",
	"#adffcc",
	"#68d2dd",
	"#fca899",
	"#d4c0f9",
	"#fca9e2",
	"#f6f98e",
	"#d0ff7f",
	"#91f7e3",
	"#fcaeb9",
	"#c4f998",
	"#9cfcef",
	"#adf998",
	"#86f4b6",
	"#9887ed",
	"#83e86a",
	"#f799c2",
	"#f9a581",
	"#c197ef",
	"#ff99db",
	"#f796b7",
	"#e7ef88",
	"#9de9f2",
	"#b395f4",
	"#f492cb",
	"#fffbb7",
	"#c7fc79",
	"#bcf970",
	"#aad6ef",
	"#f2dea2",
	"#a6fcb0",
	"#fcf6b3",
	"#bbd1f9",
	"#9bf7ab",
	"#fcc4f6",
	"#a4f77e",
	"#c7c0f9",
	"#7ded90",
	"#f2b787",
	"#a5ffd2",
	"#8ef986",
	"#8ffcbe",
	"#f5abfc",
	"#7bf46e",
	"#aefce1",
	"#a07be5",
	"#8cf7d2",
	"#efb270",
	"#78fc71",
	"#89f9b0",
	"#77f97e",
	"#cdf99d",
	"#f492ee",
	"#88f7ab",
	"#6bb4db",
	"#f7aff6",
];

/**
 * data formatter
 * @param {*} d
 * @param {*} fmt
 */
function formatDate(d, fmt) {
	const date = new Date(d);

	function pad(value) {
		return value.toString().length < 2 ? "0" + value : value;
	}
	if (fmt == "timestamp") {
		return (
			date.getUTCFullYear() +
			"-" +
			pad(date.getUTCMonth() + 1) +
			"-" +
			pad(date.getUTCDate()) +
			" " +
			pad(date.getUTCHours()) +
			":" +
			pad(date.getUTCMinutes()) +
			":" +
			pad(date.getUTCSeconds())
		);
	}
	return fmt.replace(/%([a-zA-Z])/g, function (_, fmtCode) {
		switch (fmtCode) {
			case "Y":
				return date.getUTCFullYear();
			case "M":
				return pad(date.getUTCMonth() + 1);
			case "d":
				return pad(date.getUTCDate());
			case "H":
				return pad(date.getUTCHours());
			case "m":
				return pad(date.getUTCMinutes());
			case "s":
				return pad(date.getUTCSeconds());
			default:
				throw new Error("Unsupported format code: " + fmtCode);
		}
	});
}

function randomScalingFactor() {
	return (
		(Math.random() > 0.5 ? 1.0 : -1.0) *
		Math.round(Math.random() * 996.98 * 0.52)
	);
}

function reject(obj, keys) {
	return Object.keys(obj)
		.filter((k) => !keys.includes(k))
		.map((k) => Object.assign({}, { [k]: obj[k] }))
		.reduce((res, o) => Object.assign(res, o), {});
}
/**
 * number format integer or float
 * @param {*} n
 */
function num(n) {
	return n === parseInt(n) ? parseInt(n) : parseFloat(n).toFixed(2);
}

/**
 * class chart data builder
 */
class chartData {
	/**
	 * constructor chart data
	 * @param {*} config
	 */
	constructor(config) {
		this.chart_type = config.chart_type;
		this.card_config = config.card_config;
		this.entities = config.entities;
		this.entityData = config.entityData;
		this.entityNames = config.entityNames;
		this.stateHistories = config.stateHistories;
		this.data_dateGroup = config.data_dateGroup;
		this.data_aggregate = config.aggregate || "last";
		this.graphData = {};
	}

	/**
	 * build the grouped historydata
	 *
	 * TODO: this is not final, try to find a optimized methode
	 * ---------------------------------------------------------
	 * @param {*} array
	 * @param {*} fmt
	 * @param {*} aggr
	 */
	_getGroupHistoryData(array, fmt, aggr) {
		try {
			let groups = {};
			array.forEach(function (o) {
				let group = formatDate(o.last_changed, fmt);
				groups[group] = groups[group] || [];
				o.timestamp = formatDate(o.last_changed, "timestamp");
				o.last_changed = group;
				groups[group].push(o);
			});
			return Object.keys(groups).map(function (group) {
				let items = groups[group].filter(
					(item) => !isNaN(parseFloat(item.state)) && isFinite(item.state)
				);
				if (aggr == "first") {
					const item = items.shift();
					return {
						y: num(item.state),
						x: item.last_changed,
					};
				}
				if (aggr == "last") {
					const item = items[items.length - 1];
					return {
						y: num(item.state),
						x: item.last_changed,
					};
				}
				if (aggr == "max") {
					return items.reduce((a, b) =>
						a.state > b.state
							? {
									y: num(a.state),
									x: a.last_changed,
							  }
							: {
									y: num(b.state),
									x: b.last_changed,
							  }
					);
				}
				if (aggr == "min")
					return items.reduce((a, b) =>
						a.state < b.state
							? {
									y: num(a.state),
									x: a.last_changed,
							  }
							: {
									y: num(b.state),
									x: b.last_changed,
							  }
					);
				if (aggr == "sum") {
					const val = items.reduce((sum, entry) => sum + num(entry.state), 0);
					return {
						y: num(val),
						x: items[0].last_changed,
					};
				}
				if (aggr == "avg") {
					const val =
						items.reduce((sum, entry) => sum + num(entry.state), 0) /
						items.length;
					return {
						y: num(val),
						x: items[0].last_changed,
					};
				}
				return items.map((items) => {
					return {
						y: num(items.state),
						x: items.timestamp,
					};
				});
			});
		} catch (err) {
			console.error("Build Histroydata", err.message);
		}
	}

	getTestData(entities) {
		let _labels = [];
		let _graphData = {
			data: {
				labels: [],
				datasets: [],
			},
		};

		for (let entity of entities) {
			_labels.push(entity.name);

			let _data = [];
			let _minval = 0.0;
			let _maxval = 0.0;
			let _current = 0.0;

			if (entity.randomize) {
				// simulate the data with randomScalingFactor
				_data = Array.apply(null, Array(parseInt(entity.randomize))).map(
					function () {
						return parseFloat(randomScalingFactor()).toFixed(2);
					}
				);
			}

			if (entity.data) {
				// data set by entity
				_data = entity.data.split(",").map(function (el) {
					return +el;
				});
			}

			if (entity.value) {
				// value set by entity
				_data = parseFloat(entity.value);
			}

			_minval = _data.length ? Math.min(..._data) : _data;
			_maxval = _data.length ? Math.max(..._data) : _data;
			_current = _data.length
				? Math.floor(Math.random() * _data.length)
				: _data;

			const _attr = reject(entity, ["name", "data", "value", "randomize"]);

			let _options = {
				label: entity.name,
				data: _data,
				minval: _minval,
				maxval: _maxval,
				current: _current,
				borderWidth: 3,
				hoverBorderWidth: 0,
				pointRadius: 0,
				fill: true,
				pointRadius: 0,
				mode: "testsensor",
			};

			_graphData.data.labels = _labels;
			_options = { ..._options, ..._attr };
			_graphData.data.datasets.push(_options);
		}

		return _graphData;
	}

	/**
	 * get the graph data for the entities
	 * all current states for the defined entities
	 * this is used for pie-, doughnut-, polarArea-,radar-, simple bar chart
	 * because we do not need time series - only the current state values.
	 */
	getCurrentGraphData() {
		try {
			const emptyIndexes = this.entityData.reduce(
				(arr, e, i) => (e == 0 && arr.push(i), arr),
				[]
			);
			let _data = this.entityData.filter(
				(element, index, array) => !emptyIndexes.includes(index)
			);

			if (_data.length === 0) {
				console.error("No Histroydata present !");
				return;
			}

			let _labels = this.entityNames.filter(
				(element, index, array) => !emptyIndexes.includes(index)
			);
			// build the datasource for the chartjs
			this.graphData = {
				data: {
					labels: _labels,
					datasets: [
						{
							data: _data,
							borderWidth: 0,
							hoverBorderWidth: 0,
							pointRadius: 0,
							fill: true,
							pointRadius: 0,
							unit: this.data_units || "",
							mode: "current",
						},
					],
				},
			};

			if (this.card_config.chart.toLowerCase() === "horizontalbar") {
				this.graphData.data.datasets[0].indexAxis = "y";
			}

			// TODO: // map attributes
			// const _attr = reject(entity, ["name", "entity", "last_changed", "state"]);

			// custom colors from the entities
			let entityColors = this.entities
				.map((x) => {
					if (x.color !== undefined || x.backgroundColor !== undefined)
						return x.color || x.backgroundColor;
				})
				.filter((notUndefined) => notUndefined !== undefined);

			if (entityColors.length === this.graphData.data.labels.length) {
				this.graphData.data.datasets[0].backgroundColor = entityColors;
			}

			this.graphData.config = {
				useAutoColors: entityColors.length == 0,
			};

			return this.graphData;
		} catch (err) {
			console.error("Current entities GraphData", err.message);
		}
		return null;
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
				// timebased data from the history
				let _graphData = {
					data: {
						labels: [],
						datasets: [],
					},
					config: {
						useAutoColors: false,
						secondaryAxis: false,
					},
				};

				for (const list of this.stateHistories) {

					// interate throw all entities data
					const items = this._getGroupHistoryData(
						list,
						this.data_dateGroup,
						this.data_aggregate
					);

					const id = list[0].entity_id;
					// get all settings from the selected entity
					const _attr = this.entities.find((x) => x.entity === id);

					// build the dataseries and check ignore data with zero values
					let _items = this.data_ignoreZero
						? items.map((d) => d.y).filter((x) => x != 0)
						: items.map((d) => d.y);

					// default options
					let _options = {
						label: _attr.name || "unkonwn",
						borderWidth: 3,
						hoverBorderWidth: 0,
						fill: false,
						unit: _attr.unit || "",
						data: _items,
						minval: Math.min(..._items),
						maxval: Math.max(..._items),
						current: _attr.state || 0.0,
						mode: "history",
					};

					_graphData.data.labels = items.map((l) => l.x);
					// add all entity settings (simple merge)
					if (_attr) _options = { ..._options, ..._attr };

					// check autocolors
					if (!_graphData.config.useAutoColors) {
						_graphData.config.useAutoColors =
							_attr.backgroundColor !== undefined;
					}

					// check secondary axis
					if (!_graphData.config.secondaryAxis) {
						_graphData.config.secondaryAxis =
							_attr.yAxisID != undefined || _attr.xAxisID != undefined;
					}

					_graphData.data.datasets.push(_options);
				}
				
				this.graphData = _graphData;
				return this.graphData;
			}
		} catch (err) {
			console.error("Build History GraphData", err.message);
		}
		return null;
	}
}

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
			animation: false, //{ duration: 0 },
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
					// Testcase mouse events
					// Thanks to https://github.com/kurkle
					
					// Chart.register({
					// 	id: 'eventlogger', 
					// 	afterEvent(chart, event) { 
					// 	console.log(event); 
					// 	} 
					// });

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

/** --------------------------------------------------------------------

  Custom Chart Card
  based on https://github.com/sdelliot/pie-chart-card

  chartjs:    https://www.chartjs.org/
  autocolors: https://github.com/kurkle/chartjs-plugin-autocolors
  gradient:   https://github.com/kurkle/chartjs-plugin-gradient#readme

/** -------------------------------------------------------------------*/

// Chart.js v3.0.0-beta.4 and used plugins
import "/hacsfiles/chart-card/chart-min.js?module";

// autocolors, gradient
const gradient = window["chartjs-plugin-gradient"];
const autocolors = window["chartjs-plugin-autocolors"];

console.info(
	"%c CHARTJS-CARD-DEV %c ".concat("0.0.5", " "),
	"color: white; background: #2980b9; font-weight: 700;",
	"color: white; background: #e74c3c; font-weight: 700;"
);

/**
 * lovelace card chart graph
 */
class ChartCard extends HTMLElement {
	static get properties() {
		return {
			_config: {},
			_hass: {},
		};
	}

	/**
	 * Chartjs Card constructor
	 */
	constructor() {
		// TODO: Why is this called 3-6 times on startup ?
		super();

		this._hass = null;
		this._config = null;

		this.attachShadow({
			mode: "open",
		});

		// card settings
		this.card_icon = null;
		this.card_title = null;
		this.card_height = 240;

		// all for chart
		this.theme = "";
		this.themeSettings = null;
		this.graphChart = null;
		this.chart_type = "bar";
		this.chart_locale = "de-DE";
		this.chart_update = false;
		this.ctx = null;
		this.chartconfig = null;
		this.graphData = {};

		// data providers
		this.hassEntities = [];
		this.entities = [];
		this.entity_ids = [];
		this.entityData = [];
		this.entityNames = [];

		// data service
		this.updateInterval = 60;
		this.data_hoursToShow = 0;
		this.data_group_by = "day";
		this.data_dateGroup = null;
		this.data_ignoreZero = false;
		this.data_units = "";
		this.startTime = new Date();
		this.lastEndTime = new Date();
		this.skipRender = false;
		this.ready = false;
		this._initialized = false;
	}

	/**
	 * get the date format patter for the
	 * data series group
	 * @param {*} key
	 */
	_dateFormatPattern(key) {
		const df = [];
		df["timestamp"] = "timestamp";
		df["day"] = "%Y-%M-%d";
		df["hour"] = "%Y-%M-%d %H:00:00";
		df["month"] = "%Y-%M";
		df["year"] = "%Y";
		if (key in df) return df[key];
		else return df["timestamp"];
	}

	/**
	 * evaluate the CSS variable
	 * @param {*} variable
	 */
	_evaluateCssVariable(v) {
		try {
			return getComputedStyle(document.documentElement)
				.getPropertyValue(v)
				.trim();
		} catch (err) {
			console.log("ERROR evaluateCssVariable:", v, "ERROR", err);
		}
		return v;
	}

	/**
	 * THEME SETTINGS
	 * get the font and colorsettings from the hass view.
	 * optional the settings can be overwritten by the
	 * card definition "card_theme" and the theme css
	 * TODO: get the CSS Variables from the theme
	 */
	_getThemeSettings() {
		// this.theme.dark
		this.themeSettings = {
			fontColor: this._evaluateCssVariable("--primary-text-color") || "#333333",
			fontFamily:
				this._evaluateCssVariable("--paper-font-common-base_-_font-family") ||
				"Quicksand, Roboto,'Open Sans','Rubik','Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
			gridlineColor:
				this._evaluateCssVariable("--light-primary-color") || "#DCDCDC",
			zeroLineColor:
				this._evaluateCssVariable("--dark-primary-color") || "#555555",
			tooltipsBackground: "#ecf0f1",
			tooltipsFontColor: "#647687",
			showLegend: ["pie", "doughnut", "polararea", "line"].includes(
				this.chart_type.toLowerCase()
			),
			showGridLines: ["bar", "line"].includes(this.chart_type.toLowerCase()),
			useAutoColors: true,
			secondaryAxis: false,
		};

		if (
			this._config.options &&
			this._config.options.scale &&
			this._config.options.scale.gridLines
		) {
			this.themeSettings.showGridLines = true;
		}

		if (this._config.options && this._config.options.legend) {
			this.themeSettings.showLegend = true;
		}
	}

	/**
	 * set the chart config
	 * if the options tag is present, this will
	 * overwrite the default settings
	 */
	_setChartConfig() {
		let config = {};
		// get the config
		config.type = this.chart_type;
		if (this._config.options) {
			config.options = {};
			config.options = this._config.options;
		}
		this.chartconfig = config;
		// get the theme settings (color, font...)
		this._getThemeSettings();
		// init the graph chart
		if (this.ctx) {
			let settings = {
				ctx: this.ctx,
				canvasId: this.canvasId,
				card_config: this._config,
				chart_locale: this.chart_locale,
				chart_type: this.chart_type,
				themeSettings: this.themeSettings,
				chartconfig: this.chartconfig,
			};
			this.graphChart = new graphChart(settings);
		} else {
			console.error("No chart.js container found !");
		}
	}

	/**
	 * create the HA card
	 * ha-icon and title and the canavas container
	 * for the chartjs graph
	 */
	_creatHACard() {
		// card and chart elements
		const eId = Math.random().toString(36).substr(2, 9);
		this.id = "card-" + eId;
		const card = document.createElement("ha-card");
		const content = document.createElement("div");
		const canvas = document.createElement("canvas");
		this.ctx = canvas.getContext("2d");
		this.canvasId = "chart-" + eId;
		const style = document.createElement("style");
		card.id = this.id;
		// card content
		content.id = "content-" + eId;
		canvas.id = this.canvasId;
		content.style.height = this.card_height + "px";
		content.style.width = "100%"
		// the canvas element for chartjs
		canvas.height = this.card_height;
		canvas.style.cssText =
			"-moz-user-select: none; -webkit-user-select: none; -ms-user-select: none;";
		
		// create the header and icon	
		const cardHeader = document.createElement("div");
		cardHeader.setAttribute("class", "card-header");
		cardHeader.style.cssText = "padding-bottom:0 !important;";
		if (this.card_icon) {
			const iconel = document.createElement("ha-icon");
			iconel.setAttribute("icon", this.card_icon);
			iconel.style.cssText = "position:relative;top:-4px;padding:0 12px 0 4px;";
			cardHeader.appendChild(iconel);
		}
		if (this.card_title) {
			const cardTitle = document.createElement("span");
			cardTitle.innerHTML = "<!---->" + this.card_title + "<!---->";
			cardHeader.appendChild(cardTitle);
		}
		if (this.card_title || this.card_icon) card.append(cardHeader);

		// create the info box (optional)
		if (this.card_info) {
			const cardInfo = document.createElement("div");
			cardInfo.style =
				"min-height:30px; background-color:trasnparent;padding:8px";
			card.appendChild(cardInfo);
		}
		card.appendChild(content);
		card.appendChild(style);
		content.appendChild(canvas);
		this.root.appendChild(card);
	}

	/**
	 * Home Assistant will call setConfig(config) when the configuration changes (rare).
	 * If you throw an exception if the configuration is invalid,
	 * Lovelace will render an error card to notify the user.
	 */
	setConfig(config) {
		if (!config.entities) {
			throw new Error("You need to define an entity");
		}
		

		try {
			this.root = this.shadowRoot;
			if (this.root.lastChild) this.root.removeChild(this.root.lastChild);

			
			if(this._config){
				console.log("CHART-CART Config", config.title , " allready loaded")
				return
			}

			// get the config from the lovelace
			this._config = config;

			// ha-card settings
			this.card_title = this._config.title || "";
			this.card_icon = this._config.icon || null;
			this.card_height = this._config.height || 240;
			this.card_info = this._config.cardInfo || null;

			// all settings for the chart
			this.chart_type = this._config.chart || "bar";
			const availableTypes = [
				"line",
				"radar",
				"bar",
				"horizontalBar",
				"pie",
				"doughnut",
				"polarArea",
				"bubble",
				"scatter",
			];
			if (!this.chart_type) {
				throw new Error("You need to define type of chart");
			} else if (!availableTypes.includes(this.chart_type)) {
				throw new Error(
					"Invalid config for 'chart:'" +
						this.chart_type +
						". Available options are: " +
						availableTypes.join(", ")
				);
			}
			if (this.chart_type.toLowerCase() === "horizontalbar") {
				this.chart_type = "bar";
			}
			this.chart_locale = this._config.locale || "de-DE";
			// setting for data handling
			this.updateInterval = this._config.update || 60;
			this.data_hoursToShow = this._config.hours_to_show || 0;
			this.data_group_by = this._config.group_by || "day";
			this.data_dateGroup = this._dateFormatPattern(this.data_group_by);
			this.data_aggregate = this._config.aggregate || "last";
			this.data_ignoreZero = this._config.ignoreZero || false;

			this.data_units = this._config.units || "";
			this.data_test = this._config.testdata || null;

			// create the card and apply the chartjs config
			this._creatHACard();
			this._setChartConfig();
			this._initialized = true;
		} catch (err) {
			console.log(err.message, config);
		}
	}

	/**
	 * HASS settings
	 *
	 */
	set hass(hass) {
		if (hass === undefined) return;
		if (!this._initialized) return;

		if (this.theme && this.theme !== hass.selectedTheme) {
			// theme change, update chart
			this.theme = hass.selectedTheme;
			this._getThemeSettings();
			if (this.graphChart) {
				this.graphChart.themeSettings = this.themeSettings;
				this.graphChart.renderGraph(true);
			}
			if (this.skipRender) return;
		}

		// TODO : find a better methode ??
		if (this.updateInterval) {
			let endTime = new Date();
			let elapsed = (endTime.getTime() - this.startTime.getTime()) / 1000;
			if (elapsed > this.updateInterval) {
				// refresh and update the graph
				this.graphChart.themeSettings = this.themeSettings;
				this._getHistory();
				this.startTime = new Date();
				if (this.skipRender) return;
			}
		}

		// check if the Entities has changed
		if (this.skipRender && this.hassEntities && this.hassEntities.length) {
			let changed = false;
			this.hassEntities.forEach((entity) => {
				changed =
					changed ||
					Boolean(
						this.hass && hass.states[entity] !== this._hass.states[entity]
					);
			});
			if (changed) {
				console.log("NEW DATA !!!!");
			}
		}

		this._hass = hass;
		this.theme = hass.selectedTheme;

		// An object list containing the states of all entities in Home Assistant.
		// The key is the entity_id, the value is the state object.
		this.hassEntities = this._config.entities.map((x) => hass.states[x.entity]);
		if (!this.hassEntities || this.hassEntities.length === 0) return;

		// all entity data
		this.entityData = this.hassEntities.map((x) =>
			x === undefined ? 0 : x.state
		);

		// all entities
		if (
			this.ready === false &&
			this.entities.length !== this.hassEntities.length
		) {
			this.entities = [];
			for (let entity of this._config.entities) {
				const h = this.hassEntities.find((x) => x.entity_id === entity.entity);
				let item = Object.assign({}, entity);
				if (h.attributes) {
					item.name = item.name || h.attributes.friendly_name || item.name;
					item.unit = item.unit || h.attributes.unit_of_measurement || "";
				}
				if (h) {
					item.last_changed = h.last_changed;
					item.state = h.state;
				}
				this.entities.push(item);
				this.entity_ids.push(entity.entity);
			}
			this.ready = (this.entity_ids && this.entity_ids.length) !== 0;
		}

		// all entity names
		this.entityNames = this._config.entities.map((x) =>
			x.name !== undefined
				? x.name
				: hass.states[x.entity]["attributes"]["friendly_name"] !== undefined
				? hass.states[x.entity]["attributes"]["friendly_name"]
				: x.entity
		);

		if (this.skipRender == false && this._initialized) {
			// get the histroy data and render the graph
			this._getHistory();
			this.skipRender = true;
		}
	}

	/**
	 * Get all histroy data for all registrated entity ids
	 * or get the entity data if no time slot (hoursToShow) is defined.
	 * Call an API on the Home Assistant server.
	 */
	_getHistory() {
		if (this.ready) {
			if (this.data_hoursToShow && this.data_hoursToShow > 0) {
				let startTime;
				if (this.chart_update) {
					startTime = this.lastEndTime;
				} else {
					startTime = new Date();
					startTime.setHours(startTime.getHours() - this.data_hoursToShow);
				}
				let endTime = new Date();
				this.lastEndTime = endTime;
				const filter =
					startTime.toISOString() +
					"?end_time=" +
					endTime.toISOString() +
					"&filter_entity_id=" +
					this.entity_ids.join(",");
				// get all Data for the sensors
				let url = "history/period/" + filter + "&minimal_response";
				const prom = this._hass.callApi("GET", url).then(
					(stateHistory) => this._buildGraphData(stateHistory),
					() => null
				);
			} else {
				this._buildGraphData(null);
			}
		}
	}

	/**
	 * build the graph cart data and datasets for the
	 * defined graph chart. Uses the history data and the
	 * entity data.
	 *
	 * @param {*} stateHistories
	 */
	_buildGraphData(stateHistories) {
		const _chartData = new chartData({
			chart_type: this.chart_type,
			card_config: this._config,
			entities: this.entities,
			entityData: this.entityData,
			entityNames: this.entityNames,
			stateHistories: stateHistories,
			data_dateGroup: this.data_dateGroup,
			data_aggregate: this.data_aggregate,
		});

		// get the chart data
		if (stateHistories && stateHistories.length) {
			this.graphData = _chartData.getHistoryGraphData();
		} else {
			this.graphData = _chartData.getCurrentGraphData();
		}

		if (this.graphData === null) {
			console.error("No GraphData found for ", this.entityNames);
			return;
		} else {
			if (this.graphData.config) {
				this.themeSettings.useAutoColors =
					this.graphData.config.useAutoColors || false;
				this.themeSettings.secondaryAxis =
					this.graphData.config.secondaryAxis || false;
			}
		}

		if (this.chart_update) {
			if (this.graphChart && this.graphData) {
				this.graphChart.graphData = this.graphData;
				this.graphChart.renderGraph(true);
			}
		} else {
			if (this.graphChart && this.graphData) {
				this.graphChart.graphData = this.graphData;
				this.graphChart.renderGraph(false);
			}
		}
	}

	/**
	 * The height of the card. Home Assistant uses this to automatically
	 * distribute all cards over the available columns.
	 */
	getCardSize() {
		return 4;
	}
}

customElements.define("chart-card", ChartCard);
