/** --------------------------------------------------------------------

  Custom Chart Card 
  based on https://github.com/sdelliot/pie-chart-card

  chartjs:    https://www.chartjs.org/
  gradient:   https://github.com/kurkle/chartjs-plugin-gradient#readme

  (c) 2021 Peter Siebler
  Released under the MIT license

/** -------------------------------------------------------------------*/
"use strict"

/**
 * Chart.js  and used plugins, production use min.js
 */
import "/hacsfiles/chart-card/chart-min.js?module"

/**
 * render the app-info for this custom card
 */
const appinfo = {
    name: "✓ custom:chart-card ",
    app: "chart-card",
    version: "v2.1.2/v3.1.1",
    chartjs: Chart.version || "v3.1.1",
    assets: "/hacsfiles/chart-card/assets/",
    github: "https://github.com/zibous/lovelace-graph-chart-card"
}
console.info(
    `%c ${appinfo.name}          %c ▪︎▪︎▪︎▪︎ ${appinfo.version}  ▪︎▪︎▪︎▪︎`,
    "color:#FFFFFF; background:#3498db;display:inline-block;font-size:12px;font-weight:300;padding: 6px 0 6px 0",
    "color:#2c3e50; background:#ecf0f1;display:inline-block;font-size:12px;font-weight:300;padding: 6px 0 6px 0"
)
/**
 * all for chartjs handling
 */
const CT_DATAPOINTSTYLE = ["circle", "triangle", "rectRounded", "rect", "rectRot", "cross", "star", "line", "dash"]
const CT_CHARTGRIDLINES = ["bar", "line", "bubble", "scatter"]
const CT_NOSHOWSTATES = ["bubble", "scatter"]
const CT_BARCHARTS = ["bar", "horizontalbar"]
const CT_SHOWLEGEND = ["pie", "doughnut", "polararea", "line"]
const CT_AVIABLETYPES = ["line", "radar", "bar", "horizontalbar", "pie", "doughnut", "polararea", "bubble", "scatter"]
const CT_DATASCALEMODES = {
    disabled: { history: false, timescale: false, timeaxis: false, multiseries: false },
    category: { history: true, timescale: true, timeaxis: false, multiseries: false },
    time: { history: true, timescale: true, timeaxis: true, multiseries: false },
    // chart defaults
    bar: { history: false, timescale: false, timeaxis: false, multiseries: false },
    horizontalbar: { history: false, timescale: false, timeaxis: false, multiseries: false },
    line: { history: true, timescale: true, timeaxis: true, multiseries: false },
    // multiline charts
    pie: { history: false, timescale: false, timeaxis: false, multiseries: true },
    doughnut: { history: false, timescale: false, timeaxis: false, multiseries: true },
    // simple charts
    polararea: { history: false, timescale: false, timeaxis: false, multiseries: false },
    scatter: { history: false, timescale: false, timeaxis: false, multiseries: false },
    radar: { history: false, timescale: false, timeaxis: false, multiseries: false },
    bubble: { history: false, timescale: false, timeaxis: false, multiseries: false }
}

const LOADERFILES = [
    "audio",
    "ball-triangle",
    "bars",
    "circles",
    "grid",
    "hearts",
    "oval",
    "pfuff",
    "rings",
    "spinning-circles",
    "tail-spin",
    "three-dots"
]
const DSC_UNITS = ["day", "second", "minute", "hour", "month", "year"]
const DSC_RANGES = ["last", "max", "min", "range", "midrange", "mean", "sum", "first"]
const API_DATAMODE = {
    history: 1,
    statemode: 2,
    database: 3
}
const SERIESDEFAULT_VALUE = 0.0 // default value if missing data
const TRANSFORM_MODE = {
    statebased: 1, // entity.state based on aggregation
    datalabel: 2, // data.array label.array
    seriesdata: 3 // data.x and data.y
}
// "2021-04-14T15:44:47.212168+00:00"
const DATEFILTERS = {
    year: { digits: 4, format: "yyyy" },
    month: { digits: 7, format: "yyyy-mm"},
    day: { digits: 10, format: "yyyy-mm-dd" },
    hour: { digits: 13, format: "yyyy-mm-dd H" },
    minute: { digits: 16, format: "yyyy-mm-dd H:M" },
    second: { digits: 19, format: "yyyy-mm-dd H:M:s" },
    millisecond: { digits: 23, format: "yyyy-mm-dd H:M:s.l" }
}

