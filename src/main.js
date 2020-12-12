/** --------------------------------------------------------------------

  Custom Chart Card 
  based on https://github.com/sdelliot/pie-chart-card

  chartjs:    https://www.chartjs.org/
  gradient:   https://github.com/kurkle/chartjs-plugin-gradient#readme

/** -------------------------------------------------------------------*/
"use strict";

// Chart.js v3.0.0-beta.7 and used plugins, production use min.js
import "/hacsfiles/chart-card/chart.js?module";

// gradient, see themesettings
const gradient = window["chartjs-gradient"];

const appinfo = {
    name: "✓ custom:chart-card ",
    version: "1.0.8",
    assets: "/hacsfiles/chart-card/assets/"
};
console.info(
    "%c " + appinfo.name + "     %c ▪︎▪︎▪︎▪︎ Version: " + appinfo.version + " ▪︎▪︎▪︎▪︎ ",
    "color:#FFFFFF; background:#3498db;display:inline-block;font-size:12px;font-weight:300;padding: 6px 0 6px 0",
    "color:#2c3e50; background:#ecf0f1;display:inline-block;font-size:12px;font-weight:300;padding: 6px 0 6px 0"
);

// From weather-card
// fireEvent(this, "hass-more-info", { entityId: aqiSensor.config });
const fireEvent = (node, type, detail, options) => {
    options = options || {};
    detail = detail === null || detail === undefined ? {} : detail;
    const event = new Event(type, {
        bubbles: options.bubbles === undefined ? true : options.bubbles,
        cancelable: Boolean(options.cancelable),
        composed: options.composed === undefined ? true : options.composed
    });
    event.detail = detail;
    node.dispatchEvent(event);
    return event;
};

/**
 * lovelace card chart graph
 */
class ChartCard extends HTMLElement {
    
    /**
     * Chartjs Card constructor
     * TODO: Why is this called 3-6 times on startup ?
     */

