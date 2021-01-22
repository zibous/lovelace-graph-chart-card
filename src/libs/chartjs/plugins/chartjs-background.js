/*!
 * chartjs-background v0.1.0
 * https://github.com/zibous/lovelace-graph-chart-card
 * (c) 2020 Peter Siebler
 * Released under the MIT License
 */
;(function (global, factory) {
    typeof exports === "object" && typeof module !== "undefined"
        ? (module.exports = factory())
        : typeof define === "function" && define.amd
        ? define(factory)
        : ((global = global || self), (global["chartjs-background"] = factory()))
})(this, function () {
    "use strict"
    /**
     * plugin chart background
     */
    var plugin_chartbackground = {
        id: "chardbackground",
        beforeDraw: function (chart) {
            if (chart.config.options.chartArea && chart.config.options.chartArea.backgroundColor) {
                const chartArea = chart.chartArea
                const ctx = chart.ctx
                ctx.save()
                ctx.fillStyle = chart.config.options.chartArea.backgroundColor
                ctx.fillRect(
                    chartArea.left,
                    chartArea.top,
                    chartArea.right - chartArea.left,
                    chartArea.bottom - chartArea.top
                )
                ctx.restore()
            }
        }
    }
    return plugin_chartbackground
})
