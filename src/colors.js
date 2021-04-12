/** ----------------------------------------------------------
 
	Lovelaces chartjs - colors
  	(c) 2021 Peter Siebler
  	Released under the MIT license
 
 * ----------------------------------------------------------*/
const DEFAULT_COLORS = [
    "rgba(237,212,0,0.85)",
    "rgba(115,210,22,0.85)",
    "rgba(245,121,0,0.85)",
    "rgba(52,101,164,0.85)",
    "rgba(89,161,79,0.85)",
    "rgba(182,153,45,0.85)",
    "rgba(73,152,148,0.85)",
    "rgba(225,87,89,0.85)",
    "rgba(121,112,110,0.85)",
    "rgba(211,114,149,0.85)",
    "rgba(176,122,161,0.85)",
    "rgba(157,118,96,0.85)",
    "rgba(52,152,219,0.85)",
    "rgba(46,204,113,0.85)",
    "rgba(241,196,15,0.85)",
    "rgba(155,89,182,0.85)",
    "rgba(26,188,156,0.85)",
    "rgba(39,174,96,0.85)",
    "rgba(41,128,185,0.85)",
    "rgba(142,68,173,0.85)",
    "rgba(44,62,80,0.85)",
    "rgba(230,126,34,0.85)",
    "rgba(231,76,60,0.85)",
    "rgba(236,240,241,0.85)",
    "rgba(149,165,166,0.85)",
    "rgba(243,156,18,0.85)",
    "rgba(211,84,0,0.85)",
    "rgba(192,57,43,0.85)",
    "rgba(229,28,35,0.85)",
    "rgba(205,220,57,0.85)",
    "rgba(52,152,219,0.85)",
    "rgba(231,76,60,0.85)",
    "rgba(155,89,182,0.85)",
    "rgba(241,196,15,0.85)",
    "rgba(46,204,113,0.85)",
    "rgba(26,188,156,0.85)",
    "rgba(52,73,94,0.85)",
    "rgba(230,126,34,0.85)",
    "rgba(127,140,141,0.85)",
    "rgba(39,174,96,0.85)",
    "rgba(41,128,185,0.85)",
    "rgba(142,68,173,0.85)"
]

const COLOR_RADARCHART = "rgba(41, 182, 246, 0.45)"
const COLOR_BUBBLECHAT = "rgba(255, 152, 0, 0.685)"
/**
 * get random color from DEFAULT_COLORS
 */
// var randomColor = DEFAULT_COLORS[Math.floor(Math.random()*DEFAULT_COLORS.length)];
const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16)


/**
 * radar gratient
 * @param {*} context
 * @param {*} c1
 * @param {*} c2
 * @param {*} c3
 * @returns
 */
 function createRadialGradient3(context, c1, c2, c3) {
    const chartArea = context.chart.chartArea
    if (!chartArea) {
        // This case happens on initial chart load
        return null
    }

    const chartWidth = chartArea.right - chartArea.left
    const chartHeight = chartArea.bottom - chartArea.top
    if (width !== chartWidth || height !== chartHeight) {
        cache.clear()
    }
    var gradient = cache.get(c1 + c2 + c3)
    if (!gradient) {
        // Create the gradient because this is either the first render
        // or the size of the chart has changed
        width = chartWidth
        height = chartHeight
        const centerX = (chartArea.left + chartArea.right) / 2
        const centerY = (chartArea.top + chartArea.bottom) / 2
        const r = Math.min((chartArea.right - chartArea.left) / 2, (chartArea.bottom - chartArea.top) / 2)
        var ctx = context.chart.ctx
        gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, r)
        gradient.addColorStop(0, c1)
        gradient.addColorStop(0.5, c2)
        gradient.addColorStop(1, c3)
        cache.set(c1 + c2 + c3, gradient)
    }

    return gradient
}
