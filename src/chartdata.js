/** ----------------------------------------------------------

  	chart data builder
  
  	TODO: this is not final, try to find a optimized methode
  
 * ----------------------------------------------------------*/
const DEFAULT_COLORS = [
	"rgba(237,212,0,0.85)",
	"rgba(115,210,22,0.85)",
	"rgba(245,121,0,0.85)",
	"rgba(52,101,164,0.85)",
	"rgba(89,161,79,0.85)",
	"rgba(182,153,45,0.85)",
	"rgba(73,152,148,0.85)",
	"rgba(225,87,89,0.85)",
	"rgba(121,112,110,0.85)",
	"rgba(211,114,149,0.85)",
	"rgba(176,122,161,0.85)",
	"rgba(157,118,96,0.85)",
	"rgba(52,152,219,0.85)",
	"rgba(46,204,113,0.85)",
	"rgba(241,196,15,0.85)",
	"rgba(155,89,182,0.85)",
	"rgba(26,188,156,0.85)",
	"rgba(39,174,96,0.85)",
	"rgba(41,128,185,0.85)",
	"rgba(142,68,173,0.85)",
	"rgba(44,62,80,0.85)",
	"rgba(230,126,34,0.85)",
	"rgba(231,76,60,0.85)",
	"rgba(236,240,241,0.85)",
	"rgba(149,165,166,0.85)",
	"rgba(243,156,18,0.85)",
	"rgba(211,84,0,0.85)",
	"rgba(192,57,43,0.85)",
	"rgba(229,28,35,0.85)",
	"rgba(205,220,57,0.85)",
	"rgba(52,152,219,0.85)",
	"rgba(231,76,60,0.85)",
	"rgba(155,89,182,0.85)",
	"rgba(241,196,15,0.85)",
	"rgba(46,204,113,0.85)",
	"rgba(26,188,156,0.85)",
	"rgba(52,73,94,0.85)",
	"rgba(230,126,34,0.85)",
	"rgba(127,140,141,0.85)",
	"rgba(39,174,96,0.85)",
	"rgba(41,128,185,0.85)",
	"rgba(142,68,173,0.85)",
];

const COLOR_RADARCHART = "rgba(41, 182, 246, 0.45)";
const COLOR_BUBBLECHAT = "rgba(255, 152, 0, 0.685)";
/**
 * get random color from DEFAULT_COLORS
 */
// var randomColor = DEFAULT_COLORS[Math.floor(Math.random()*DEFAULT_COLORS.length)];
const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);

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

/**
 * build random scaling data
 */
