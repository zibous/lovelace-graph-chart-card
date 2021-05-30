/*!
 * chartjs-plugin-trendline.js
 * Version: 0.2.2
 *
 * Copyright 2020 Marcus Alsterfjord
 * Released under the MIT license
 * https://github.com/Makanz/chartjs-plugin-trendline/blob/master/README.md
 *
 * Mod by: vesal: accept also xy-data so works with scatter
 * 
 * 
     datasets: [{ 
        data: [86,114,106,106,107,111,133,221,783,2478],
        label: "Africa",
        borderColor: "rgb(255, 0, 0)",
        fill: false,
        trendlineLinear: {
            color: "#3e95cd",
            lineStyle: "line",
            width: 1
        }
    }

 */
;(function (global, factory) {
    typeof exports === "object" && typeof module !== "undefined"
        ? (module.exports = factory())
        : typeof define === "function" && define.amd
        ? define(factory)
        : ((global = global || self), (global["chartjs-background"] = factory()))
})(this, function () {
    "use strict"

    var pluginTrendlineLinear = {
        id: "trendlineLinear",
        afterDraw: function (chartInstance) {
            var yScale
            var xScale
            for (var axis in chartInstance.scales) {
                if (axis[0] == "x") xScale = chartInstance.scales[axis]
                else yScale = chartInstance.scales[axis]
                if (xScale && yScale) break
            }
            var ctx = chartInstance.chart.ctx
            chartInstance.data.datasets.forEach(function (dataset, index) {
                if (dataset.trendlineLinear && chartInstance.isDatasetVisible(index) && dataset.data.length != 0) {
                    var datasetMeta = chartInstance.getDatasetMeta(index)
                    addFitter(datasetMeta, ctx, dataset, xScale, chartInstance.scales[datasetMeta.yAxisID])
                }
            })
            ctx.setLineDash([])
        }
    }

    function addFitter(datasetMeta, ctx, dataset, xScale, yScale) {
        var style = dataset.trendlineLinear.style || dataset.borderColor
        var lineWidth = dataset.trendlineLinear.width || dataset.borderWidth
        var lineStyle = dataset.trendlineLinear.lineStyle || "solid"

        style = style !== undefined ? style : "rgba(169,169,169, .6)"
        lineWidth = lineWidth !== undefined ? lineWidth : 3

        var fitter = new LineFitter()
        var lastIndex = dataset.data.length - 1
        var startPos = datasetMeta.data[0]._model.x
        var endPos = datasetMeta.data[lastIndex]._model.x

        var xy = false
        if (dataset.data && typeof dataset.data[0] === "object") xy = true

        dataset.data.forEach(function (data, index) {
            if (data == null) return

            if (xScale.options.type === "time") {
                var x = data.x != null ? data.x : data.t
                fitter.add(new Date(x).getTime(), data.y)
            } else if (xy) {
                fitter.add(data.x, data.y)
            } else {
                fitter.add(index, data)
            }
        })

        var x1 = xScale.getPixelForValue(fitter.minx)
        var x2 = xScale.getPixelForValue(fitter.maxx)
        var y1 = yScale.getPixelForValue(fitter.f(fitter.minx))
        var y2 = yScale.getPixelForValue(fitter.f(fitter.maxx))
        if (!xy) {
            x1 = startPos
            x2 = endPos
        }

        var drawBottom = datasetMeta.controller.chart.chartArea.bottom
        var chartWidth = datasetMeta.controller.chart.width

        if (y1 > drawBottom) {
            // Left side is below zero
            var diff = y1 - drawBottom
            var lineHeight = y1 - y2
            var overlapPercentage = diff / lineHeight
            var addition = chartWidth * overlapPercentage

            y1 = drawBottom
            x1 = x1 + addition
        } else if (y2 > drawBottom) {
            // right side is below zero
            var diff = y2 - drawBottom
            var lineHeight = y2 - y1
            var overlapPercentage = diff / lineHeight
            var subtraction = chartWidth - chartWidth * overlapPercentage

            y2 = drawBottom
            x2 = chartWidth - (x2 - subtraction)
        }
        ctx.lineWidth = lineWidth
        if (lineStyle === "dotted") {
            ctx.setLineDash([2, 3])
        }
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = style
        ctx.stroke()
    }

    function LineFitter() {
        this.count = 0
        this.sumX = 0
        this.sumX2 = 0
        this.sumXY = 0
        this.sumY = 0
        this.minx = 1e100
        this.maxx = -1e100
    }

    LineFitter.prototype = {
        add: function (x, y) {
            x = parseFloat(x)
            y = parseFloat(y)
            this.count++
            this.sumX += x
            this.sumX2 += x * x
            this.sumXY += x * y
            this.sumY += y
            if (x < this.minx) this.minx = x
            if (x > this.maxx) this.maxx = x
        },
        f: function (x) {
            x = parseFloat(x)
            var det = this.count * this.sumX2 - this.sumX * this.sumX
            var offset = (this.sumX2 * this.sumY - this.sumX * this.sumXY) / det
            var scale = (this.count * this.sumXY - this.sumX * this.sumY) / det
            return offset + x * scale
        }
    }
    return pluginTrendlineLinear
})
