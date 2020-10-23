// npm run-script build
import Chart from "chart.js";
import "chartjs-plugin-colorschemes";
import ColorSchemesPlugin from "chartjs-plugin-colorschemes";
import { dtFormat, formatDate, datavalue, mergedata, num } from "./tools";

// import "chartjs-plugin-style";

// chartjs-plugin-gradient
// This plugin requires Chart.js 3.0.0 or later. Could work with v2, but it is not supported.	
// import gradient from 'chartjs-plugin-gradient';

console.info(
	"%c CHARTJS-CARD-DEV %c ".concat("0.0.4", " "),
	"color: white; background: #2980b9; font-weight: 700;",
	"color: white; background: #e74c3c; font-weight: 700;"
);

let GLOBAL = {
	LOCALE: "",
};

/**
 * Graph Chart.js Card
 * Chart.js card for Home Assistant
 */
class GraphChartjsCard extends HTMLElement {
	static get properties() {
		return {
			_config: {},
			_hass: {},
			_initialized: { type: Boolean },
		};
	}

	/**
	 * Chartjs Card constructor
	 */
	constructor() {
		// TODO: Why is this called 3-6 times on startup ?
		super();
		this._hass = null;
		this.theme = "";
		this.chart = null;
		this.chart_update = false;
		this.ctx = null;
		this.chartconfig = null;
		this.entities = [];
		this.entity_ids = [];
		this.entityData = [];
		this.entityNames = [];
		this.graphData = {};
		this.updateInterval = 60;
		this.startTime = new Date();
		this.lastEndTime = new Date();
		this.statHistoryData = [];
		this.skipRender = false;
		this.ready = false;
		this._initialized = false;
		this.attachShadow({
			mode: "open",
		});
	}

	/**
	 * evaluate the CSS variable
	 * @example: getComputedStyle(document.documentElement).getPropertyValue('--card-background-color')
	 *           getComputedStyle(document.documentElement).getPropertyValue('--text-primary-color')
	 * @param {*} variable
	 */
	_evaluateCssVariable(v) {
		try {
			return getComputedStyle(document.documentElement).getPropertyValue(v);
		} catch (err) {
			console.log("ERROR evaluateCssVariable:", v, "ERROR", err);
		}
		return v;
	}

	/**
	 * set the chart config
	 * if the options tag is present, this will
	 * overwrite the default settings
	 */
	setChartConfig() {
		let config = {};
		config.type = this.chart_type;
		if (this._config.options) {
			config.options = {};
			config.options = this._config.options;
		}
		this.chartconfig = config;
	}

	/**
	 * default chart settings
	 * get the font and colorsettings from the hass view.
	 * optional the settings can be overwritten by the
	 * card definition "card_theme"
	 */
	_getChartThemeSettings() {
		// this.theme.dark
		this.themeSettings = {
			theme: this.theme,
			fontColor: this._evaluateCssVariable("--primary-text-color") || "#333333",
			fontFamily:
				this._evaluateCssVariable("--paper-font-common-base_-_font-family") ||
				"'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
			gridlineColor:
				this._evaluateCssVariable("--light-primary-color") || "#DCDCDC",
			zeroLineColor:
				this._evaluateCssVariable("--dark-primary-color") || "#555555",
			tooltipsBackground: "#ecf0f1",
			tooltipsFontColor: "#647687",
		};
	}

	/**
	 *  Home Assistant will call setConfig(config) when the configuration changes (rare).
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

			// get the config from the lovelace
			this._config = config;

			// ha-card settings
			this.card_title = this._config.title || "";
			this.card_height = this._config.height || 240;
			this.card_theme = this._config.cardtheme || null;

			// card and chart elements
			const card = document.createElement("ha-card");
			const content = document.createElement("div");
			const canvas = document.createElement("canvas");
			this.ctx = canvas.getContext("2d");
			const style = document.createElement("style");
			card.id = "ha-card";
			content.id = "content";
			canvas.id = "cnv";
			content.style.height = this.card_height + "px";
			canvas.height = this.card_height;
			card.appendChild(content);
			card.appendChild(style);
			content.appendChild(canvas);
			this.root.appendChild(card);

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
					"Invalid config for 'chart'. Available options are: " +
						availableTypes.join(", ")
				);
			}
			this.chart_colorschemes = this._config.colorschemes || null;
			this.chart_styles = this._config.style || null;
			this.chart_locale = GLOBAL.LOCALE = this.chart_locale || "de-DE";

			// setting for data handling
			this.updateInterval = this._config.update || 60;
			this.data_hoursToShow = this._config.hours_to_show || 0;
			this.data_group_by = this._config.group_by || "day";
			this.data_dateGroup = dtFormat(this.data_group_by);
			this.data_units = this._config.units || "";
			this.setChartConfig();
		} catch (err) {
			showErrorCard(err.message, config);
		}
	}

	/**
	 * render the card header
	 */
	renderCardHeader() {
		// TODO: how to add the title icon ??
		const card = this.root.getElementById("ha-card");
		if (card) {
			if (this.card_title && this.card_title != "") {
				card.header = this.card_title;
			}
		}
	}

