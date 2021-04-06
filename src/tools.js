/** ----------------------------------------------------------
 
	Lovelaces chartjs - tools
  	(c) 2020,2021 Peter Siebler
  	Released under the MIT license
 
 * ----------------------------------------------------------*/

/**
 * convert color to alpha channel
 * @param {*} colorstr
 * @returns
 */
function convertColor(colorstr, alpha = 1.0) {
    if (window.Chart3 && window.Chart3.helpers && window.Chart3.helpers.color) {
        return window.Chart3.helpers.color(colorstr).alpha(alpha).rgbString() || colorstr
    }
    return colorstr
}

/**
 * show info
 * @param {*} args
 */
function logInfo(enabled, ...args) {
    if (enabled) {
        console.info(`%cLOGINFO ${new Date().toISOString()}:`, "color:white;background:#0275d8;padding:4px", ...args)
    }
}
/**
 * css helper
 * @param {string} v
 * @returns
 */
const cssAttr = function (v) {
    return typeof v == "number" ? v + "px" : v
}

// all number helpers
const _parseNumber = (n) => (n === parseInt(n) ? Number(parseInt(n)) : Number(parseFloat(n).toFixed(3)))
const roundToBase = (x = 0.0, base = 3) => Math.pow(base, Math.floor(Math.log(x) / Math.log(base)))
const _formatNumber = (locale, num) => new Intl.NumberFormat(locale).format(_parseNumber(num))
const _safeParseFloat = function (value) {
    value = parseFloat(value)
    return isFinite(value) ? +value.toFixed(3) : 0.0
}

/**
 * convert time to readable string
 * @param {*} duration
 * @returns
 */
function msToTime(duration) {
    var milliseconds = parseInt(duration % 1000),
        seconds = parseInt((duration / 1000) % 60),
        minutes = parseInt((duration / (1000 * 60)) % 60),
        hours = parseInt((duration / (1000 * 60 * 60)) % 24)
    hours = hours < 10 ? "0" + hours : hours
    minutes = minutes < 10 ? "0" + minutes : minutes
    seconds = seconds < 10 ? "0" + seconds : seconds

    return hours + ":" + minutes + ":" + seconds + "." + milliseconds
}

/**
 * fix date string for safari
 * @param {*} strDate
 * @returns
 */
function strToDate(strDate) {
    if (!strDate) return null
    const date = new Date(strDate.replace(/-|\ |\./gi, "/"))
    if (isNaN(date)) {
        console.error("Not a valid date string", strDate)
        return null
    }
    return date
}

/**
 *
 * @param {*} d
 * @param {*} locale
 * @returns
 */
function localDatetime(d, locale = "at-DE") {
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
 * check the date
 * @param {*} date
 * @returns
 */
function checkDate(date) {
    date = date || new Date()
    if (!isNaN(date) && typeof date !== "object") {
        date = new Date(date * 1000)
    } else if (typeof date === "string") {
        date = new Date(date)
    }
    return date
}

/**
 * set the local text for the day- and monthnames
 */
function getLocaleText(locale = "DE") {
    return {
        days_narrow: [...Array(7).keys()].map((day) =>
            new Intl.DateTimeFormat(locale, { weekday: "narrow" }).format(new Date(Date.UTC(2021, 5, day)))
        ),
        days_short: [...Array(7).keys()].map((day) =>
            new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(Date.UTC(2021, 5, day)))
        ),
        days_long: [...Array(7).keys()].map((day) =>
            new Intl.DateTimeFormat(locale, { weekday: "long" }).format(new Date(Date.UTC(2021, 5, day)))
        ),
        month_narrow: [...Array(12).keys()].map((month) =>
            new Intl.DateTimeFormat(locale, { month: "narrow" }).format(new Date(Date.UTC(2021, month, 1)))
        ),
        month_short: [...Array(12).keys()].map((month) =>
            new Intl.DateTimeFormat(locale, { month: "short" }).format(new Date(Date.UTC(2021, month, 1)))
        ),
        month_long: [...Array(12).keys()].map((month) =>
            new Intl.DateTimeFormat(locale, { month: "long" }).format(new Date(Date.UTC(2021, month, 1)))
        )
    }
}

/**
 * Get week number in the year.
 * @param  {Integer} [weekStart=0]  First day of the week. 0-based. 0 for Sunday, 6 for Saturday.
 * @return {Integer}                0-based number of week.
 */
