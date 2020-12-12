"use strict";

function loadJSON(file, callback) {
	let xobj = new XMLHttpRequest();
	xobj.overrideMimeType("application/json");
	xobj.open("GET", file, true);
	// Replace 'my_data' with the path to your file
	xobj.onreadystatechange = function () {
		if (xobj.readyState === 4 && xobj.status === 200) {
			// Required use of an anonymous callback
			// as .open() will NOT return a value but simply returns undefined in asynchronous mode
			callback(xobj.responseText);
		}
	};
	xobj.send(null);
}

function themeSettings(charttype) {
	return {
		theme: { theme: "system", dark: false },
		fontColor: "#2c3e50",
		fontFamily:
			"Quicksand, Roboto,'Open Sans','Rubik','Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
		gridlineColor: "#2c3e50",
		zeroLineColor: "#8e44ad",
		tooltipsBackground: "#ecf0f1",
		tooltipsFontColor: "#2c3e50",
		showLegend:
			["pie", "doughnut", "polararea", "line", "bubble", "scatter"].includes(
				charttype.toLowerCase()
			) || false,
		showGridLines:
			["bar", "line", "bubble", "scatter"].includes(charttype.toLowerCase()) ||
			false,
		secondaryAxis: false,
		gridLineWidth: 0.18,
		borderDash: [2],
		gradient: false,
	};
}
function setGraphDefaults(chart_type, themeSettings) {
	try {
		if (Chart && Chart.defaults) {
			// global defailt settings
			Chart.defaults.responsive = true;
			Chart.defaults.maintainAspectRatio = false;
			Chart.defaults.animation = 0;
			Chart.defaults.locale = "de-DE";

			// global font settings
			if (Chart.defaults && Chart.defaults.font && Chart.defaults.font.family) {
				Chart.defaults.font.family = themeSettings.fontFamily;
			}
			if (Chart.defaults && Chart.defaults.color) {
				Chart.defaults.color = themeSettings.fontColor;
				// new beta 7 !
				Chart.defaults.plugins.legend.labels.color = themeSettings.fontColor;
			}

			// Legend new beta 7 !
			Chart.defaults.plugins.legend.position = "top";
			Chart.defaults.plugins.legend.labels.usePointStyle = true;
			Chart.defaults.plugins.legend.labels.boxWidth = 8;
			Chart.defaults.plugins.legend.show = themeSettings.showLegend || false;

			// Tooltips new beta 7 !
			Chart.defaults.plugins.tooltip.enabled = true;
			Chart.defaults.plugins.tooltip.backgroundColor =
				themeSettings.tooltipsBackground;
			Chart.defaults.plugins.tooltip.titleColor =
				themeSettings.tooltipsFontColor;
			Chart.defaults.plugins.tooltip.bodyColor =
				themeSettings.tooltipsFontColor;
			Chart.defaults.plugins.tooltip.footerColor =
				themeSettings.tooltipsFontColor;

			// gridlines
			if (themeSettings && themeSettings.showGridLines) {
				Chart.defaults.scale.gridLines.lineWidth = themeSettings.gridLineWidth;
				if (Chart.defaults.set) {
					Chart.defaults.set("scale", {
						gridLines: {
							display: true,
							color: themeSettings.gridlineColor,
							drawBorder: true,
							borderDash: themeSettings.borderDash,
							zeroLineWidth: 8,
						},
					});
				}
			}

			// element settings
			if (Chart.defaults.elements && Chart.defaults.elements.arc)
				Chart.defaults.elements.arc.borderWidth = 0;
			if (Chart.defaults.elements && Chart.defaults.elements.line) {
				Chart.defaults.elements.line.fill = false;
				Chart.defaults.elements.line.tension = 0;
			}
			if (Chart.defaults.elements && Chart.defaults.elements.point) {
				Chart.defaults.elements.point.radius = 0.33;
				Chart.defaults.elements.point.borderWidth = 0;
				Chart.defaults.elements.point.hoverRadius = 8;
				Chart.defaults.elements.point.hitRadius = 8;
			}

			// chart type based
			if (Chart.defaults.set) {
				switch (chart_type.toLowerCase()) {
					case "radar":
						Chart.defaults.set("controllers.radar.scales.r", {
							ticks: {
								backdropColor: "transparent",
							},
							angleLines: {
								display: true,
								color: themeSettings.gridlineColor,
								lineWidth: themeSettings.gridLineWidth,
							},
							gridLines: {
								circular: true,
							},
						});
						Chart.defaults.set("scale", {
							gridLines: {
								display: true,
								lineWidth: themeSettings.gridLineWidth * 2,
								borderDash: [0],
							},
						});
						Chart.defaults.elements.point.hoverRadius = 8;
						Chart.defaults.elements.point.pointRadius = 8;
						break;

					case "polararea":
						Chart.defaults.set("controllers.polarArea.scales.r", {
							ticks: {
								backdropColor: "transparent",
							},
							angleLines: {
								display: true,
								color: themeSettings.gridlineColor,
								lineWidth: themeSettings.gridLineWidth * 2,
							},
							gridLines: {
								circular: true,
								lineWidth: themeSettings.gridLineWidth * 1.6,
								borderDash: [0],
							},
						});
						Chart.defaults.set("scale", {
							gridLines: {
								display: true,
							},
						});
						break;
					case "scatter":
					case "bubble":
					case "line":
					case "bar":
					case "pie":
					case "doughnut":
					default:
						break;
				}
			}
		}
	} catch (err) {
		console.error(
			"Error Set Chart defaults for",
			chart_type,
			": ",
			err,
			err.message
		);
	}
}

