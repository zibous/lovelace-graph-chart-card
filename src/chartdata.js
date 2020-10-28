/** ----------------------------------------------------------

  	chart data builder
  
  	TODO: this is not final, try to find a optimized methode
  
 * ----------------------------------------------------------*/

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

			if (this.graphData.data.length === 0) {
				console.error("No Histroydata present !");
				return;
			}
			this.graphData.config = {
				useAutoColors: entityColors.length==0,
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
				};
				for (const list of this.stateHistories) {
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
					this.graphData.config = {
						useAutoColors: true,
					};
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
