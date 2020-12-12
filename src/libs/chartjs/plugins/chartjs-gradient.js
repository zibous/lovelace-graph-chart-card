/*!
 * chartjs-gradient v0.1.0
 * https://github.com/zibous/lovelace-graph-chart-card
 * (c) 2020 Peter Siebler
 * Released under the MIT License
 */
(function (global, factory) {
    typeof exports === "object" && typeof module !== "undefined"
        ? (module.exports = factory())
        : typeof define === "function" && define.amd
        ? define(factory)
        : ((global = global || self), (global["chartjs-gradient"] = factory()));
})(this, function () {
    "use strict";

    /**
     * checks if the value is a string
     * @param {*} value
     */
    const isString = (value) => typeof value === "string";
    const helpers = Chart.helpers;
    let thegradient = null;

    /**
     * The createLinearGradient() method is specified by four parameters
     * to build the gradient colors for the chart. Used for charts with
     * series data like line, bar..
     * 
     * based on the https://github.com/kurkle/chartjs-plugin-gradient
     * 
     * @param {*} ctx
     * @param {*} axis
     * @param {*} area
     * @param {*} colors
     */
    function createGradient(ctx, axis, area, colors) {
        if (area.bottom && area.top && area.left && area.right) {
            const _gradient =
                axis === "y"
                    ? ctx.createLinearGradient(0, area.bottom, 0, area.top)
                    : ctx.createLinearGradient(area.left, 0, area.right, 0);
            if (colors && colors.length == 1) {
                _gradient.addColorStop(0, helpers.color(color).alpha(0.2).rgbString());
                _gradient.addColorStop(0.3, helpers.color(color).alpha(0.4).rgbString());
                _gradient.addColorStop(0.5, helpers.color(color).alpha(0.6).rgbString());
                _gradient.addColorStop(1, helpers.color(color).alpha(1.0).rgbString());
            } else {
                const _step = 1 / (colors.length - 1);
                Object.entries(colors).forEach(([, value], index) => {
                    _gradient.addColorStop(_step * index, value);
                });
            }
            return _gradient;
        }
    }

    /**
     * create gradient for simple pie and bar charts
     * not finish... do not work
     * @param {*} ctx
     * @param {*} type
     * @param {*} area
     * @param {*} colors
     */
    function createSimpleGradient(ctx, type, area, colors) {
        let _gradients = [];
        switch (type.toLowerCase()) {
            case "pie":
            case "doughnut":
                if (colors && colors.length && isString(colors[0])) {
                    const centerX = (area.left + area.right) / 2;
                    const centerY = (area.top + area.bottom) / 2;
                    const r = 1; // ??? Math.min((area.right - area.left) / 2, (area.bottom - area.top) / 2);
                    Object.entries(colors).forEach(([, color], index) => {
                        let _piegradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, r);
                        _piegradient.addColorStop(0, helpers.color(color).alpha(0.4).rgbString());
                        _piegradient.addColorStop(1, helpers.color(color).alpha(1.0).rgbString());
                        _gradients.push(_piegradient);
                    });
                    return _gradients;
                }
            case "bar":
                Object.entries(colors).forEach(([, color], index) => {
                    if (isString(color)) {
                        let _bargradient = ctx.createLinearGradient(0, area.bottom, 0, area.top);
                        _bargradient.addColorStop(0, helpers.color(color).alpha(1.0).rgbString());
                        _bargradient.addColorStop(0.5, helpers.color(color).alpha(0.5).rgbString());
                        _bargradient.addColorStop(1, helpers.color(color).alpha(1.0).rgbString());
                        _gradients.push(_bargradient);
                    } else {
                        _gradients.push(color);
                    }
                });
                return _gradients;

            case "polarArea":
            case "radar":
            case "bubble":
            case "bubble":
            default:
                // HOW TO DO ??
                break;
        }
        return colors;
    }

    /**
     * plugin gradient
     */
    var plugin_gradient = {
        id: "gradient",
        beforeDatasetsUpdate(chart) {
            const ctx = chart.ctx;
            const area = chart.chartArea;
            if (!area) {
                return null;
            }
            if (chart.options.gradientcolor && chart.options.gradientcolor.type !== undefined) {
                // simple graph pie, bar check o.k, create the gradients
                const _chartType = chart.data.datasets[0].type || chart.config.type;
                if (thegradient === null) {
                    const colors = chart.data.datasets[0].backgroundColor;
                    thegradient = createSimpleGradient(ctx, _chartType, area, colors);
                    chart.data.datasets[0].backgroundColor = thegradient;
                }
            } else {
                // series data, create the gradients for bar, line...
                chart.data.datasets.forEach((dataset, i) => {
                    const gradient = dataset.gradient;
                    if (gradient && area) {
                        Object.keys(gradient).forEach((prop) => {
                            const { axis, colors } = gradient[prop];
                            //const meta = chart.getDatasetMeta(i);
                            if (colors && colors.length) {
                                thegradient = createGradient(ctx, axis, area, colors);
                                dataset.backgroundColor = thegradient;
                            }
                        });
                    }
                });
            }
        }
    };
    return plugin_gradient;
});
