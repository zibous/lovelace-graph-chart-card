/** --------------------------------------------------------------------

  Custom Chart Card
  based on https://github.com/sdelliot/pie-chart-card

  chartjs:    https://www.chartjs.org/
  gradient:   https://github.com/kurkle/chartjs-plugin-gradient#readme

/** -------------------------------------------------------------------*/

// Chart.js v3.0.0-beta.4 and used plugins, production use min.js
import "/hacsfiles/chart-card/chart.js?module";

// gradient
const gradient = window["chartjs-plugin-gradient"];

console.info(
    "%c CHARTJS-CARD-DEV %c ".concat("0.0.6", " "),
    "color: white; background: #2980b9; font-weight: 700;",
    "color: white; background: #e74c3c; font-weight: 700;"
);

/**
 * lovelace card chart graph
 */
class ChartCard extends HTMLElement {
    static get properties() {
        return {
            _config: {},
            _hass: {}
        };
    }

    /**
     * Chartjs Card constructor
     */
    constructor() {
        // TODO: Why is this called 3-6 times on startup ?
        super();

        this._hass = null;
        this._config = null;

        this.attachShadow({
            mode: "open"
        });

        // card settings
        this.card_icon = null;
        this.card_title = null;
        this.card_height = 240;

        // all for chart
        this.theme = "";
        this.themeSettings = null;
        this.graphChart = null;
        this.chart_type = "bar";
        this.chart_locale = "de-DE";
        this.chart_update = false;
        this.ctx = null;
        this.chartconfig = null;
        this.graphData = {};

        // data providers
        this.hassEntities = [];
        this.entities = [];
        this.entityOptions = null;
        this.entity_ids = [];
        this.entityData = [];
        this.entityNames = [];

        // data service
        this.updateInterval = 60;
        this.data_hoursToShow = 0;
        this.data_group_by = "day";
        this.data_dateGroup = null;
        this.data_ignoreZero = false;
        this.data_units = "";
        this.startTime = new Date();
        this.lastEndTime = new Date();
        this.skipRender = false;
        this.lastUpdate = null;
        this.ready = false;
        this._initialized = false;
    }

    /**
     * get the date format patter for the
     * data series group
     * @param {*} key
     */
    _dateFormatPattern(key) {
        const df = [];
        df["timestamp"] = "timestamp";
        df["day"] = "%Y-%M-%d";
        df["hour"] = "%Y-%M-%d %H:00:00";
        df["month"] = "%Y-%M";
        df["year"] = "%Y";
        if (key in df) return df[key];
        else return df["timestamp"];
    }

    /**
     * evaluate the CSS variable
     * @param {*} variable
     */
    _evaluateCssVariable(v) {
        try {
            return getComputedStyle(document.documentElement).getPropertyValue(v).trim();
        } catch (err) {
            console.log("ERROR evaluateCssVariable:", v, "ERROR", err);
        }
        return v;
    }

    /**
	 * THEME SETTINGS
	 * get the font and colorsettings from the hass view.
	 * optional the settings can be overwritten by the
	 * card definition "card_theme" and the theme css
		--chartjs-text-fontColor: '#2F3846'
  		--chartjs-fontFamily: "Quicksand, Roboto, 'Open Sans','Rubik',sans-serif"
  		--chartjs-gridline-color: '#EAEEF1'
  		--chartjs-zero-gridline-color: '#C9CBD0'
  		--chartjs-tooltip-background: '#EAEEF1'
  		--chartjs-text-fontcolor: '#292F33'
	 */
    _getThemeSettings() {
        
        this.themeSettings = {
            fontColor:
                this._evaluateCssVariable("--chartjs-text-fontColor") ||
                this._evaluateCssVariable("--primary-text-color") ||
                "#333333",
            fontFamily:
                this._evaluateCssVariable("--chartjs-fontFamily") ||
                this._evaluateCssVariable("--paper-font-common-base_-_font-family") ||
                "Quicksand, Roboto,'Open Sans','Rubik','Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
            gridlineColor:
                this._evaluateCssVariable("--chartjs-gridline-color") ||
                this._evaluateCssVariable("--light-primary-color") ||
                "#DCDCDC",
            zeroLineColor:
                this._evaluateCssVariable("--chartjs-zero-gridline-color") ||
                this._evaluateCssVariable("--dark-primary-color") ||
                "#555555",
            tooltipsBackground: this._evaluateCssVariable("--chartjs-tooltip-background") || "#ecf0f1",
            tooltipsFontColor: this._evaluateCssVariable("--chartjs-text-fontcolor") || "#647687",
            showLegend: ["pie", "doughnut", "polararea", "line"].includes(this.chart_type.toLowerCase()),
            showGridLines: ["bar", "line", "bubble", "scatter"].includes(this.chart_type.toLowerCase()),
            secondaryAxis: false
        };

        if (this._config.options && this._config.options.scale && this._config.options.scale.gridLines) {
            this.themeSettings.showGridLines = true;
        }

        if (this._config.options && this._config.options.legend) {
            this.themeSettings.showLegend = true;
        }
    }

