/** ----------------------------------------------------------
 
	Lovelaces chartjs - date and time helpers
  	(c) 2020,2021 Peter Siebler
  	Released under the MIT license
 
 * ----------------------------------------------------------*/

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
 * get the localized day and month names
 * @param {str} locale
 * @returns list
 */
function localizedDayAndMonthNames(localeName = "at-DE") {
    const datetext = {
        days_short: [...Array(7).keys()].map((day) =>
            new Intl.DateTimeFormat(localeName, { weekday: "short" }).format(new Date(Date.UTC(2021, 5, day)))
        ),
        days_long: [...Array(7).keys()].map((day) =>
            new Intl.DateTimeFormat(localeName, { weekday: "long" }).format(new Date(Date.UTC(2021, 5, day)))
        ),
        month_short: [...Array(12).keys()].map((month) =>
            new Intl.DateTimeFormat(localeName, { month: "short" }).format(new Date(Date.UTC(2021, month, 1)))
        ),
        month_long: [...Array(12).keys()].map((month) =>
            new Intl.DateTimeFormat(localeName, { month: "long" }).format(new Date(Date.UTC(2021, month, 1)))
        )
    }
    return datetext
}

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

class dateHelper {
    /**
     * constructor dateHelper
     * @param {*} settings
     */
    constructor(settings) {
        settings = settings || {}
        this.locale = settings.locale || "DE"
        this.localeNames = settings.localeNames || this._getDefaultLocaleText()
        if (!settings.localeNames) this._setLocaleText()
    }

    /**
     * set the local text for the day- and monthnames
     */
    _setLocaleText() {
        this.localeNames = {
            days_short: [...Array(7).keys()].map((day) =>
                new Intl.DateTimeFormat(this.locale, { weekday: "short" }).format(new Date(Date.UTC(2021, 5, day)))
            ),
            days_long: [...Array(7).keys()].map((day) =>
                new Intl.DateTimeFormat(this.locale, { weekday: "long" }).format(new Date(Date.UTC(2021, 5, day)))
            ),
            month_short: [...Array(12).keys()].map((month) =>
                new Intl.DateTimeFormat(this.locale, { month: "short" }).format(new Date(Date.UTC(2021, month, 1)))
            ),
            month_long: [...Array(12).keys()].map((month) =>
                new Intl.DateTimeFormat(this.locale, { month: "long" }).format(new Date(Date.UTC(2021, month, 1)))
            )
        }
    }
    /**
     * get the default local text for the day- and monthnames
     * @returns
     */
    _getDefaultLocaleText() {
        return {
            days_short: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
            days_long: ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"],
            month_short: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
            month_long: [
                "Januar",
                "Februar",
                "März",
                "April",
                "Mai",
                "Juni",
                "Juli",
                "August",
                "September",
                "Oktober",
                "November",
                "Dezember"
            ]
        }
    }
    
    /**
     * simple date formatter
     * @param {*} date
     * @param {*} format
     * @returns
     */
    formatdate(date, format = "Y-m-d") {
        const groupFormats = {
            minute: "Y-m-d H:s",
            hour: "Y-m-d H:00",
            day: "Y-m-d 00:00",
            month: "Y-m-01 00:00",
            year: "Y-12-31 00:00"
        }
        format = groupFormats[format] || format || "Y-m-d"
        date = new Date(date)
        const hour24 = date.getHours()
        const hour12 = date.getHours() % 12 || 12
        const numDay = date.getDay() > 0 ? date.getDay() : 7
        const numMonth = date.getMonth()
        const parts = {
            Y: date.getFullYear().toString(),
            y: ("00" + (date.getYear() - 100)).toString().slice(-2),
            m: ("0" + (numMonth + 1)).toString().slice(-2),
            n: (numMonth + 1).toString(),
            d: ("0" + date.getDate()).toString().slice(-2),
            j: date.getDate().toString(),
            H: ("0" + hour24).toString().slice(-2),
            h: ("0" + hour12).toString().slice(-2),
            G: hour24.toString(),
            g: hour12.toString(),
            a: hour24 >= 12 && hour24 < 24 ? "pm" : "am",
            A: hour24 >= 12 && hour24 < 24 ? "PM" : "AM",
            i: ("0" + date.getMinutes()).toString().slice(-2),
            s: ("0" + date.getSeconds()).toString().slice(-2),
            w: numDay,
            N: numDay > 0 ? numDay : 7,
            D: this.localeNames.days_short[numDay-1],
            l: this.localeNames.days_long[numDay-1],
            M: this.localeNames.month_short[numMonth],
            F: this.localeNames.month_long[numMonth],
            W: this.getWeek(date)
        }
        const modifiers = Object.keys(parts).join("")
        const reDate = new RegExp("[" + modifiers + "]", "g")
        const dt = format.replace(reDate, ($0) => parts[$0])
        return dt
    }

    /**
     * get week number
     * @param {*} date
     * @returns
     */
    getWeek(date) {
        date = this._checkDate(date)
        const fstDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
        fstDay.setDate(fstDay.getDate() - ((fstDay.getDay() + 6) % 7) + 3)
        const fstD = new Date(fstDay.getFullYear(), 0, 4)
        fstD.setDate(fstD.getDate() - ((fstD.getDay() + 6) % 7) + 3)
        const ds = fstDay.getTimezoneOffset() - fstD.getTimezoneOffset()
        fstDay.setHours(fstDay.getHours() - ds)
        const weekDiff = (fstDay - fstD) / (86400000 * 7)
        return "0" + 1 + Math.floor(weekDiff).toString().slice(-2)
    }

    dateDiff(d1, d2) {
        // const daysDiff = Math.round(microSecondsDiff / (1000 * 60 * 60  * 24));
        return Math.abs(this._checkDate(d2).getTime() - this._checkDate(d1).getTime())
    }

    nextMonth(date) {
        date = this._checkDate(date)
        const nextDayOfMonth = date.getDate() + 20
        return setDate(nextDayOfMonth)
    }
    /**
     * checks if the value is a date
     * @param {*} date
     * @returns
     */
    _checkDate(date) {
        date = date || new Date()
        if (!isNaN(date) && typeof date !== "object") {
            date = new Date(date * 1000)
        } else if (typeof date === "string") {
            date = new Date(date)
        }
        return date
    }
}