function randomScalingFactor() {
	return (
		(Math.random() > 0.5 ? 1.0 : -1.0) *
		Math.round(Math.random() * 996.98 * 0.52)
	);
}
/**
 * remove node from object
 * @param {*} obj
 * @param {*} keys
 */
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
		this.entityOptions = config.entityOptions;
		this.entityData = config.entityData;
		this.entityNames = config.entityNames;
		this.stateHistories = config.stateHistories;
		this.data_dateGroup = config.data_dateGroup || "%Y-%M-%d %H:00:00";
		this.data_aggregate = config.aggregate || "last";
		this.graphData = {};
	}

	/**
	 * build the grouped historydata
	 *
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

	/**
	 * the default graph data
	 */
	getDefaultGraphData() {
		return {
			data: {
				labels: [],
				datasets: [],
			},
			config: {
				secondaryAxis: false,
				series: 1,
				gradient: false,
				options: {},
			},
		};
	}

	/**
	 * Create dataseries for scatter chart
	 * @param {*} _entities
	 */
	createScatterChartData(_entities) {
		let _graphData = null;
		if (_entities.length % 2 === 0) {
			_graphData = this.getDefaultGraphData();
			for (let i = 0; i < _entities.length; i += 2) {
				// first entity holds the attributes
				const _attr = _entities[i];
				_graphData.data.datasets.push({
					label: _attr.name || "",
					scale: _attr.scale || 1.0,
					unit: _attr.unit || "",
					backgroundColor: _attr.backgroundColor || COLOR_BUBBLECHAT,
					borderColor: _attr.borderColor || COLOR_BUBBLECHAT,
					data: [
						{
							x: _entities[i].state || 0.0,
							y: _entities[i + 1].state || 0.0,
						},
					],
				});
			}
			_graphData.config.options.scatter = true;
		} else {
			console.error("ScatterChart setting not valid", this.entities);
		}
		return _graphData;
	}

	/**
	 * create the series data for the bubble chart
	 *
	 * Important: the radius property, r is not scaled by the chart,
	 * it is the raw radius in pixels of the bubble
	 * that is drawn on the canvas.
	 */
	createBubbleChartData(_entities) {
		let _graphData = null;
		if (_entities.length % 3 === 0) {
			_graphData = this.getDefaultGraphData();
			for (let i = 0; i < _entities.length; i += 3) {
				const _attr = _entities[i + 2];
				_graphData.data.datasets.push({
					label: _attr.name || "",
					scale: _attr.scale || 1.0,
					unit: _attr.unit || "",
					backgroundColor: _attr.backgroundColor || COLOR_BUBBLECHAT,
					borderColor: _attr.borderColor || COLOR_BUBBLECHAT,
					data: [
						{
							x: _entities[i].state || 0.0,
							y: _entities[i + 1].state || 0.0,
							r: _entities[i + 2].state || 0.0,
						},
					],
				});
			}
			_graphData.config.options.bubble = true;
		} else {
			console.error("BubbleChart setting not valid", this.entities);
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

			let _data = [];
			switch (this.chart_type.toLowerCase()) {
				case "bubble":
					this.graphData = this.createBubbleChartData(this.entities);
					return this.graphData;
				case "scatter":
					this.graphData = this.createScatterChartData(this.entities);
					return this.graphData;
				default:		
					_data = this.entityData.filter(
						(element, index, array) => !emptyIndexes.includes(index)
					);
					break;
			}

			if (_data.length === 0) {
				console.error("No Histroydata present !");
				return null;
			}

			let _defaultDatasetConfig = {
				unit: this.data_units || "",
				mode: "current",
			};

			// merge entity options
			if (this.entityOptions) {
				_defaultDatasetConfig = {
					..._defaultDatasetConfig,
					...this.entityOptions,
				};
			}

			// merge dataset_config
			this.graphData = this.getDefaultGraphData();
			this.graphData.data.labels = this.entityNames.filter(
				(element, index, array) => !emptyIndexes.includes(index)
			);
			this.graphData.data.datasets[0] = _defaultDatasetConfig;

			// case horizontal bar
			if (this.card_config.chart.toLowerCase() === "horizontalbar") {
				this.graphData.data.datasets[0].indexAxis = "y";
			}

			// custom colors from the entities
			let entityColors = this.entities
				.map((x) => {
					if (x.color !== undefined || x.backgroundColor !== undefined)
						return x.color || x.backgroundColor;
				})
				.filter((notUndefined) => notUndefined !== undefined);

			if (entityColors.length === this.graphData.data.labels.length) {
				this.graphData.data.datasets[0].backgroundColor = entityColors;
			} else {
				if (this.chart_type === "radar") {
					this.graphData.data.datasets[0].backgroundColor = COLOR_RADARCHART;
					this.graphData.data.datasets[0].borderColor = COLOR_RADARCHART;
					this.graphData.data.datasets[0].borderWidth = 1;
					this.graphData.data.datasets[0].pointBorderColor = COLOR_RADARCHART;
					this.graphData.data.datasets[0].pointBackgroundColor = COLOR_RADARCHART;
				} else {
					entityColors = DEFAULT_COLORS.slice(1, _data.length + 1);
					this.graphData.data.datasets[0].backgroundColor = entityColors;
				}
			}

			// add the data series and return the new graph data
			this.graphData.data.datasets[0].data = _data;
			return this.graphData;
		} catch (err) {
			console.error("Current entities GraphData", err.message);
		}
		return null;
	}

	/**
	 * get series data for bubble or scatter chart
	 */
	getSeriesData() {
		let _seriesData = [];
		for (const list of this.stateHistories) {
			const items = this._getGroupHistoryData(
				list,
				this.data_dateGroup,
				this.data_aggregate
			);
			_seriesData.push(items);
		}
		return _seriesData;
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
				let _graphData = this.getDefaultGraphData();
				let _seriesData = [];
				switch (this.chart_type.toLowerCase()) {
					case "bubble":
						_seriesData = this.getSeriesData();
						if (_seriesData.length % 3 === 0) {
							for (let r = 0; r < _seriesData.length; r += 3) {
								const _attr = this.entities[r + 2];
								let _data = [];
								_seriesData[r].forEach(function (e, i) {
									if (_seriesData[r + 1][i] && _seriesData[r + 2][i]) {
										_data.push({
											x: parseFloat(_seriesData[r + 0][i].y) || 0.0,
											y: parseFloat(_seriesData[r + 1][i].y || 0.0),
											r: parseFloat(_seriesData[r + 2][i].y || 0.0),
										});
									}
								});
								_graphData.data.datasets.push({
									label: _attr.name || "",
									unit: _attr.unit || "",
									scale: _attr.scale || 1,
									backgroundColor: _attr.backgroundColor || COLOR_BUBBLECHAT,
									borderColor: _attr.borderColor || COLOR_BUBBLECHAT,
									data: _data,
								});
							}
							if (_graphData.data.datasets.length) {
								_graphData.config.options.bubble = true;
								this.graphData = _graphData;
								return this.graphData;
							}
						}
						console.error("BubbleChart setting not valid", this.entities);
						return null;
					case "scatter":
						_seriesData = this.getSeriesData();
						if (_seriesData.length % 2 === 0) {
							for (let r = 0; r < _seriesData.length; r += 2) {
								// first entity hols the attributes
								const _attr = this.entities[r];
								let _data = [];
								_seriesData[r].forEach(function (e, i) {
									if (_seriesData[r][i] && _seriesData[r + 1][i]) {
										_data.push({
											x: parseFloat(_seriesData[r + 0][i].y) || 0.0,
											y: parseFloat(_seriesData[r + 1][i].y || 0.0),
										});
									}
								});
								_graphData.data.datasets.push({
									label: _attr.name || "",
									unit: _attr.unit || "",
									unit: _attr.scale || 1.0,
									backgroundColor: _attr.backgroundColor || COLOR_BUBBLECHAT,
									borderColor: _attr.borderColor || COLOR_BUBBLECHAT,
									data: _data,
								});
							}
							if (_graphData.data.datasets.length) {
								_graphData.config.options.bubble = true;
								this.graphData = _graphData;
								return this.graphData;
							}
						}
						console.error("ScatterChart setting not valid", this.entities);
						return null;
					default:
						break;
				}

				// all for other carts
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

					// default Dataset Properties
					let _options = {
						label: _attr.name || "unkonwn",
						unit: _attr.unit || "",
						minval: Math.min(..._items),
						maxval: Math.max(..._items),
						current: _attr.state || 0.0,
						mode: "history",
					};

					if (this.entityOptions) {
						// simple merge the default with the global options
						_options = { ..._options, ...this.entityOptions };
						_graphData.config.options = this.entityOptions;
					}

					// simple merge the entity options
					if (_attr) _options = { ..._options, ..._attr };

					// gradient
					if (
						this.chart_type === "line" &&
						_attr.gradient &&
						_attr.gradient.colors
					) {
						_options.gradient = {
							backgroundColor: {
								axis: "y",
								colors: {},
							},
							borderColor: {
								axis: "y",
								colors: {},
							},
						};
						_options.gradient.borderColor.axis = "y";
						_options.gradient.backgroundColor.axis = "y";
						if (_attr.gradient.colors) {
							const _cl = _attr.gradient.colors.length;
							let _steps = parseInt(100 / _cl);
							for (let i in _attr.gradient.colors) {
								_options.gradient.backgroundColor.colors[_steps * i] =
									_attr.gradient.colors[i];
							}
							if (_options.minval !== undefined) {
								_steps = parseInt(_options.maxval - _options.minval) / _cl;
								for (let i in _attr.gradient.colors) {
									_options.gradient.borderColor.colors[
										(_options.minval + _steps * i).toFixed(2)
									] = _attr.gradient.colors[i];
								}
							}
							_graphData.config.gradient = true;
						}
					}

					// check entity backgroundcolor and if not set use one from the default colors
					if (
						_attr.backgroundColor === undefined &&
						_graphData.config.gradient === false
					) {
						_options.backgroundColor =
							DEFAULT_COLORS[_graphData.config.series + 9];
						_options.borderColor = DEFAULT_COLORS[_graphData.config.series + 9];
					}

					// check secondary axis
					if (!_graphData.config.secondaryAxis) {
						_graphData.config.secondaryAxis =
							_attr.yAxisID != undefined || _attr.xAxisID != undefined;
					}

					// assign the data for the current series
					_options.data = _items;

					// add the options, labels and data series
					// this.data_dateGroup == "%Y-%M-%d %H:00:00"
					_graphData.data.labels = items.map((l) => l.x);
					_graphData.data.datasets.push(_options);
					_graphData.config.series++;
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