function createGraph(cgd) {
	let pg = document.getElementById("page");
	const content = document.createElement("div");
	content.id = cgd.file;
	content.setAttribute("class", "ha-card");
	content.style.cssText = "width:45%;height:360px;";
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");
	canvas.id = cgd.file + "graph";
	content.appendChild(canvas);
	const loader = document.createElement("img");
	loader.id = content.id + "-loader";
	loader.alt = "loading...";
	loader.style.width = "60";
	loader.src = "assets/three-dots.svg";
	loader.style.cssText =
		"position:absolute;top:42%;left:38%;width:60px;z-index:500;margin: 0 auto";
	content.append(loader);
	pg.appendChild(content);

	const datafile = "data/" + cgd.file + ".json";
	const _themeSettings = themeSettings(cgd.type);

	loadJSON(datafile, function (response) {
		const graphData = JSON.parse(response);
		if (graphData) {
			setGraphDefaults(cgd.type, _themeSettings);
			window.charts[content.id] = new graphChart({
				ctx: ctx,
				canvasId: canvas.id,
				chart_locale: "de-DE",
				chart_type: cgd.type,
				themeSettings: _themeSettings,
				card_config: cgd.config,
				chartconfig:cgd.config,
				setting: cgd.config,
				loader: loader,
			});
			window.charts[content.id].graphData = graphData;
			window.charts[content.id].renderGraph(false);
		}
	});
}

window.onload = function () {
	window.charts = [];
	let cards = [
		{ type: "bar", file: "bar613", config: {} },
		{ type: "bar", file: "bar746", config: {} },
		{
			type: "bubble",
			file: "bubble851",
			config: {
				entities: [
					{
						name: "BMI Peter",
						unit: "kg/m2",
					},
					{
						name: "BMI Reni",
						unit: "kg/m2",
					},
				],
			},
		},
		{ type: "doughnut", file: "doughnut412", config: {} },
		{ type: "bar", file: "horizontalBar518", config: {} },
		{ type: "line", file: "line45", config: {} },
		{ type: "line", file: "line52", config: {} },
		{ type: "line", file: "line302", config: {} },
		{
			type: "pie",
			file: "pie862",
			config: {
				options: {
					plugins: {
						title:{
						  display: true,	
						  text: "Makro Nährstoffe",		
						},
					},
				},
			},
		},
		{ type: "polarArea", file: "polarArea76", config: {} },
		{ type: "radar", file: "radar296", config: {} },
		{ type: "scatter", file: "scatter750", config: {} },
	];
	cards.forEach(function (card) {
		createGraph(card);
	});
};
