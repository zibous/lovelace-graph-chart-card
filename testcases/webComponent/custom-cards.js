class ChartGraphdata extends HTMLElement {
	/**
	 * chart graph data constructor
	 */
	constructor() {
		super();
	}

	/**
	 * theme settings
	 */
	setThemesettings() {
		this.themeSettings = {
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
					this.chart_type.toLowerCase()
				) || false,
			showGridLines:
				["bar", "line", "bubble", "scatter"].includes(
					this.chart_type.toLowerCase()
				) || false,
			secondaryAxis: false,
			gridLineWidth: 0.18,
			borderDash: [2],
			gradient: false,
		};
	}

	addCss() {
		const _style = document.createElement("style");
		_style.setAttribute("id", "sc-" + this.id);
		_style.textContent = `
            .ha-card {
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex;
                -webkit-box-orient: vertical;
                -webkit-box-direction: normal;
                -ms-flex-direction: column;
                flex-direction: column;
                position: relative;
                border-radius: 16px;
                overflow: hidden;
                margin: 1em;
                background: #ffffff;
                
            }
            .ha-title{
                margin: 0.3em 1.5em;
                line-height:1.5em;
                font-weight: 500;
				font-size:1.5em;
				overflow:hidden;
				text-overflow:ellipsis;
				white-space:nowrap;
				display:inline-block;
				vertical-align:top;
				width:70%;
            }
            canvas {
                -moz-user-select: none;
                -webkit-user-select: none;
                -ms-user-select: none;
                height: 100%;
                width: 100%;
            }
        `;
		this.root.append(_style);
	}

	/**
	 * load data file
	 * @param {string} file
	 * @param {func} callback
	 */
	loadJSON(file, callback) {
		let xobj = new XMLHttpRequest();
		xobj.overrideMimeType("application/json");
		xobj.open("GET", file, true);
		xobj.onreadystatechange = function () {
			if (xobj.readyState === 4 && xobj.status === 200) {
				callback(xobj.responseText);
			}
		};
		xobj.send(null);
	}

	/**
	 * load data and render the graph
	 */
	renderGraph() {
		const me = this;
		this.loadJSON(this.data_file, function (response) {
			const settings = JSON.parse(response);
			if (settings) {
				const _grapChart = new graphChart({
					ctx: me.ctx,
					canvasId: me.canvasId,
					chart_locale: me.locale,
					chart_type: me.chart_type,
					themeSettings: me.themeSettings,
					card_config: settings.config,
					chartconfig: { options: settings.options },
					setting: me.config.config,
					loader: me.loader,
				});
				_grapChart.graphData = { data: settings.data };
				_grapChart.renderGraph(false);
			}
		});
	}

	/**
	 * create the graph card
	 */
	createGraphCard() {
        this.addCss();

        const card = document.createElement("div");
        card.setAttribute("class", "ha-card");
        card.style.cssText = "width:100%";
        
        // card header
        const header = document.createElement("div");
        header.setAttribute("class", "ha-title");
        header.innerHTML = this.card_title;
        card.appendChild(header);

	    // graph card content
        const content = document.createElement("div");
        content.style.height = this.card_height + "px";
        content.id = this.id;
        
        // graph card canvas element
        this.canvasId = this.id + "graph";
        const canvas = document.createElement("canvas");
        canvas.height = this.card_height;
		canvas.id = this.canvasId;
		this.ctx = canvas.getContext("2d");
        content.appendChild(canvas);
        
        

		// the loader element
		this.loader = document.createElement("img");
		this.loader.id = this.id + "-loader";
		this.loader.alt = "loading...";
		this.loader.style.width = "60";
		this.loader.src = "assets/three-dots.svg";
		this.loader.style.cssText =
            "position:absolute;top:42%;left:38%;width:60px;z-index:500;margin: 0 auto";

        card.append(content);    
		card.append(this.loader);
		this.root.appendChild(card);
		this.renderGraph();
	}

	/**
	 * configuration
	 */
	connectedCallback() {
		this.root = this.attachShadow({ mode: "open" });
		this.config = Object.assign({}, JSON.parse(this.getAttribute("config")));
		this.chart_type = this.config.chart_type = this.getAttribute("type");
		this.id = this.getAttribute("id");
        this.card_title = this.getAttribute("title") || "Testcase";
        this.card_height = this.getAttribute("height") || 240;
        this.data_file = this.getAttribute("file");
        
		this.locale = "de-DE";
		console.log(this.config);
		this.setThemesettings();
		this._initialized = true;
		this.createGraphCard();
	}

	disconnectedCallback() {
		this._initialized = false;
	}
}

customElements.define("chard-graphdata", ChartGraphdata);
