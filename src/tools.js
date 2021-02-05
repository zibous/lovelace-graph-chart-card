/** ----------------------------------------------------------
 
	Lovelaces chartjs - tools
  	(c) 2020 Peter Siebler
  	Released under the MIT license
 
 * ----------------------------------------------------------*/
"use strict"

/**
 * show info
 * @param {*} args
 */
function logInfo(enabled, ...args) {
    if (enabled) console.info(new Date().toISOString(), ...args)
}

const cssAttr = function (v) {
    return typeof v == "number" ? v + "px" : v
}

const _parseNumber = (n) => (n === parseInt(n) ? Number(parseInt(n)) : Number(parseFloat(n).toFixed(2)))
const _formatNumber = (locale, num) => new Intl.NumberFormat(locale).format(_parseNumber(num))
const getMin = (arr, val) => arr.reduce((min, p) => (Number(p[val]) < Number(min[val]) ? p : min), arr[0])
const getAvg = (arr, val) => arr.reduce((sum, p) => sum + Number(p[val]), 0) / arr.length
const getMax = (arr, val) => arr.reduce((max, p) => (Number(p[val]) > Number(max[val]) ? p : max), arr[0])
const arrMin = (arr) => Math.min(...arr)
const arrMax = (arr) => Math.max(...arr)
const arrSum = (arr) => arr.reduce((a, b) => a + b, 0)
const arrAvg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length

/**
 * get the date based on the locale
 * @param {*} d
 * @param {*} locale
 * options: {
        weekday: 'narrow' | 'short' | 'long',
        era: 'narrow' | 'short' | 'long',
        year: 'numeric' | '2-digit',
        month: 'numeric' | '2-digit' | 'narrow' | 'short' | 'long',
        day: 'numeric' | '2-digit',
        hour: 'numeric' | '2-digit',
        minute: 'numeric' | '2-digit',
        second: 'numeric' | '2-digit',
        timeZoneName: 'short' | 'long',

        // Time zone to express it in
        timeZone: 'Asia/Shanghai',
        // Force 12-hour or 24-hour
        hour12: true | false,

        // Rarely-used options
        hourCycle: 'h11' | 'h12' | 'h23' | 'h24',
        formatMatcher: 'basic' | 'best fit'
        }
 */
function localDatetime(d, locale) {
    if (!d) return ""
    if (!locale) locale = navigator.language || navigator.userLanguage || "en-GB"
    const date = new Date(d)
    if (isNaN(date)) return d
    return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric"
    }).format(date)
}

/**
 * Deep Merge
 * Used to merge the default and chart options, because the
 * helper.merge will not work...
 *
 * @param  {...any} sources
 * @returns combined object
 */
function deepMerge(...sources) {
    let acc = {}
    for (const source of sources) {
        if (source instanceof Array) {
            if (!(acc instanceof Array)) {
                acc = []
            }
            acc = [...acc, ...source]
        } else if (source instanceof Object) {
            for (let [key, value] of Object.entries(source)) {
                if (value instanceof Object && key in acc) {
                    value = deepMerge(acc[key], value)
                }
                acc = {
                    ...acc,
                    [key]: value
                }
            }
        }
    }
    return acc
}
/**
 * resultlist.sort(compareValues('state'));
 *
 * @param {*} key
 * @param {*} order
 */
function compareValues(key, order = "asc") {
    return function innerSort(a, b) {
        if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
            // property doesn't exist on either object
            return 0
        }
        const varA = typeof a[key] === "string" ? a[key].toUpperCase() : a[key]
        const varB = typeof b[key] === "string" ? b[key].toUpperCase() : b[key]
        let comparison = 0
        if (varA > varB) {
            comparison = 1
        } else if (varA < varB) {
            comparison = -1
        }
        return order === "desc" ? comparison * -1 : comparison
    }
}

/**
 * capitalize string
 * @param {*} s
 */
const capitalize = (s) => {
    if (typeof s !== "string") return ""
    return s.charAt(0).toUpperCase() + s.slice(1)
}

/**
 * filter entities from this._hass.states
 * @call: filter(this._hass.states,this.config_filter)
 *
 *  filter:
 *     - sensor.orangenbaum*
 *     - sensor.energie*
 *
 * @param {*} list
 * @param {*} filters
 */
function filter(list, filters) {
    /**
     * filter object
     * @param {*} stateObj
     * @param {*} pattern
     */
    function _filterName(stateObj, pattern) {
        let parts
        let attribute
        //console.log("STATEOBJECT:",stateObj,pattern)
        if (typeof pattern === "object") {
            parts = pattern["key"].split(".")
            attribute = pattern["key"]
        } else {
            parts = pattern.split(".")
            attribute = pattern
        }
        const regEx = new RegExp(`^${attribute.replace(/\*/g, ".*")}$`, "i")
        return stateObj.search(regEx) === 0
    }
    let entities = []

    filters.forEach((item) => {
        const _filters = []
        _filters.push((stateObj) => _filterName(stateObj, item.entity_filter))
        if (_filters && _filters.length) {
            Object.keys(list)
                .sort()
                .forEach((key) => {
                    Object.keys(list[key]).sort()
                    if (_filters.every((filterFunc) => filterFunc(`${key}`))) {
                        let newItem
                        if (item.attribute) {
                            // check if we can use the attribute for this entity
                            if (list[key].attributes[item.attribute]) {
                                let _name = list[key].attributes.friendly_name
                                    ? list[key].attributes.friendly_name
                                    : key
                                _name += item.name ? " " + item.name : " " + capitalize(item.attribute)
                                newItem = {
                                    entity: key,
                                    name: _name,
                                    unit: item.unit || '',
                                    state: list[key].attributes[item.attribute.toLowerCase()],
                                    attributes: list[key].attributes,
                                    last_changed: list[key].last_changed,
                                    field: item.attribute.toLowerCase()
                                }
                                newItem.attributes.friendly_name = newItem.name
                            }
                        } else {
                            // simple entity...
                            newItem = {
                                entity: key,
                                name: list[key].attributes.friendly_name ? list[key].attributes.friendly_name : key,
                                state: list[key].state,
                                attributes: list[key].attributes,
                                last_changed: list[key].last_changed
                            }
                        }
                        if (newItem) {
                            if (item.options) {
                                newItem.options = item.options
                            }
                            if (newItem.state && (item.state_min_value || item.state_max_value)) {
                                const _min = item.state_min_value || Number.MIN_VALUE
                                const _max = item.state_max || Number.MAX_VALUE
                                newItem.state = parseFloat(newItem.state)
                                if ((newItem.state - _min) * (newItem.state - _max) <= 0) {
                                    entities.push(newItem)
                                }
                            } else {
                                entities.push(newItem)
                            }
                        }
                    }
                })
        }
    })
    return entities
}
