/*!
 * chartjs-plugin-autocolors v0.0.2
 * https://github.com/kurkle/chartjs-plugin-autocolors#readme
 * (c) 2020 Jukka Kurkela
 * Released under the MIT License
 */
(function (global, factory) {
	typeof exports === "object" && typeof module !== "undefined"
		? (module.exports = factory())
		: typeof define === "function" && define.amd
		? define(factory)
		: ((global = global || self),
		  (global["chartjs-plugin-autocolors"] = factory()));
})(this, function () {
	"use strict";

	/*!
	 * @kurkle/color v0.1.9
	 * https://github.com/kurkle/color#readme
	 * (c) 2020 Jukka Kurkela
	 * Released under the MIT License
	 */

	function round(v) {
		return (v + 0.5) | 0;
	}
	const lim = (v, l, h) => Math.max(Math.min(v, h), l);
	function n2b(v) {
		return lim(round(v * 255), 0, 255);
	}
	function b2n(v) {
		return lim(round(v / 2.55) / 100, 0, 1);
	}
	function rgbString(v) {
		return (
			v &&
			(v.a < 255
				? `rgba(${v.r}, ${v.g}, ${v.b}, ${b2n(v.a)})`
				: `rgb(${v.r}, ${v.g}, ${v.b})`)
		);
	}
	function hsv2rgbn(h, s, v) {
		const f = (n, k = (n + h / 60) % 6) =>
			v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
		return [f(5), f(3), f(1)];
	}
	function calln(f, a, b, c) {
		return (Array.isArray(a) ? f(a[0], a[1], a[2]) : f(a, b, c)).map(n2b);
	}
	function hsv2rgb(h, s, v) {
		return calln(hsv2rgbn, h, s, v);
	}

	function* hueGen() {
		yield 0;
		for (let i = 1; i < 10; i++) {
			const d = 1 << i;
			for (let j = 1; j <= d; j += 2) {
				yield j / d;
			}
		}
	}

	function* colorGen() {
		const hue = hueGen();
		let h = hue.next();
		while (!h.done) {
			let rgb = hsv2rgb(Math.round(h.value * 360), 0.6, 0.8);
			yield {
				background: rgbString({ r: rgb[0], g: rgb[1], b: rgb[2], a: 192 }),
				border: rgbString({ r: rgb[0], g: rgb[1], b: rgb[2], a: 144 }),
			};
			rgb = hsv2rgb(Math.round(h.value * 360), 0.6, 0.5);
			yield {
				background: rgbString({ r: rgb[0], g: rgb[1], b: rgb[2], a: 192 }),
				border: rgbString({ r: rgb[0], g: rgb[1], b: rgb[2], a: 144 }),
			};
			h = hue.next();
		}
	}

	var index = {
		id: "autocolors",
		beforeUpdate(chart, options) {
			const { mode = "dataset", enabled = true } = options;
			if (!enabled) {
				return;
			}
			const color = colorGen();
			chart.data.datasets.forEach((dataset) => {
				if (mode === "dataset") {
					const c = color.next().value;
					dataset.backgroundColor = dataset.backgroundColor || c.background;
					dataset.borderColor = dataset.borderColor || c.border;
				} else {
					const background = [];
					const border = [];
					// eslint-disable-next-line array-callback-return
					dataset.data.map(() => {
						const c = color.next().value;
						background.push(c.background);
						border.push(c.border);
					});
					dataset.backgroundColor = dataset.backgroundColor || background;
					dataset.borderColor = dataset.borderColor || border;
				}
			});
		},
	};

	return index;
});
