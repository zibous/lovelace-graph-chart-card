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
        : ((global = global || self), (global["chartjs-gradient2"] = factory()));
})(this, function () {
    "use strict";

    const helpers = Chart.helpers;
    const areaIsValid = (area) => area && area.right > area.left && area.bottom > area.top;

    function createGradient(ctx, axis, area) {
        return axis === "y"
            ? ctx.createLinearGradient(0, area.bottom, 0, area.top)
            : ctx.createLinearGradient(area.left, 0, area.right, 0);
    }

    function addColors(gradient, scale, colors) {
        for (const value of Object.keys(colors)) {
            const pixel = scale.getPixelForValue(value);
            const stop = scale.getDecimalForPixel(pixel);
            if (isFinite(pixel) && isFinite(stop)) {
                gradient.addColorStop(
                    Math.max(0, Math.min(1, stop)),
                    helpers.color(colors[value]).alpha(0.95).rgbString()
                );
            }
        }
    }

    var plugin_gradient = {
        id: "gradient2",
        beforeDatasetsUpdate(chart) {
            const area = chart.chartArea;
            if (!areaIsValid(area)) {
                return;
            }
            const ctx = chart.ctx;
            const datasets = chart.data.datasets;
            for (let i = 0; i < datasets.length; i++) {
                const dataset = datasets[i];
                const gradient = dataset.gradient;
                if (gradient) {
                    const meta = chart.getDatasetMeta(i);
                    for (const [key, options] of Object.entries(gradient)) {
                        const { axis, colors } = options;
                        const scale = meta[axis + "Scale"];
                        const value = createGradient(ctx, axis, area);
                        addColors(value, scale, colors);
                        dataset[key] = meta.dataset.options[key] = value;
                    }
                }
            }
        }
    };
    return plugin_gradient;
});