Date.prototype.getWeek = function (weekStart = 1) {
    var januaryFirst = new Date(this.getFullYear(), 0, 1)
    weekStart = weekStart || 0
    return Math.floor(((this - januaryFirst) / 86400000 + januaryFirst.getDay() - weekStart) / 7)
}

/*
 * Date Format
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 * https://blog.stevenlevithan.com/archives/date-time-format
 */

var formatdate = (function () {
    const token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZWQw]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        timezoneClip = /[^-+\dA-Z]/g,
        pad = function (val, len) {
            val = String(val)
            len = len || 2
            while (val.length < len) val = "0" + val
            return val
        }
    return function (date, mask, utc) {
        const dF = formatdate
        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
            mask = date
            date = undefined
        }
        date = date ? new Date(date) : new Date()
        if (isNaN(date)) throw SyntaxError("invalid date")

        mask = String(dF.masks[mask] || mask || dF.masks["default"])
        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4)
            utc = true
        }

        if (mask == "") return date.getTime()

        const _ = utc ? "getUTC" : "get",
            d = date[_ + "Date"](),
            D = date[_ + "Day"](),
            m = date[_ + "Month"](),
            y = date[_ + "FullYear"](),
            H = date[_ + "Hours"](),
            M = date[_ + "Minutes"](),
            s = date[_ + "Seconds"](),
            L = date[_ + "Milliseconds"](),
            o = utc ? 0 : date.getTimezoneOffset(),
            flags = {
                // day
                d: d,
                dd: pad(d),
                ddd: window.localeNames.days_short[D],
                dddd: window.localeNames.days_long[D],
                // week
                W: date.getWeek(1),
                w: date.getWeek(0),
                // month
                m: m + 1,
                mm: pad(m + 1),
                mmm: window.localeNames.month_short[m],
                mmmm: window.localeNames.month_long[m],
                // year
                yy: String(y).slice(2),
                yyyy: y,
                Q: "Q" + Math.floor(((date.getMonth() / 3) % 4) + 1),
                // time hour
                h: H % 12 || 12,
                hh: pad(H % 12 || 12),
                H: H,
                HH: pad(H),
                // time minute
                M: M,
                MM: pad(M),
                // time seconds
                s: s,
                ss: pad(s),
                // time Milliseconds
                l: pad(L, 3),
                L: pad(L > 99 ? Math.round(L / 10) : L),
                // time am / pm
                t: H < 12 ? "a" : "p",
                tt: H < 12 ? "am" : "pm",
                T: H < 12 ? "A" : "P",
                TT: H < 12 ? "AM" : "PM",
                // GMT/UTC timezone
                Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + (Math.abs(o) % 60), 4)
            }

        return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1)
        })
    }
})()

/**
 * Some common format strings
 */
formatdate.masks = {
    default: "ddd, d mmmm yyyy HH:MM:ss.l",
    shortDate: "m.d.yy",
    mediumDate: "d.m.yyyy",
    longDate: "d mmmm yyyy",
    fullDate: "dddd, d mmmm yyyy",
    shortTime: "H:MM",
    mediumTime: "HH:MM:ss",
    longTime: "HH:MM:ss.L",
    isoDate: "yyyy-mm-dd",
    isoTime: "HH:MM:ss",
    isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'",
    week: "W",
    quater: "Q",
    datetime: "ddd, d mmmm yyyy HH:MM:ss",
    millisecond: "HH:MM:ss l",
    second: "HH:mm:ss l",
    minute: "HH:mm l",
    hour: "HH:mm",
    day: "ddd, d.mmm",
    month: "mmm yyyy",
    year: "yyyy"
}

/**
 * statistics get result value from array
 * based on the aggreation mode
 */
const arrStatistics = {
    max: function (array) {
        return Math.max.apply(null, array)
    },
    min: function (array) {
        return Math.min.apply(null, array)
    },
    range: function (array) {
        return arr.max(array) - arr.min(array)
    },
    midrange: function (array) {
        return arr.range(array) / 2
    },
    mean: function (array) {
        return _safeParseFloat(arrStatistics.sum(array) / array.length)
    },
    sum: function (array) {
        var num = 0
        for (var i = 0, l = array.length; i < l; i++) num += array[i]
        return _safeParseFloat(num)
    },
    last: function (array) {
        return array[array.length - 1]
    },
    first: function (array) {
        return array[0]
    }
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
                                let _name = list[key].attributes.friendly_name ? list[key].attributes.friendly_name : key
                                _name += item.name ? " " + item.name : " " + capitalize(item.attribute)
                                newItem = {
                                    entity: key,
                                    name: _name,
                                    unit: item.unit || "",
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