    /**
     * set the chart config
     * if the options tag is present, this will
     * overwrite the default settings
     */
    _setChartConfig() {
        let config = {};
        // get the config
        config.type = this.chart_type;
        if (this._config.options) {
            config.options = {};
            config.options = this._config.options;
        }
        this.chartconfig = config;
        // get the theme settings (color, font...)
        this._getThemeSettings();
        // init the graph chart
        if (this.ctx) {
            let settings = {
                ctx: this.ctx,
                canvasId: this.canvasId,
                card_config: this._config,
                chart_locale: this.chart_locale,
                chart_type: this.chart_type,
                themeSettings: this.themeSettings,
                chartconfig: this.chartconfig,
                setting: this._config
            };
            this.graphChart = new graphChart(settings);
        } else {
            console.error("No chart.js container found !");
        }
    }

    /**
     * create the HA card
     * ha-icon and title and the canavas container
     * for the chartjs graph
     */
    _creatHACard() {
        // card and chart elements
        const eId = Math.random().toString(36).substr(2, 9);
        this.id = "card-" + eId;
        const card = document.createElement("ha-card");
        const content = document.createElement("div");
        const canvas = document.createElement("canvas");
        this.ctx = canvas.getContext("2d");
        this.canvasId = "chart-" + eId;
        const style = document.createElement("style");
        card.id = this.id;
        // card content
        content.id = "content-" + eId;
        canvas.id = this.canvasId;
        content.style.height = this.card_height + "px";
        content.style.width = "100%";
        // the canvas element for chartjs
        canvas.height = this.card_height;
        canvas.style.cssText = "-moz-user-select: none; -webkit-user-select: none; -ms-user-select: none;";
        // create the header and icon
        const cardHeader = document.createElement("div");
        cardHeader.setAttribute("class", "card-header");
        cardHeader.style.cssText = "padding-bottom:0 !important;";
        if (this.card_icon) {
            const iconel = document.createElement("ha-icon");
            iconel.setAttribute("icon", this.card_icon);
            iconel.style.cssText = "position:relative;top:-4px;padding:0 12px 0 4px;";
            cardHeader.appendChild(iconel);
        }
        if (this.card_title) {
            const cardTitle = document.createElement("span");
            cardTitle.innerHTML = "<!---->" + this.card_title + "<!---->";
            cardHeader.appendChild(cardTitle);
        }
        if (this.card_title || this.card_icon) card.append(cardHeader);
        // create the info box (optional)
        if (this.card_info) {
            const cardInfo = document.createElement("div");
            cardInfo.style = "min-height:30px; background-color:trasnparent;padding:8px";
            card.appendChild(cardInfo);
        }
        card.appendChild(content);
        card.appendChild(style);
        content.appendChild(canvas);
        this.root.appendChild(card);
    }