/**
 * set the default setting for the cart
 * @param {*} theme
 */
function setChartDefaults(theme) {
    if (window.Chart3 && window.Chart3.defaults) {
        if (window.Chart3.defaults.theme && theme.theme == window.Chart3.defaults.theme) return

        window.Chart3.defaults.theme = theme.theme
        window.Chart3.defaults.responsive = true
        window.Chart3.defaults.maintainAspectRatio = false
        window.Chart3.defaults.hoverOffset = 8
        if (!theme.useAnimations) window.Chart3.defaults.animation = 0

        window.Chart3.defaults.locale = theme.locale
        window.localeNames = getLocaleText(window.Chart3.defaults.locale)

        window.Chart3.defaults.font.family = theme.font
        window.Chart3.defaults.color = convertColor(theme.fontColor)

        window.Chart3.defaults.layout.padding.top = theme.padding.top || 0
        window.Chart3.defaults.layout.padding.bottom = theme.padding.bottom || 0
        window.Chart3.defaults.layout.padding.left = theme.padding.left || 0
        window.Chart3.defaults.layout.padding.right = theme.padding.right || 0

        window.Chart3.defaults.plugins.legend.labels.color = convertColor(theme.fontColor)
        window.Chart3.defaults.plugins.legend.position = "top"
        window.Chart3.defaults.plugins.legend.labels.usePointStyle = true
        window.Chart3.defaults.plugins.legend.labels.boxWidth = 8
        window.Chart3.defaults.plugins.legend.show = false

        window.Chart3.defaults.plugins.tooltip.backgroundColor = convertColor(theme.tooltipsBackground)
        window.Chart3.defaults.plugins.tooltip.titleColor = convertColor(theme.tooltipsFontColor)
        window.Chart3.defaults.plugins.tooltip.bodyColor = convertColor(theme.tooltipsFontColor)
        window.Chart3.defaults.plugins.tooltip.footerColor = convertColor(theme.tooltipsFontColor)
        window.Chart3.defaults.plugins.tooltip.enabled = true

        window.Chart3.defaults.elements.arc.borderWidth = 0
        window.Chart3.defaults.elements.line.fill = false
        window.Chart3.defaults.elements.line.tension = 0.225

        window.Chart3.defaults.elements.point.borderWidth = 0
        window.Chart3.defaults.elements.point.hoverRadius = 8
        window.Chart3.defaults.elements.point.hitRadius = 8

        window.Chart3.defaults.scale.grid.drawBorder = true
        window.Chart3.defaults.scale.grid.borderWidth = parseFloat((theme.gridLineWidth * 1.1).toFixed(3)) || 1.0

        window.Chart3.defaults.scale.grid.color = convertColor(theme.gridlineColor, 0.8)
        window.Chart3.defaults.scale.grid.lineWidth = theme.gridLineWidth
        window.Chart3.defaults.scale.grid.borderDash = theme.borderDash

        window.Chart3.defaults.scale.grid.lineWidth = (ctx) => (ctx.index === 0 ? 0 : theme.gridLineWidth || 1.0)
        window.Chart3.defaults.scale.grid.borderColor = convertColor(theme.zeroLineColor)

        window.Chart3.defaults.scale.alignToPixels = true
        window.Chart3.defaults.scales.radialLinear.ticks.backdropColor = "transparent"

        if (window.gradient) window.Chart3.register(window.gradient)
    }
}
