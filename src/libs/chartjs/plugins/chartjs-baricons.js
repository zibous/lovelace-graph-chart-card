/*!
 * chartjs-bar icons v0.1.0
 * https://github.com/zibous/lovelace-graph-chart-card
 * (c) 2020 Peter Siebler
 * Released under the MIT License
 */
;(function (global, factory) {
    typeof exports === "object" && typeof module !== "undefined"
        ? (module.exports = factory())
        : typeof define === "function" && define.amd
        ? define(factory)
        : ((global = global || self), (global["chartjs-baricons"] = factory()))
})(this, function () {
    "use strict"
    var plugin_baricons = {
        id: "baricons",
        afterDatasetsDraw(chartInstance, easing) {
            var ctx = chartInstance.ctx
            const y1 = chartInstance.chartArea.height - 24
            chartInstance.data.datasets.forEach(function (dataset) {
                for (var i = 0; i < dataset.data.length; i++) {
                    if (!dataset.pointStyle) {
                        continue
                    }
                    const model = {
                        index: i,
                        x: chartInstance.getDatasetMeta(0).data[i].x,
                        y: chartInstance.getDatasetMeta(0).data[i].base - y1,
                        width: chartInstance.getDatasetMeta(0).data[i].width,
                        base: chartInstance.getDatasetMeta(0).data[i].base,
                        icons: dataset.pointStyle || null,
                        color: dataset.color || Chart.defaults.color,
                        value: chartInstance.data.datasets[0].data[i].toLocaleString(Chart.defaults.locale || "de-DE"),
                        unit: chartInstance.data.datasets[0].unit || ""
                    }
                    if (model.icons) {
                        ctx.textAlign = "start"
                        ctx.font = Chart.helpers.fontString(18, "normal", Chart.defaults.font.family)
                        ctx.textBaseline = "middle"
                        ctx.fillStyle = model.color
                        ctx.save()
                        // render the icon text
                        ctx.fillText(model.icons[i], model.x - 9, model.y)
                        ctx.font = Chart.helpers.fontString(14, "normal", Chart.defaults.font.family)
                        ctx.fillStyle = Chart.defaults.color
                        // render the value
                        ctx.fillText(model.value + " " + model.unit, model.x - 18, model.base - 24)
                        ctx.restore()
                    }
                }
            })
        }
    }
    return plugin_baricons
})