    /**
     * Home Assistant will call setConfig(config) when the configuration changes (rare).
     * If you throw an exception if the configuration is invalid,
     * Lovelace will render an error card to notify the user.
     */
    setConfig(config) {
        if (!config.entities) {
            throw new Error("You need to define an entity");
        }

        try {
            this.root = this.shadowRoot;
            while (this.root.hasChildNodes()) {
                this.root.removeChild(root.lastChild);
            }

            if (this._config) {
                console.log("CHART-CART Config", config.title, " allready loaded");
                return;
            }

            // get the config from the lovelace
            this._config = config;

            // ha-card settings
            this.card_title = this._config.title || "";
            this.card_icon = this._config.icon || null;
            this.card_height = this._config.height || 240;
            this.card_info = this._config.cardInfo || null;

            // all settings for the chart
            this.chart_type = this._config.chart || "bar";
            const availableTypes = [
                "line",
                "radar",
                "bar",
                "horizontalBar",
                "pie",
                "doughnut",
                "polarArea",
                "bubble",
                "scatter"
            ];
            if (!this.chart_type) {
                throw new Error("You need to define type of chart");
            } else if (!availableTypes.includes(this.chart_type)) {
                throw new Error(
                    "Invalid config for 'chart:'" +
                        this.chart_type +
                        ". Available options are: " +
                        availableTypes.join(", ")
                );
            }
            if (this.chart_type.toLowerCase() === "horizontalbar") {
                this.chart_type = "bar";
            }
            this.chart_locale = this._config.locale || "de-DE";
            // setting for data handling
            this.updateInterval = this._config.update || 60;
            this.data_hoursToShow = this._config.hours_to_show || 0;
            this.data_group_by = this._config.group_by || "day";
            this.data_dateGroup = this._dateFormatPattern(this.data_group_by);
            this.data_aggregate = this._config.aggregate || "last";
            this.data_ignoreZero = this._config.ignoreZero || false;

            this.data_units = this._config.units || "";
            this.data_test = this._config.testdata || null;

            // create the card and apply the chartjs config
            this._creatHACard();
            this._setChartConfig();
            this._initialized = true;
        } catch (err) {
            console.log(err.message, config);
        }
    }

     /**
     * HASS settings
     *
     */
    set hass(hass) {
        if (hass === undefined) return;
        if (!this._initialized) return;

        if (this.theme && this.theme.dark !== hass.selectedTheme.dark) {
            // theme has changed
            this.theme = hass.selectedTheme;
            this._getThemeSettings();
            if (this.graphChart) {
                this.themeSettings.theme = this.theme;
                this.graphChart.setThemeSettings(this.themeSettings);
                this.graphChart.renderGraph(false);
            }
        }

        this._hass = hass;
        this.theme = hass.selectedTheme;

        // TODO : find a better methode ??
        if (this.updateInterval) {
            let endTime = new Date();
            let elapsed = (endTime.getTime() - this.startTime.getTime()) / 1000;
            if (elapsed >= this.updateInterval) {
                // refresh and update the graph
                this._getThemeSettings();
                this.graphChart.setThemeSettings(this.themeSettings);
                this._getHistory();
                this.startTime = new Date();
                if (this.skipRender) return;
            }
        }

        if (!this.graphChart) {
            // create the graph chart
            this._getThemeSettings();
            this.themeSettings.theme = this.theme;
            this._setChartConfig();
        }

        // check if the Entities has changed
        if (this.skipRender && this.hassEntities && this.hassEntities.length) {
            let changed = false;
            this.hassEntities.forEach((entity) => {
                changed = changed || Boolean(this.hass && hass.states[entity] !== this._hass.states[entity]);
            });
            if (changed) {
                console.log("NEW DATA !!!!");
                this.skipRender = false;
            }
        }

        if (this.skipRender) return;

        // An object list containing the states of all entities in Home Assistant.
        // The key is the entity_id, the value is the state object.
        this.hassEntities = this._config.entities
            .map((x) => hass.states[x.entity])
            .filter((notUndefined) => notUndefined !== undefined);

        // check if we have valid entities and skip if we can'nt find the
        // entities in the hass entities list.
        if (!this.hassEntities || this.hassEntities.length === 0) return;

        // all entity data
        this.entityData = this.hassEntities.map((x) => (x === undefined ? 0 : x.state));
        this.entityOptions = null;

        if (this.ready === false && this.entities.length !== this.hassEntities.length) {
            this.entities = [];
            // interate throw all _config.entities
            for (let entity of this._config.entities) {
                if (entity.options) {
                    // all global entity options
                    this.entityOptions = entity.options;
                } else {
                    // hass entity
                    const h = this.hassEntities.find((x) => x.entity_id === entity.entity);
                    if (h) {
                        let item = Object.assign({}, entity);
                        if (item.name == undefined && h.attributes) {
                            item.name = h.attributes.friendly_name || item.name;
                            item.unit = h.attributes.unit_of_measurement || item.unit || "";
                        }
                        item.last_changed = h.last_changed;
                        item.state = h.state;
                        this.entities.push(item);
                        this.entity_ids.push(entity.entity);
                    }
                }
            }
            this.ready = (this.entity_ids && this.entity_ids.length) !== 0;
        }

        // all entity names this.entities
        this.entityNames = this.entities.map((x) =>
            x.name !== undefined
                ? x.name
                : hass.states[x.entity]["attributes"]["friendly_name"] !== undefined
                ? hass.states[x.entity]["attributes"]["friendly_name"]
                : x.entity
        );

        if (this.skipRender == false && this._initialized) {
            // get the histroy data and render the graph
            this.themeSettings.theme = this.theme;
            this._getHistory();
            this.skipRender = true;
        }
    }