    constructor() {
        // Always call super first in constructor
        // https://github.com/mdn/web-components-examples/blob/master/life-cycle-callbacks/main.js
        super();

        // Element functionality written in here
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
        this.loginfo_enabled = true;
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
            console.log("ERROR evaluateCssVariable:", v, "ERROR", err.message, err);
        }
        return v;
    }

    _setDefaultThemeSettings() {
        this.themeSettings = {
            theme: { theme: "system", dark: false },
            fontColor: "#333333",
            fontFamily: "Quicksand, Roboto,'Open Sans','Rubik','Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
            gridlineColor: "#DCDCDC",
            zeroLineColor: "#555555",
            tooltipsBackground: "#ecf0f1",
            tooltipsFontColor: "#647687",
            showLegend:
                ["pie", "doughnut", "polararea", "line", "bubble", "scatter"].includes(this.chart_type.toLowerCase()) ||
                false,
            showGridLines: ["bar", "line", "bubble", "scatter"].includes(this.chart_type.toLowerCase()) || false,
            secondaryAxis: false,
            gridLineWidth: 0.18,
            borderDash: [2],
            gradient: true
        };
    }
    /**
     * set the card based theme settings
     * theese will overwrite the all theme settings
     */
    _setChartTheme() {}
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
     * card definition "theme"
        0: {fontcolor: "#FFFFFF"}
        1: {gridlinecolor: "#FFFFFF"}
        2: {zerolinecolor: "#DCDCDC"}
        3: {tooltipsbackground: "#FFFFFF"}
        4: {tooltipsfontcolor: "#555555"}
        5: {cardbackground: "linear-gradient(to bottom, #009fff, #ec2f4b);"}

	 */
    _getThemeSettings() {
        this._setDefaultThemeSettings();
        try {
            this.themeSettings = {
                fontColor:
                    (this.chart_themesettings && this.chart_themesettings.fontcolor) ||
                    this._evaluateCssVariable("--chartjs-text-fontColor") ||
                    this._evaluateCssVariable("--primary-text-color") ||
                    this.themeSettings.fontFamily,
                fontFamily:
                    this._evaluateCssVariable("--chartjs-fontFamily") ||
                    this._evaluateCssVariable("--paper-font-common-base_-_font-family") ||
                    "Quicksand, Roboto,'Open Sans','Rubik','Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
                gridlineColor:
                    (this.chart_themesettings && this.chart_themesettings.gridlinecolor) ||
                    this._evaluateCssVariable("--chartjs-gridline-color") ||
                    this._evaluateCssVariable("--light-primary-color") ||
                    this.themeSettings.gridlineColor,
                zeroLineColor:
                    (this.chart_themesettings && this.chart_themesettings.zerolinecolor) ||
                    this._evaluateCssVariable("--chartjs-zero-gridline-color") ||
                    this._evaluateCssVariable("--dark-primary-color") ||
                    this.themeSettings.zeroLineColor,
                tooltipsBackground:
                    (this.chart_themesettings && this.chart_themesettings.tooltipsbackground) ||
                    this._evaluateCssVariable("--chartjs-tooltip-background") ||
                    this.themeSettings.tooltipsBackground,
                tooltipsFontColor:
                    (this.chart_themesettings && this.chart_themesettings.tooltipsfontcolor) ||
                    this._evaluateCssVariable("--chartjs-text-fontcolor") ||
                    this.themeSettings.tooltipsFontColor,
                showLegend:
                    ["pie", "doughnut", "polararea", "line"].includes(this.chart_type.toLowerCase()) ||
                    this.themeSettings.showLegend,
                showGridLines:
                    ["bar", "line", "bubble", "scatter"].includes(this.chart_type.toLowerCase()) || this.showGridLines,
                secondaryAxis: false,
                themecolor: this._evaluateCssVariable("--chartjs-theme") || false,
                charttheme: this.chart_themesettings !== null,
                gradient: this.themeSettings.gradient,
                chartdefault: false,
            };
            // get the theme from the hass or private theme settings
            if (this.theme === undefined || this.theme.dark === undefined) {
                this.theme = { theme: "system", dark: this.themeSettings.themecolor === "dark" || false };
                this.themeSettings.theme = this.theme;
            }
            if (this.theme && this.theme.dark != undefined) {
                this.themeSettings.theme = this.theme;
            }
            this.themeSettings.gridLineWidth = this.themeSettings.theme.dark ? 0.18 : 0.45;
            this.themeSettings.borderDash = this.themeSettings.theme.dark ? [2] : [0];
            if (this._config.options && this._config.options.scale && this._config.options.scale.gridLines)
                this.themeSettings.showGridLines = true;
            if (this._config.options && this._config.options.legend) this.themeSettings.showLegend = true;
            return true;
        } catch (err) {
            console.error("Fatal Error theme settings", err.message, err);
        }
        return false;
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
                setting: this._config,
                loader: this.loader
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

        if (this.id) return;

        this.id = "TC" + Math.floor(Math.random() * 1000);
        const card = document.createElement("ha-card");
        // the ha-card
        card.id = this.id + "-card";
        card.setAttribute("data-graphtype", this.chart_type);
        if (this.chart_themesettings && this.chart_themesettings.cardbackground) {
            /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
            card.style.cssText += `background: ${this.chart_themesettings.cardbackground} !important;`;
        }

        const content = document.createElement("div");
        const canvas = document.createElement("canvas");
        this.ctx = canvas.getContext("2d");
        this.canvasId = this.id + "-chart";

        // create the header and icon (optional)
        if (this.card_title || this.card_icon) {
            const cardHeader = document.createElement("div");
            cardHeader.setAttribute("class", "card-header header flex");
            cardHeader.id = this.id + "-header";
            cardHeader.style.cssText = "padding-bottom:0 !important;white-space:nowrap";
            if (this.card_icon) {
                const iconel = document.createElement("ha-icon");
                iconel.setAttribute("icon", this.card_icon);
                iconel.style.cssText = "position:relative;top:-2px;padding:0 6px 0 4px;";
                cardHeader.appendChild(iconel);
            }
            if (this.card_title) {
                const cardTitle = document.createElement("span");
                cardTitle.style.cssText =
                    "overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-block;vertical-align:top;width:70%";
                cardTitle.innerHTML = this.card_title;
                cardHeader.appendChild(cardTitle);
            }
            card.append(cardHeader);
        }

        // card content
        content.id = this.id + "-view";
        content.style.height = this.card_height + "px";
        content.style.width = "100%";
        content.style.overflow = "auto";

        // the canvas element for chartjs (required)
        canvas.id = this.canvasId;
        canvas.height = this.card_height;
        canvas.style.cssText = "-moz-user-select: none; -webkit-user-select: none; -ms-user-select: none;";

        // create the loader
        if (this.loaderart) {
            this.loader = document.createElement("img");
            this.loader.id = this.id + "-loader";
            this.loader.alt = "loading...";
            this.loader.style.width = "60";
            this.loader.src = appinfo.assets + this.loaderart + ".svg";
            this.loader.style.cssText = "position:absolute;top:42%;left:38%;width:60px;z-index:500;margin: 0 auto";
        }

        // create the show state layer
        if (this.chart_showstate) {
            this.currentData = document.createElement("div");
            this.currentData.id = this.id + "state-view";
            this.currentData.style.cssText =
                "position:absolute;top:12px;right:24px;background-color:transparent;z-index:100;";
        }
        // detail view layer
        if (this.chart_showdetails) {
            this.detailData = document.createElement("div");
            this.detailData.style.cssText = "padding:12px 50px;border-top:1px dotted"; // height:" + this.card_height + "px;";
            this.detailData.id = this.id + "detail-info";
            this.currentData.setAttribute("data-view", this.detailData.id);
        }

        content.appendChild(canvas);
        if (this.loader) content.append(this.loader);

        if (this.chart_showdetails && this.detailData) {
            content.append(this.detailData);
        }

        // create the content
        card.appendChild(content);

        if (this.chart_showstate && this.currentData) {
            card.appendChild(this.currentData);
        }

        // update info
        if (this.card_timestamp) {
            this.timestampLayer = document.createElement("div");
            this.timestampLayer.id = this.id + "detail-footertext";
            this.timestampLayer.style.cssText =
                "position:absolute;right:0.8em;bottom:0;font-weight:200;font-size:0.7em;text-align:right;z-index:800";
            this.timestampLayer.innerHTML = localDatetime(new Date().toISOString());
            card.appendChild(this.timestampLayer);
        }

        // create the ha-card
        this.root.appendChild(card);
    }

    /**
     * method returns an array containing the canonical locale names.
     * Duplicates will be omitted and elements will be
     * validated as structurally valid language tags.
     * @param {string} locale
     */
    _checkLocale(locale) {
        try {
            Intl.getCanonicalLocales(locale);
        } catch (err) {
            console.error(" RangeError: invalid language tag:", this.config);
            return navigator.language || navigator.userLanguage;
        }
        return locale;
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
            this._config = Object.assign({}, config);
            this.loginfo_enabled = this._config.loginfo || false;

            // ha-card settings
            this.card_title = this._config.title || "";
            this.card_icon = this._config.icon || null;
            this.card_height = this._config.height || 240;
            this.card_timestamp = this._config.cardtimestamp || false;

            // all settings for the chart
            this.chart_type = this._config.chart || "bar";
            // settings: right, left, center
            this.chart_showstate = this._config.showstate || false;
            this.chart_showstate = this.chart_showstate === true ? "right" : this.chart_showstate;
            if (this.chart_showstate) {
                if (!["left", "right", "center"].includes(this.chart_showstate.toLowerCase())) {
                    this.chart_showstate = false;
                }
            }
            this._config.id = this.chart_type + Math.floor(Math.random() * 1000);

            this.chart_showdetails = this._config.showdetails;
            this.chart_themesettings = this._config.theme || null;
            this.loaderart = this._config.loader || "three-dots";
            const loaderFiles = [
                "audio",
                "ball-triangle",
                "bars",
                "circles",
                "grid",
                "hearts",
                "oval",
                "pfuff",
                "rings",
                "spinning-circles",
                "tail-spin",
                "three-dots"
            ];
            if (!loaderFiles.includes(this.loaderart)) {
                this.loaderart = "spinning-circles";
            }

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

            const _browserlocale = navigator.language || navigator.userLanguage || "en-GB";
            this.chart_locale = this._config.locale || _browserlocale;
            this._checkLocale();

            // setting for data handling
            this.data_hoursToShow = this._config.hours_to_show || 0;
            this.show = this._config.show || {};

            if (this.chart_type === "line" && this.data_hoursToShow === 0) {
                this.data_hoursToShow = 24 * 7; // show the last 7 days...
            }
            this.data_group_by = this._config.group_by || "day";
            this.data_dateGroup = this._dateFormatPattern(this.data_group_by);
            this.data_aggregate = this._config.aggregate || "last";
            this.data_ignoreZero = this._config.ignoreZero || false;

            this.data_units = this._config.units || "";

            // check if we can use showstate
            if (["bubble", "scatter"].includes(this.chart_type.toLocaleLowerCase())) {
                this.chart_showstate = false;
            } else {
                if (this.data_hoursToShow === 0 && this.chart_showstate) {
                    this.chart_showstate = null;
                }
            }

            // create the card and apply the chartjs config
            if (this._initialized === false) {
                this._creatHACard();
            }
            this.updating = false;

        } catch (err) {
            console.log(err.message, config, err);
        }
    }

    /**
     * HASS settings
     *
     */
    set hass(hass) {
        // check if hass is present
        if (hass === undefined) return;
        // skip not initialized
        if (!this._initialized) return;

        this._hass = hass;
        this.selectedTheme = hass.selectedTheme || { theme: "system", dark: false };
        if (this.theme && this.theme.dark !== this.selectedTheme.dark) {
            // theme has changed
            this.theme = this.selectedTheme;
            this._getThemeSettings();
            if (this.graphChart) {
                this.themeSettings.theme = this.theme;
                this.graphChart.setThemeSettings(this.themeSettings);
                this._getHistory();
            }
        }
        this.theme = this.selectedTheme;

        // An object list containing the states of all entities in Home Assistant.
        // The key is the entity_id, the value is the state object.
        this.hassEntities = this._config.entities
            .map((x) => hass.states[x.entity])
            .filter((notUndefined) => notUndefined !== undefined);

        // check if we have valid entities and skip if we can'nt find the
        // entities in the hass entities list.
        if (!this.hassEntities || this.hassEntities.length === 0) {
            console.error(this.chart_type, "No valid entities found, check your settings...");
            return;
        }

        // update only if we has a chart
        if (this.skipRender)
            this.checkUpdate();

        if (this.skipRender) return;

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
                        if (item.name !== undefined) {
                            item.last_changed = h.last_changed || this.startTime;
                            item.state = h.state || 0.0;
                            this.entities.push(item);
                            this.entity_ids.push(entity.entity);
                        }
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
            if (!this.graphChart) {
                // create the graph chart
                this._getThemeSettings();
                this.themeSettings.theme = this.theme;
                this._setChartConfig();
            }    
            // get the histroy data and render the graph
            this._getThemeSettings();
            this.themeSettings.theme = this.theme;
            this.graphChart.setThemeSettings(this.themeSettings);
            this._getHistory();
            this.skipRender = true;
            this.updating = false;
        }
    }

    /**
     * checks if we need a graph update
     */
    checkUpdate() {
        if (this.updating) return false;
        // check if we has changes
        if (this.hassEntities && this.hassEntities.length && this._hass) {
            this.hasChanged = false;
            this.updating = true;

            // reload the hass entities
            this.hassEntities = this._config.entities
                .map((x) => this._hass.states[x.entity])
                .filter((notUndefined) => notUndefined !== undefined);

            // check for update and set the entity state last and update flag
            for (let entity of this.entities) {
                const h = this.hassEntities.find((x) => x.entity_id === entity.entity);
                entity.laststate = entity.state;
                entity.update = false;
                if (h && entity.last_changed !== h.last_changed && entity.state !== h.state) {
                    // update the data for this entity
                    entity.last_changed = h.last_changed;
                    entity.state = h.state;
                    entity.update = true;
                    this.hasChanged = true;
                }
            }

            if (this.hasChanged) {
                // refresh and update the graph
                this._getThemeSettings();
                this.graphChart.setThemeSettings(this.themeSettings);
                this.entityData = this.hassEntities.map((x) => (x === undefined ? 0 : x.state));
                this.graphChart.entityData = this.entityData;
                this.chart_update = true;
                this._getHistory();
                if (this.card_timestamp) this.timestampLayer.innerHTML = localDatetime(new Date().toISOString());
            }

            this.updating = false;
            return this.hasChanged;
        }
    }

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
                startTime = new Date();
                startTime.setHours(startTime.getHours() - this.data_hoursToShow);
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
                    (stateHistory) => this._buildGraphData(stateHistory, 1),
                    () => null
                );
            } else {
                this.lastUpdate = new Date().toISOString();
                this._buildGraphData(null, 2);
            }
        }
    }

    /**
     * render the state data layer
     * @param {*} data
     */
    renderStateData(data) {
        if (this.currentData && this.chart_showstate && data) {
            let _visible = "margin:0;line-height:1.2em";
            let _html = [];
            _html.push('<div style="font-weight:400;margin:0;cursor:pointer;height:4.5em;overflow:auto">');
            for (const item of data) {
                let _style = ' style="' + _visible + ";color:" + item.color + '"';
                _html.push('<div class="stateitem" id="' + item.name + '"' + _style + '">');
                _html.push(
                    '<p style="font-size:2.0em;line-height:1.2em;text-align:right;margin:0;border-bottom: 1px dotted ' +
                        item.color +
                        ';">' +
                        item.current +
                        '<span style="font-size:0.5em;vertical-align:top">' +
                        item.unit +
                        "</span></p>"
                );
                _html.push(
                    '<p style="font-size:0.85em;text-align:center;margin:0;line-height:2em">' + item.name + "</p>"
                );
                _html.push("</div>");
            }
            _html.push("</div>");
            this.currentData.innerHTML = _html.join("");
            // -------------------------
            if (this.detailData) {
                _html = [];
                if (this.chart_showdetails.title) _html.push("<h2>" + this.chart_showdetails.title + "</h2>");
                _html.push(
                    '<div><table style="margin: 0 auto;font-size:0.95em;font-weight:300;border-spacing:10px;border-collapse: separate;table-layout: fixed;">'
                );
                _html.push('<tbody><tr style="text-align:left;font-size:1.0em">');
                _html.push('<th width="30%"><b>Statistics</b></th>');
                _html.push('<th style="padding: 0 24px;">Min</th>');
                _html.push('<th style="padding: 0 24px;">Max</th>');
                _html.push('<th style="padding: 0 24px;">Current</th>');
                _html.push('<th style="padding: 0 24px;">Date</th>');
                _html.push("</tr>");
                for (const item of data) {
                    _html.push("<tr>");
                    _html.push(
                        '<td><span style="font-size:4em;color:' +
                            item.color +
                            ';vertical-align:top;padding-right:8px">&bull;</span>' +
                            item.name +
                            "</td>"
                    );
                    _html.push("<td align='right'>" + item.min + " " + item.unit + "</td>");
                    _html.push("<td align='right'>" + item.max + " " + item.unit + "</td>");
                    _html.push("<td align='right'>" + item.current + " " + item.unit + "</td>");
                    _html.push("<td>" + localDatetime(item.timestamp, this.chart_locale) + "</span>");
                    _html.push("</tr></tbody>");
                }
                _html.push("</table></div><br/>");
                if (_html.length) this.detailData.innerHTML = _html.join("");
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
    _buildGraphData(stateHistories, mode) {
        if ((mode === 1 && !stateHistories) || (stateHistories && !stateHistories.length)) {
            return null;
        }

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
            chart_locale: this.chart_locale,
            lastUpdate: this.lastUpdate
        });

        // get the chart data
        if (mode === 1) {
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

        if (mode === 1 && this.chart_showstate) {
            let _data = this.graphData.data.datasets.map(function (item) {
                return {
                    name: item.label || "",
                    min: item.minval,
                    max: item.maxval,
                    avg: null,
                    sum: null,
                    current: item.current,
                    unit: item.unit || "",
                    color: item.labelcolor || item.backgroundColor,
                    timestamp: item.last_changed || ""
                };
            });
            if (_data) this.renderStateData(_data);
            return true;
        }
    }

    /**
     * The connectedCallback() runs when the element is added to the DOM
     */
    connectedCallback() {
        this._initialized = true; // important for loading charts !
    }

    /**
     * the disconnectedCallback() and adoptedCallback() callbacks log simple messages
     * to the console to inform us when the element is either removed from the DOM,
     */
    disconnectedCallback() {
       this._initialized = false; // important for loading charts !
    }

    /**
     * the disconnectedCallback() and adoptedCallback() callbacks log simple messages
     * to the console to inform us when the element is either removed from the DOM,
     */
    adoptedCallback() {
       //  logInfo(true, this.id, this.chart_type, "adoptedCallback");
    }

    attributeChangedCallback(name, oldValue, newValue) {
        //  logInfo(true, this.id, this.chart_type, "attributeChangedCallback");
    }

    /**
     * The height of the card. Home Assistant uses this to automatically
     * distribute all cards over the available columns.
     */
    getCardSize() {
        return 1;
    }
}

customElements.define("chart-card", ChartCard);
