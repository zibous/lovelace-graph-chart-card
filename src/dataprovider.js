/** ----------------------------------------------------------
 
	Lovelaces chartjs
  	(c) 2021 Peter Siebler
  	Released under the MIT license
 
 * ----------------------------------------------------------*/

/**
 * Lovelaces chartjs
 * Dataprovider for chart.js
 *
 */
class DataProvider {
    /**
     * constructor data provider
     * @param {*} settings
     */
    constructor(settings) {
        this.dataInfo = settings.datainfo
        this.datascales = settings.datascales
        this.DEBUGMODE = settings.debugmode
        this.DEBUGDATA = settings.debugdata
        this.locale = window.Chart3.defaults.locale | "DE"
        this.ready = this._checkParam()
        this.version = "1.0.1"
    }

    /**
     * check the settings and hass api call settings
     * @returns boolean
     */
    _checkParam() {
        if (this.datascales && this.dataInfo.entity_items && Object.keys(this.dataInfo.entity_items)) {
            this.datascales.range = this.datascales.range || 24
            this.datascales.aggregate = this.datascales.aggregate || "last"
            return true
        }
        return false
    }
    /**
     * all servicedata information
     * @param {*} _entity
     */
    _setEntityServiceDataInformation(_entity) {
        if (_entity) {
            _entity.datascales.data_count = 0
            _entity.datascales.servicemode = TRANSFORM_MODE.seriesdata
        }
    }
    /**
     * build the seriesdata based on the grouped data
     * @param {*} id
     * @param {*} data
     * @returns number data series
     */
    _createTimeSeriesData(_entity, data) {
        _entity.seriesdata = _entity.seriesdata || []
        _entity.seriesdata.data = _entity.seriesdata.data || []
        _entity.seriesdata.data = Object.entries(data).map(function (row) {
            const _values = row[1].data
            if (_values && _values.length) {
                let _itemdata = {
                    x: new Date(row[0]).getTime(),
                    localedate: row[1].localedate,
                    y: arrStatistics[_entity.datascales.aggregate](_values)
                }
                if (_entity.datascales.useStatistics) {
                    _itemdata.statistics = {
                        current: _entity.state,
                        first: _values[0],
                        last: _values[_values.length - 1],
                        max: arrStatistics.max(_values),
                        min: arrStatistics.min(_values),
                        sum: arrStatistics.sum(_values),
                        avg: arrStatistics.mean(_values)
                    }
                }
                return _itemdata
            }
        })
        _entity.datascales.data_count = _entity.seriesdata.data.length
        return _entity.datascales.data_count
    }
    /**
     * get simple data for the entities
     * calculates the state data from the history devicestates
     * based on the aggreation methode.
     * @param {*} deviceStates
     */
    getSimpleData(deviceStates) {
        function validItem(item, ignoreZero = false) {
            return ignoreZero
                ? item != 0 && item != "unavailable" && item != "undefined" && item != "unknown"
                : item != "unavailable" && item != "undefined" && item != "unknown"
        }
        if (deviceStates && deviceStates.length) {
            deviceStates.forEach((states) => {
                const _entityId = states[0].entity_id
                const _entity = this.dataInfo.entity_items[_entityId]
                this._setEntityServiceDataInformation(_entity)
                if (_entityId) {
                    const _fld = _entity.attribute
                    const _factor = _entity.factor || 1.0
                    states = _fld
                        ? states.filter((item) => validItem(item.attributes[_fld], _entity.ignoreZero))
                        : states.filter((item) => validItem(item.state, _entity.ignoreZero))
                    const _values = states.map((item) => (_fld ? item.attributes[_fld] * _factor : item.state * _factor))
                    if (_entity.datascales.useStatistics) {
                        _itemdata.statistics = {
                            current: _entity.state,
                            first: _values[0],
                            last: _values[_values.length - 1],
                            max: arrStatistics.max(_values),
                            min: arrStatistics.min(_values),
                            sum: arrStatistics.sum(_values),
                            avg: arrStatistics.mean(_values)
                        }
                    }
                    _entity.datascales.data_count = _values.length
                    _entity.state = arrStatistics[_entity.datascales.aggregate](_values)
                }
            })
        }
        return true
    }

    /**
     * get seriesdata
     * @param {array} deviceStates from hass API call
     * @returns boolean
     */
    getSeriesdata(deviceStates, chart_type) {
        /**
         * first check the mode
         * bar, pie and doghunut can use simple data mode
         */
        if (this.datascales.mode.history == false) {
            return this.getSimpleData(deviceStates)
        }
        /**
         * validate the item state
         * @param {*} item
         * @param {*} ignoreZero
         * @returns
         */
        function validItem(item, ignoreZero = false) {
            return ignoreZero
                ? item != 0 && item != "unavailable" && item != "undefined" && item != "unknown"
                : item != "unavailable" && item != "undefined" && item != "unknown"
        }
        /**
         * dateformat
         * @param {*} datevalue
         * @param {*} mode
         * @param {*} format
         * @returns
         */
        function formatDateLabel(datevalue, mode = "label", format = "day") {
            /**
             * group format must be a valid date/time format
             * otherwise the timeseries do not work
             */
            const groupFormats = {
                millisecond: "yyyy/m/d H:M:ss.l",
                datetime: "yyyy/md/ H:M:s",
                second: "yyyy/m/d H:M:s",
                minute: "yyyy/m/d H:M:00",
                hour: "yyyy/m/d H:00:00",
                day: "yyyy/m/d",
                month: "yyyy/m/1",
                year: "yyyy/12/31"
            }
            if (mode == "group") {
                return formatdate(datevalue, groupFormats[format] || "yyyymd")
            }
            return formatdate(datevalue, format)
        }
        /**
         * interate throw all devicestates and build
         * the result based on the settings (date format, aggregation)
         */
        if (deviceStates && deviceStates.length) {
            deviceStates.forEach((states) => {
                const _entityId = states[0].entity_id
                const _entity = this.dataInfo.entity_items[_entityId]
                if (_entityId) {
                    const _fld = _entity.attribute
                    const _factor = _entity.factor || 1.0
                    this._setEntityServiceDataInformation(_entity)
                    if (!_entity.hasOwnProperty("ignoreZero")) _entity.ignoreZero = false
                    /**
                     * first build the group and returns the series data
                     */
                    let _data = []
                    states = _fld
                        ? states.filter((item) => validItem(item.attributes[_fld], _entity.ignoreZero))
                        : states.filter((item) => validItem(item.state, _entity.ignoreZero))
                    states.forEach(function (row) {
                        const _index = formatDateLabel(row.last_changed, "group", _entity.datascales.unit)
                        let _val = SERIESDEFAULT_VALUE
                        _val =
                            _fld && row.attributes && _fld in row.attributes
                                ? _safeParseFloat(row.attributes[_fld])
                                : _safeParseFloat(row.state)
                        _val = _val * _factor
                        _data[_index] = _data[_index] || []
                        _data[_index]["data"] = _data[_index]["data"] || []
                        _data[_index]["localedate"] = formatDateLabel(
                            row.last_changed,
                            "label",
                            _entity.datascales.format || _entity.datascales.unit
                        )
                        //_data[_index]["localedate"] = formatDateLabel(row.last_changed, "label", _entity.datascales.unit)
                        _data[_index]["data"].push(_safeParseFloat(_val))
                    })
                    /**
                     * build the series data based on the grouped data series
                     */
                    _entity.datascales.data_count = this._createTimeSeriesData(_entity, _data)
                }
            })
            return true
        }
    }
}