    // connectedCallback() {
    // 	console.log("connectedCallback");
    // }

    /**
     * Get all histroy data for all registrated entity ids
     * or get the entity data if no time slot (hoursToShow) is defined.
     * Call an API on the Home Assistant server.
     */
    _getHistory() {
        if (this.ready) {
            if (this.data_hoursToShow && this.data_hoursToShow > 0 && this.entity_ids.length) {
                // get all data for the selected timeslot and entities...
                let startTime;
                if (this.chart_update) {
                    startTime = this.lastEndTime;
                } else {
                    startTime = new Date();
                    startTime.setHours(startTime.getHours() - this.data_hoursToShow);
                }
                let endTime = new Date();
                this.lastEndTime = endTime;
                const filter =
                    startTime.toISOString() +
                    "?end_time=" +
                    endTime.toISOString() +
                    "&filter_entity_id=" +
                    this.entity_ids.join(",");
                // get all Data for the sensors
                this.lastUpdate = new Date().toISOString();
                let url = "history/period/" + filter + "&minimal_response";
                const prom = this._hass.callApi("GET", url).then(
                    (stateHistory) => this._buildGraphData(stateHistory),
                    () => null
                );
            } else {
                this._buildGraphData(null);
            }
        }
    }

    /**
     * build the graph cart data and datasets for the
     * defined graph chart. Uses the history data and the
     * entity data.
     *
     * @param {*} stateHistories
     */
    _buildGraphData(stateHistories) {
        // start get chart data
        const _chartData = new chartData({
            chart_type: this.chart_type,
            card_config: this._config,
            entities: this.entities,
            entityOptions: this.entityOptions,
            entityData: this.entityData,
            entityNames: this.entityNames,
            stateHistories: stateHistories,
            data_dateGroup: this.data_dateGroup,
            data_aggregate: this.data_aggregate,
            setting: this._config,
            lastUpdate: this.lastUpdate
        });

        if (this.entities[0].name === "Time") {
            console.log(this.entities);
        }

        // get the chart data
              // get the chart data
              let bIsHistory = stateHistories && stateHistories.length;
              if (bIsHistory) {
                  this.graphData = _chartData.getHistoryGraphData();
              } else {
                  this.graphData = _chartData.getCurrentGraphData();
              }
      
              if (this.graphData === null) {
                  console.error("No GraphData found for ", this.entityNames);
                  return;
              } else {
                  if (this.graphData && this.graphData.config) {
                      this.themeSettings.secondaryAxis = this.graphData.config.secondaryAxis || false;
                  }
              }
      
              // TODO : HANDLING !!!
              if (this.chart_update) {
                  if (this.graphChart && this.graphData) {
                      this.graphChart.graphData = this.graphData;
                      this.graphChart.renderGraph(true);
                  }
              } else {
                  if (this.graphChart && this.graphData) {
                      this.graphChart.graphData = this.graphData;
                      this.graphChart.renderGraph(false);
                  }
              }
    }

    /**
     * The height of the card. Home Assistant uses this to automatically
     * distribute all cards over the available columns.
     */
    getCardSize() {
        return 4;
    }
}

customElements.define("chart-card", ChartCard);