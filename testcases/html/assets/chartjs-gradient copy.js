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
    
    var helpers = Chart.helpers;

    /**
     * get the rgba color for the gradient
     * @param {*} color
     * @param {*} opacity
     */
    function getRgbaColor(color, opacity) {
        opacity = opacity * 0.01;
        if (color.substr(0, 5) == "rgba(") {
            const rgba = color.match(/^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d*(?:\.\d+)?)\)$/);
            return rgba ? `rgba(${rgba[1]},${rgba[2]},${rgba[3]},${opacity})` : color;
        }
        if (color.substr(0, 4) == "rgb(") {
            const rgb = color.match(/^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/);
            return rgb ? `rgba(${rgb[1]},${rgb[2]},${rgb[3]},${opacity})` : color;
        }
        if (color.charAt(0) === "#") {
            const hex = color.replace("#", "");
            if (hex.length === 6 || hex.length === 3) {
                color = hex.length === 3 ? color + hex : color;
                const [r, g, b] = color.match(/\w\w/g).map((x) => parseInt(x, 16));
                return `rgba(${r},${g},${b},${opacity})`;
            }
            return color;
        }
        return color;
    }
    /**
     * The createLinearGradient() method is specified by four parameters
     * to build the gradient colors for the chart
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
                _gradient.addColorStop(0, getRgbaColor(colors[0], 20));
                _gradient.addColorStop(0.3, getRgbaColor(colors[0], 40));
                _gradient.addColorStop(0.5, getRgbaColor(colors[0], 60));
                _gradient.addColorStop(1, getRgbaColor(colors[0], 100));
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
     * @param {*} ctx
     * @param {*} type
     * @param {*} area
     * @param {*} colors
     */
    function backgroundGradient(ctx, type, area, colors) {
        let _gradients = [];
        switch (type.toLowerCase()) {
            case "pie":
                if (colors && colors.length && isString(colors[0])) {
                    const centerX = (area.left + area.right) / 2;
                    const centerY = (area.top + area.bottom) / 2;
                    const r = 1; // ??? Math.min((area.right - area.left) / 2, (area.bottom - area.top) / 2);
                    Object.entries(colors).forEach(([, color], index) => {
                        const _piegradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, r);
                        _piegradient.addColorStop(0, getRgbaColor(color, 40));
                        _piegradient.addColorStop(1, getRgbaColor(color, 100));
                        _gradients.push(_piegradient);
                    });
                    return _gradients;
                }
            case "bar":
                if (colors && colors.length && isString(colors[0])) {
                    Object.entries(colors).forEach(([, color], index) => {
                        const _bargradient = ctx.createLinearGradient(0, area.bottom, 0, area.top);
                        _bargradient.addColorStop(0, getRgbaColor(color, 100));
                        _bargradient.addColorStop(0.5, getRgbaColor(color, 50));
                        _bargradient.addColorStop(1, getRgbaColor(color, 25));
                        _gradients.push(_bargradient);
                    });
                    return _gradients;
                }
            default:
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
            console.log();
            const ctx = chart.ctx;
            const area = chart.chartArea;
            if (chart.options.gradientcolor && chart.options.gradientcolor.type !== undefined) {
                // simple graph pie, bar check o.k, create the gradients
                chart.data.datasets.forEach((dataset, i) => {
                    const _chartType = dataset.type || chart.config.type;
                    const colors = chart.data.datasets[i].backgroundColor;
                    console.log(_chartType, colors);
                    chart.data.datasets[0].backgroundColor = backgroundGradient(ctx, _chartType, area, colors);
                });
            } else {
                // series data, create the gradients for bar, line...
                chart.data.datasets.forEach((dataset, i) => {
                    const _chartType = dataset.type || chart.config.type;
                    switch (_chartType) {
                        case "line":
                        case "radar":
                        case "scatter":
                            // dataset.backgroundColor = ''
                            console.log(_chartType, helpers.color(color).alpha(0.5).rgbString())

                            break;
                        // For doughnut and pie chart, backgroundColor is set to an array of colors
                        case "doughnut":
                        case "pie":
                        case "polarArea":
                            // For the other chart, only backgroundColor is set
                            dataset.backgroundColor = dataset.data.map(function (data, dataIndex) {
                                console.log(_chartType, dataIndex,data)
                            });
                            break;
                        default:
                            console.log(_chartType, dataset.backgroundColor)
                            break;
                    }
                    const gradient = dataset.gradient;
                    if (gradient && area) {
                        Object.keys(gradient).forEach((prop) => {
                            const { axis, colors } = gradient[prop];
                            const meta = chart.getDatasetMeta(i);
                            if (colors && colors.length) {
                                const _gradient = createGradient(ctx, axis, area, colors);
                                if (_gradient) dataset.backgroundColor = _gradient;
                            }
                        });
                    }
                });
            }
        },
        afterUpdate: function (chart) {
            chart.data.datasets.forEach((dataset, i) => {});
        }
    };
    return plugin_gradient;
});
