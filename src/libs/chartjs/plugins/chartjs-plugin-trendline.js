/*!
 * chartjs-plugin-trendline.js
 * Version: 0.1.1
 *
 * Copyright 2017 Marcus Alsterfjord
 * Released under the MIT license
 * https://github.com/Makanz/chartjs-plugin-trendline/blob/master/README.md
 * modified for chartjs 3.1.1 Peter Siebler
 */

/**
 * line fitter object
 */
function LineFitter() {
    this.count = 0
    this.sumX = 0
    this.sumX2 = 0
    this.sumXY = 0
    this.sumY = 0
}
/**
 * line fitter object methods
 */
LineFitter.prototype = {
    add: function (x, y) {
        this.count++
        this.sumX += x
        this.sumX2 += x * x
        this.sumXY += x * y
        this.sumY += y
    },
    project: function (x) {
        const det = this.count * this.sumX2 - this.sumX * this.sumX
        const offset = (this.sumX2 * this.sumY - this.sumX * this.sumXY) / det
        const scale = (this.count * this.sumXY - this.sumX * this.sumY) / det
        return offset + x * scale
    }
}
/**
 * add fitter
 * @param {*} datasetMeta 
 * @param {*} ctx 
 * @param {*} dataset 
 * @param {*} xScale 
 * @param {*} yScale 
 */
function addFitter(datasetMeta, ctx, dataset, xScale, yScale) {
    if (dataset && dataset.data && dataset.data.length) {
        const scaleisTime = xScale.options.type === "time",
            lastIndex = dataset.data.length - 1,
            startPos = datasetMeta.data[0].x,
            endPos = datasetMeta.data[lastIndex].x,
            fitter = new LineFitter()
        dataset.data.forEach(function (data, index) {
            fitter.add(index, scaleisTime ? data.y : data)
        })
        ctx.lineWidth = dataset.trendlineLinear.lineStyle || "solid"
        if ((dataset.trendlineLinear.lineStyle || "solid") === "dotted") {
            ctx.setLineDash([2, 3])
        }
        ctx.beginPath()
        ctx.moveTo(startPos, yScale.getPixelForValue(fitter.project(0)))
        ctx.lineTo(endPos, yScale.getPixelForValue(fitter.project(lastIndex)))
        ctx.strokeStyle = dataset.trendlineLinear.color || dataset.borderColor || "rgba(255, 0, 0, 0.85)"
        ctx.stroke()
    }
}
/**
 * simple trendline plugin for chartjs
 */
window.plugin_trendline = {
    id: "trendline",
    afterDatasetsDraw: function (chart) {
        const ctx = chart.ctx
        if (ctx) {
            chart.data.datasets.forEach(function (dataset, index) {
                if (dataset.trendlineLinear) {
                    const xScale = chart.scales["x"] || chart.scales[dataset.xAxisID]
                    const yScale = chart.scales["y"] || chart.scales[dataset.yAxisID]
                    var datasetMeta = chart.getDatasetMeta(index)
                    addFitter(datasetMeta, ctx, dataset, xScale, yScale)
                }
            })
            ctx.setLineDash([])
        }
    }
}
