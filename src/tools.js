/** ----------------------------------------------------------
 
	Lovelaces chartjs - tools
  	(c) 2020 Peter Siebler
  	Released under the MIT license
 
 * ----------------------------------------------------------*/
"use strict";

/**
 * show info
 * @param {*} args
 */
function logInfo(enabled, ...args) {
    if (enabled) console.info(new Date().toISOString(), ...args);
}

const cssAttr = function (v) {
    return typeof v == "number" ? v + "px" : v;
};

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
    if (!d) return "";
    if (!locale) locale = navigator.language || navigator.userLanguage || "en-GB";
    const date = new Date(d);
    if (isNaN(date)) return d;
    return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric"
    }).format(date);
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
                acc = {
                    ...acc,
                    [key]: value
                };
            }
        }
    }
    return acc;
}