	/**
	 * HASS settings
	 *
	 */
	set hass(hass) {
		
		if (hass === undefined) return;
		
		if (this.theme && this.theme !== hass.selectedTheme) {
			// theme change, update chart
			this.theme = hass.selectedTheme;
			this._updateGraph();
			if (this.skipRender) return;
		}

		// TODO : find a better methode ??
		if (this.updateInterval) {
			let endTime = new Date();
			let elapsed = (endTime.getTime() - this.startTime.getTime()) / 1000;
			if (elapsed > this.updateInterval) {
				// refresh and update the graph
				this._updateGraph();
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
		this.currentUser = hass.user;
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

		if (this.skipRender == false) {
			this.renderCardHeader();
			// get the histroy data and render the graph
			this._getHistory();
			this.skipRender = true;
		}
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
	_groupHistoryData(array, fmt, aggr) {
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
				// get the current values from the sensor(s)
				const emptyIndexes = this.entityData.reduce(
					(arr, e, i) => (e == 0 && arr.push(i), arr),
					[]
				);
				this.graphData = {
					data: {
						labels: this.entityNames.filter(
							(element, index, array) => !emptyIndexes.includes(index)
						),
						datasets: [
							{
								data: this.entityData.filter(
									(element, index, array) => !emptyIndexes.includes(index)
								),
								borderWidth: 0,
								hoverBorderWidth: 0,
								pointRadius: 0,
								fill: true,
								pointRadius: 0,
								unit: this.data_units,
								mode: "current",
							},
						],
					},
				};

				// custom colors
				let entityColors = this._config.entities
					.map((x) => {
						if (x.color !== undefined) return x.color;
					})
					.filter((notUndefined) => notUndefined !== undefined);
				if (entityColors.length === this.graphData.data.labels.length) {
					this.graphData.data.datasets[0].backgroundColor = entityColors;
				}

				if (this.graphData.data.length === 0) {
					// showErrorCard(err.message, config);
					console.error("No Histroydata present !");
					return;
				}

				if (this.chart_update) {
					this._updateGraph();
				} else {
					this._renderGraph();
				}
			}
		}
	}

	/**
	 * build the graph cart data and datasets for the
	 * defined graph chart. Uses the history data and the
	 * entity data.
	 *
	 * @param {*} stateHistories
	 * @param {*} update
	 */
	_buildGraphData(stateHistories) {
		this.statHistoryData = [];
		let _graphData = {
			data: {
				labels: [],
				datasets: [],
			},
		};
		try {
			if (stateHistories && stateHistories.length) {
				for (const list of stateHistories) {
					const items = this._groupHistoryData(
						list,
						this.data_dateGroup,
						"last"
					);
					const id = list[0].entity_id;
					const _attr = this.entities.find((x) => x.entity === id);
					// default options
					let _options = {
						label: _attr.name,
						borderWidth: 3,
						hoverBorderWidth: 0,
						fill: false,
						unit: "",
						data: items.map((d) => d.y),
					};
					// add all entity settings
					if (_attr) _options = { ..._options, ..._attr };
					_graphData.data.labels = items.map((l) => l.x);
					_graphData.data.datasets.push(_options);
				}
				this.graphData = _graphData;
				if (this.chart_update) {
					this._updateGraph();
				} else {
					this._renderGraph();
				}
			}
		} catch (err) {
			console.error("Build GraphData", err.message);
		}
	}

	/**
	 * Chart Global Configuration
	 * This way you can be as specific as you would like in your individual chart configuration,
	 * while still changing the defaults for all chart types where applicable.
	 * The global general options are defined in Chart.defaults.global
	 *
	 * Options may be configured directly on the dataset. The dataset options can be
	 * changed at 3 different levels and are evaluated with the following priority:
	 *
	 *   per dataset: dataset.*
	 *   per chart: options.datasets[type].*
	 *   or globally: Chart.defaults.global.datasets[type].*
	 *
	 * where type corresponds to the dataset type.
	 */
	_setChartDefaultGlobals() {
		this._getChartThemeSettings();

		Chart.defaults.global.defaultFontColor = this.themeSettings.fontColor;
		Chart.defaults.global.defaultFontFamily = this.themeSettings.fontFamily;

		// chart view scale
		Chart.defaults.global.elements.responsive = true;
		Chart.defaults.global.elements.maintainAspectRatio = false;
		Chart.defaults.global.responsive = true;
		Chart.defaults.global.maintainAspectRatio = false;

		Chart.defaults.global.chartArea = {
			backgroundColor: "transparent",
		};

		// layout
		Chart.defaults.global.layout.padding = {
			left: 18,
			right: 18,
			top: 10,
			bottom: 24,
		};

		// all for tooltips
		Chart.defaults.global.tooltips.backgroundColor = this.themeSettings.tooltipsBackground;
		Chart.defaults.global.tooltips.titleFontColor = this.themeSettings.tooltipsFontColor;
		Chart.defaults.global.tooltips.titleFontSize = 14;
		Chart.defaults.global.tooltips.titleSpacing = 1;
		Chart.defaults.global.tooltips.titleMarginBottom = 10;
		Chart.defaults.global.tooltips.bodyFontColor = this.themeSettings.tooltipsFontColor;
		Chart.defaults.global.tooltips.bodyFontSize = 12;
		Chart.defaults.global.tooltips.bodySpacing = 1;
		Chart.defaults.global.tooltips.xPadding = 10;
		Chart.defaults.global.tooltips.yPadding = 10;
		Chart.defaults.global.tooltips.cornerRadius = 3;
		Chart.defaults.global.tooltips.enabled = true;


		// Interaction Modes
		Chart.defaults.global.hover.mode = "nearest";
		Chart.defaults.global.hover.intersect = true;

		Chart.defaults.global.tooltips.mode = "nearest";
		Chart.defaults.global.tooltips.position = "nearest";

		// for bar, line, radar ..
		Chart.defaults.global.tooltips.callbacks.label = function (
			tooltipItem,
			data
		) {
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
			Chart.defaults.doughnut.tooltips.callbacks.label = function (
				tooltipItem,
				data
			) {
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
			Chart.defaults.pie.tooltips.callbacks.label = function (
				tooltipItem,
				data
			) {
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
			Chart.defaults.scatter.tooltips.callbacks.label = function (
				tooltipItem,
				data
			) {
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
			Chart.defaults.polarArea.tooltips.callbacks.label = function (
				tooltipItem,
				data
			) {
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
			// Chart.defaults.ticks.backdropColor = 'red'
			Chart.defaults.radar.scale.gridLines = {
				display: true,
				color: this.themeSettings.gridlineColor,
			};
		}

		Chart.defaults.global.elements.point.radius = 0.2;
		Chart.defaults.global.elements.point.hitRadius = 8;

		Chart.defaults.scale.gridLines.color = this.themeSettings.gridlineColor;
		Chart.defaults.scale.gridLines.lineWidth = 0.33;

		Chart.defaults.scale.gridLines.zeroLineWidth = 0.5;
		Chart.defaults.scale.gridLines.zeroLineColor = this.themeSettings.zeroLineColor;

		Chart.defaults.global.legend.display = false;

		if (["pie", "doughnut", "polarArea", "line"].includes(this.chart_type)) {
			Chart.defaults.global.legend.display = true;
			Chart.defaults.global.legend.position =
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
			Chart.defaults.global.plugins.colorschemes.scheme = this.chart_colorschemes;

		// Chart.pluginService.register(gradient);

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
		if(this.chart_styles){
			console.log("STYLES", this.chart_styles)
		}
	}

	/**
	 * render the graph based on the settings and
	 * datasets.
	 */
	_renderGraph() {
		try {
			this.chartconfig.data = {
				labels: this.graphData.data.labels,
				unit: this.data_units,
				charttype: this.chart_type,
				datasets: this.graphData.data.datasets,
			};
			// Chart declaration
			if (this.ctx) {
				this._setChartDefaultGlobals();
				this.chart = new Chart(this.ctx, this.chartconfig);
			}
		} catch (err) {
			console.error("Render Graph Error on", this.chart_type, ": ", err);
		}
	}

	/**
	 * calls the chart update and render all
	 * new data.
	 */
	_updateGraph() {
		try {
			if (this.chart && this.ctx) {
				this._setChartDefaultGlobals();
				this.chart.update({ duration: 0, easing: "linear" });
			}
		} catch (err) {
			console.error("Update Graph", err.message);
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

customElements.define("graph-chartjs-card", GraphChartjsCard);
