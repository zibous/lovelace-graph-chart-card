/**
 * lovelace-chart-card 1.0.4
 * https://github.com/zibous/lovelace-graph-chart-card
 *
 * License: MIT
 * Generated on 2021
 * Author: Peter siebler
 */

/** --------------------------------------------------------------------

  Custom Chart Card 
  based on https://github.com/sdelliot/pie-chart-card

  chartjs:    https://www.chartjs.org/
  gradient:   https://github.com/kurkle/chartjs-plugin-gradient#readme

/** -------------------------------------------------------------------*/
"use strict"

// Chart.js  and used plugins, production use min.js
import "/hacsfiles/chart-card/chart.js?module"

// gradient, see themesettings
const gradient = window["chartjs-gradient"]

const appinfo = {
    name: "✓ custom:chart-card ",
    app: "chart-card",
    version: "1.1.3",
    chartjs: Chart.version || "v3.0.0-beta.9a",
    assets: "/hacsfiles/chart-card/assets/"
}
console.info(
    "%c " + appinfo.name + "     %c ▪︎▪︎▪︎▪︎ Version: " + appinfo.version + " ▪︎▪︎▪︎▪︎ ",
    "color:#FFFFFF; background:#3498db;display:inline-block;font-size:12px;font-weight:300;padding: 6px 0 6px 0",
    "color:#2c3e50; background:#ecf0f1;display:inline-block;font-size:12px;font-weight:300;padding: 6px 0 6px 0"
)

// From weather-card
// fireEvent(this, "hass-more-info", { entityId: aqiSensor.config });
const fireEvent = (node, type, detail, options) => {
    options = options || {}
    detail = detail === null || detail === undefined ? {} : detail
    const event = new Event(type, {
        bubbles: options.bubbles === undefined ? true : options.bubbles,
        cancelable: Boolean(options.cancelable),
        composed: options.composed === undefined ? true : options.composed
    })
    event.detail = detail
    node.dispatchEvent(event)
    return event
}

// Constructable Stylesheets: seamless reusable styles
// TODO: find a better way to have seamless reusable styles
const style = document.createElement("style")
style.innerHTML = `
    html {
        scrollbar-width: none; 
        -ms-overflow-style: none;
    }

    html::-webkit-scrollbar {
        width: 0px;
    }
    .card-header{
        padding-bottom:0 !important;
        white-space:nowrap;
    }
    .card-header-icon{
        position:relative;
        top:-2px;
        padding:0 6px 0 4px;
    }
    .card-header-title{
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
        display:inline-block;
        vertical-align:top;
        width:70%;
    }
    .card-content{
        overflow: auto;
    }
    .card-canvas{
        -moz-user-select: none; 
        -webkit-user-select: none; 
        -ms-user-select: none;
        width:100%;
        height:auto;
    }
    .card-loader{
        width: 60px;
        position:absolute;
        top:42%;
        left:38%;
        width:60px;
        z-index:500;
        margin: 0 auto
    }
    .card-state-view{
        position:absolute;
        top:12px;
        right:20px;
        background-color:transparent;
        z-index:100;
    }
    .state-view-data{
        font-weight:400;
        margin:0;
        cursor:pointer;
        height:4.5em;
        overflow:auto;
    }
    .state-view-value{
        font-size:2.0em;
        line-height:1.2em;
        text-align:right;
        margin:0;
        color:#fff;
        border-bottom: 1px dotted
    }
    .state-view-value span{
        padding-left: 4px;
        font-size:0.4em;
        vertical-align:top
    } 
    .state-view-name{
        border:none;
        font-size:0.85em;
        text-align:center;
        margin:0;
        line-height:2em
    } 
    .card-detail-view{
        margin-top: 1.2em;
        border-top:1px dotted;
    }
    .card-detail-view h2{
        margin-left: 0.5em
    }
    .card-detail-table{
        margin: 0 auto;
        font-size:0.95em;
        font-weight:300;
        width: 100%;
        border-spacing:10px;
        border-collapse: separate;
        table-layout: fixed;
        text-align:left;
    }
    .card-detail-table th{
        padding: 0 4px;
        font-weight:400;
    }
    .card-detail-table td{
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
        font-weight:300;
    }
    .card-timestamp{
        position:absolute;
        right:0.8em;
        bottom:0;
        font-weight:300;
        font-size:0.7em;
        text-align:right;
        z-index:800
        color: #000000;
    }
    @media (min-width: 320px) and (max-width: 480px){
    
    }
`

// ONLY for chrome !
// const sheet = new CSSStyleSheet();
// this.shadowRoot.adoptedStyleSheets = [sheet];
// sheet.replaceSync(CSS);

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
        super()

        // Element functionality written in here
        this._hass = null
        this._config = null

        this.attachShadow({ mode: "open" })

        // card settings
        this.card_icon = null
        this.card_title = null
        this.card_height = 240

        // all for chart
        this.theme = ""
        this.themeSettings = null
        this.graphChart = null
        this.chart_type = "bar"
        this.chart_locale = "de-DE"
        this.chart_update = false
        this.ctx = null
        this.chartconfig = null
        this.graphData = {}

        // data providers
        this.hassEntities = []
        this.entities = []
        this.entityOptions = null
        this.entity_ids = []
        this.entityData = []
        this.entityNames = []

        // data service
        this.data_hoursToShow = 0
        this.data_group_by = "day"
        this.data_aggregate = "last"
        this.updateTimer = -1
        this.update_interval = 60 * 1000
        this.data_ignoreZero = false
        this.data_units = ""
        this.skipRender = false
        this.lastUpdate = null
        this.ready = false
        this.updating = false
        this.loginfo_enabled = true
        this._initialized = false
        this.initial = true
        this.dataInfo = {
            starttime: new Date(),
            endtime: new Date(),
            entities: "",
            time: new Date().getTime(),
            loading: false,
            url: "",
            param: ""
        }
    }

    /**
     * evaluate the CSS variable
     * @param {*} variable
     */
    _evaluateCssVariable(v) {
        try {
            return getComputedStyle(document.documentElement).getPropertyValue(v).trim()
        } catch (err) {
            console.log("ERROR evaluateCssVariable:", v, "ERROR", err.message, err)
        }
        return v
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
        }
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
        this._setDefaultThemeSettings()
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
                chartdefault: false
            }
            // get the theme from the hass or private theme settings
            if (this.theme === undefined || this.theme.dark === undefined) {
                this.theme = { theme: "system", dark: this.themeSettings.themecolor === "dark" || false }
                this.themeSettings.theme = this.theme
            }
            if (this.theme && this.theme.dark != undefined) {
                this.themeSettings.theme = this.theme
            }
            this.themeSettings.gridLineWidth = this.themeSettings.theme.dark ? 0.18 : 0.45
            this.themeSettings.borderDash = this.themeSettings.theme.dark ? [2] : [0]
            if (this._config.options && this._config.options.scale && this._config.options.scale.gridLines)
                this.themeSettings.showGridLines = true
            if (this._config.options && this._config.options.legend) this.themeSettings.showLegend = true
            return true
        } catch (err) {
            console.error("Fatal Error theme settings", err.message, err)
        }
        return false
    }

    /**
     * set the chart config
     * if the options tag is present, this will
     * overwrite the default settings
     */
    _setChartConfig() {
        let config = {}
        // get the config
        config.type = this.chart_type
        if (this._config.options) {
            config.options = {}
            config.options = this._config.options
        }
        this.chartconfig = config
        // get the theme settings (color, font...)
        this._getThemeSettings()
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
            }
            this.graphChart = new graphChart(settings)
        } else {
            console.error("No chart.js container found !")
        }
    }

    /**
     * create the HA card
     * for the chartjs graph
     */
    _creatHACard() {
        if (this.id) return

        this.id = "TC" + Math.floor(Math.random() * 1000)

        // the ha-card --------------------------------
        const card = document.createElement("ha-card")
        card.setAttribute("class", "graph-card")
        card.id = this.id + "-card"
        card.setAttribute("data-graphtype", this.chart_type)
        if (this.chart_themesettings && this.chart_themesettings.cardbackground) {
            /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
            card.style.cssText += `background: ${this.chart_themesettings.cardbackground} !important;`
        }

        // ha-card content layer ---------------------
        const content = document.createElement("div")
        content.setAttribute("class", "card-content")
        content.id = this.id + "-view"
        content.style.height = cssAttr(this.card_height)

        // ha-card icon and title -------------------
        if (this.card_title || this.card_icon) {
            const cardHeader = document.createElement("div")
            cardHeader.setAttribute("class", "card-header header flex")
            cardHeader.id = this.id + "-header"
            if (this.card_icon) {
                const iconel = document.createElement("ha-icon")
                iconel.setAttribute("class", "card-header-icon")
                iconel.setAttribute("icon", this.card_icon)
                cardHeader.appendChild(iconel)
            }
            if (this.card_title) {
                const cardTitle = document.createElement("span")
                cardTitle.setAttribute("class", "card-header-title")
                cardTitle.innerHTML = this.card_title
                cardHeader.appendChild(cardTitle)
            }
            card.append(cardHeader)
        }

        // ha-card canavas element --------------------
        this.canvasId = this.id + "-chart"
        const canvas = document.createElement("canvas")
        canvas.setAttribute("class", "card-canvas")
        this.ctx = canvas.getContext("2d")
        canvas.id = this.canvasId
        canvas.height = this.card_height - 10
        canvas.style.height = cssAttr(this.card_height - 10)
        canvas.style.maxHeight = cssAttr(this.card_height - 10)

        // ha-card svg loader element -----------------
        if (this.loaderart) {
            this.loader = document.createElement("img")
            this.loader.setAttribute("class", "card-loader")
            this.loader.id = this.id + "-loader"
            this.loader.alt = "loading..."
            this.loader.style.width = "60"
            this.loader.src = appinfo.assets + this.loaderart + ".svg"
        }

        // ha-card state data -----------------
        if (this.chart_showstate) {
            this.currentData = document.createElement("div")
            this.currentData.setAttribute("class", "card-state-view")
            this.currentData.id = this.id + "state-view"
        }

        // ha-card detail data ---------------
        if (this.chart_showdetails) {
            this.detailData = document.createElement("div")
            this.detailData.setAttribute("class", "card-detail-view")
            this.detailData.id = this.id + "detail-info"
            this.currentData.setAttribute("data-view", this.detailData.id)
        } else {
            content.style.maxHeight = cssAttr(this.card_height)
        }

        // add all defined elements to the card --------------------------
        content.appendChild(canvas)
        if (this.loader) content.append(this.loader)
        if (this.chart_showdetails && this.detailData) {
            content.append(this.detailData)
        }
        card.appendChild(content)
        if (this.chart_showstate && this.currentData) {
            card.appendChild(this.currentData)
        }
        if (this.card_timestamp) {
            this.timestampLayer = document.createElement("div")
            this.timestampLayer.setAttribute("class", "card-timestamp")
            this.timestampLayer.id = this.id + "detail-footertext"
            this.timestampLayer.innerHTML = localDatetime(new Date().toISOString())
            card.appendChild(this.timestampLayer)
        }

        // create the ha-card ------
        this.root.appendChild(card)
    }

    /**
     * method returns an array containing the canonical locale names.
     * Duplicates will be omitted and elements will be
     * validated as structurally valid language tags.
     * @param {string} locale
     */
    _checkLocale(locale) {
        try {
            Intl.getCanonicalLocales(locale)
        } catch (err) {
            console.error(" RangeError: invalid language tag:", this.config)
            return navigator.language || navigator.userLanguage
        }
        return locale
    }

    /**
     * Home Assistant will call setConfig(config) when the configuration changes (rare).
     * If you throw an exception if the configuration is invalid,
     * Lovelace will render an error card to notify the user.
     */
    setConfig(config) {
        if (!config.entities) {
            throw new Error("You need to define an entity")
        }

        try {
            this.root = this.shadowRoot

            while (this.root.hasChildNodes()) {
                this.root.removeChild(root.lastChild)
            }

            // Deep cloning of style node
            const clonedStyle = style.cloneNode(true)
            this.root.appendChild(clonedStyle)

            if (this._config) {
                console.log("CHART-CART Config", config.title, " allready loaded")
                return
            }

            // get the config from the lovelace
            this._config = Object.assign({}, config)
            this.loginfo_enabled = this._config.loginfo || false

            // ha-card settings -----------------------------------
            this.card_title = this._config.title || ""
            this.card_icon = this._config.icon || null
            this.card_height = this._config.height || 240
            this.card_timestamp = this._config.cardtimestamp || false

            // all settings for the chart --------------------------
            this.chart_type = this._config.chart || "bar"
            this._config.id = this.chart_type + Math.floor(Math.random() * 1000)

            // showstate settings: right, left, center
            this.chart_showstate = this._config.showstate || false
            this.chart_showstate = this.chart_showstate === true ? "right" : this.chart_showstate
            if (this.chart_showstate) {
                if (!["left", "right", "center"].includes(this.chart_showstate.toLowerCase())) {
                    this.chart_showstate = false
                }
            }

            this.chart_showdetails = this._config.showdetails
            this.chart_themesettings = this._config.theme || null
            this.loaderart = this._config.loader || "three-dots"
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
            ]
            if (!loaderFiles.includes(this.loaderart)) {
                this.loaderart = "spinning-circles"
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
            ]
            if (!this.chart_type) {
                throw new Error("You need to define type of chart")
            } else if (!availableTypes.includes(this.chart_type)) {
                throw new Error(
                    "Invalid config for 'chart:'" +
                        this.chart_type +
                        ". Available options are: " +
                        availableTypes.join(", ")
                )
            }
            if (this.chart_type.toLowerCase() === "horizontalbar") {
                this.chart_type = "bar"
            }

            const _browserlocale = navigator.language || navigator.userLanguage || "en-GB"
            this.chart_locale = this._config.locale || _browserlocale
            this._checkLocale()

            // setting for data handling
            this.show = this._config.show || {}
            this.data_hoursToShow = this._config.hours_to_show || 0
            if (this.chart_type === "line" && this.data_hoursToShow === 0) {
                this.data_hoursToShow = 24 * 7 // show the last 7 days...
            }
            this.data_group_by = this._config.group_by || "minutes"
            this.data_aggregate = this._config.aggregate || "last"
            this.update_interval = this._config.update_interval * 1000 || 1000 * 60
            this.data_ignoreZero = this._config.ignoreZero || false
            this.data_units = this._config.units || ""

            // check if we can use showstate
            if (["bubble", "scatter"].includes(this.chart_type.toLocaleLowerCase())) {
                this.chart_showstate = false
            } else {
                if (this.data_hoursToShow === 0 && this.chart_showstate) {
                    this.chart_showstate = null
                }
            }

            // create the card and apply the chartjs config
            if (this._initialized === false) {
                this._creatHACard()
            }
        } catch (err) {
            console.log(err.message, config, err)
        }
    }

    /**
     * HASS settings
     *
     */
    set hass(hass) {
        // check if hass is present
        if (hass === undefined) return

        // skip not initialized
        if (this.timeOut) clearTimeout(this.timeOut)

        this._hass = hass
        this.selectedTheme = hass.selectedTheme || { theme: "system", dark: false }
        if (this.theme && this.theme.dark !== this.selectedTheme.dark) {
            // theme has changed
            this.theme = this.selectedTheme
            this._getThemeSettings()
            if (this.graphChart) {
                this.themeSettings.theme = this.theme
                this.graphChart.setThemeSettings(this.themeSettings)
                this.updateGraph(true)
            }
        }
        this.theme = this.selectedTheme

        // An object list containing the states of all entities in Home Assistant.
        // The key is the entity_id, the value is the state object.
        this.hassEntities = this._config.entities
            .map((x) => hass.states[x.entity])
            .filter((notUndefined) => notUndefined !== undefined)

        // check if we have valid entities and skip if we can'nt find the
        // entities in the hass entities list.
        if (!this.hassEntities || this.hassEntities.length === 0) {
            console.error(this.chart_type, "No valid entities found, check your settings...")
            return
        }

        // update only if we has a chart and update_interval is not set
        // 
        if (this.skipRender && this.updating === false && this.update_interval === 0) {
            this.checkUpdate()
            return
        }

        // all entity data
        this.entityData = this.hassEntities.map((x) => (x === undefined ? 0 : x.state))
        this.entityOptions = null

        if (this.ready === false && this.entities.length !== this.hassEntities.length) {
            this.entities = []
            // interate throw all _config.entities
            for (let entity of this._config.entities) {
                if (entity.options) {
                    // all global entity options
                    this.entityOptions = entity.options
                } else {
                    // hass entity
                    const h = this.hassEntities.find((x) => x.entity_id === entity.entity)
                    if (h) {
                        let item = Object.assign({}, entity)
                        if (item.name == undefined && h.attributes) {
                            item.name = h.attributes.friendly_name || item.name
                            item.unit = h.attributes.unit_of_measurement || item.unit || ""
                        }
                        if (item.name !== undefined) {
                            item.last_changed = h.last_changed || this.startTime
                            item.state = h.state || 0.0
                            this.entities.push(item)
                            this.entity_ids.push(entity.entity)
                        }
                    }
                }
            }
            this.ready = (this.entity_ids && this.entity_ids.length) !== 0
        }

        // all entity names this.entities
        this.entityNames = this.entities.map((x) =>
            x.name !== undefined
                ? x.name
                : hass.states[x.entity]["attributes"]["friendly_name"] !== undefined
                ? hass.states[x.entity]["attributes"]["friendly_name"]
                : x.entity
        )

        // wait for 1 before call updateGraph
        this.timeOut = setTimeout(
            () => {
                this.updateGraph(false)
            },
            this.initial ? 200 : this.update_interval
        )

        this.skipRender = true
    }

    /**
     * update graph
     */
    updateGraph(doUpdate) {
        doUpdate = doUpdate === "undefined" ? !this.initial : doUpdate
        if (this.updating === true) return
        if (!this.graphChart) {
            // create the graph chart
            this._getThemeSettings()
            this.themeSettings.theme = this.theme
            this._setChartConfig()
            doUpdate = false
        }
        if (!this.graphChart) return
        this.updating = true
        // get the histroy data and render the graph
        this._getThemeSettings()
        this.themeSettings.theme = this.theme
        this.graphChart.setThemeSettings(this.themeSettings)
        this.entityData = this.hassEntities.map((x) => (x === undefined ? 0 : x.state))
        this.graphChart.entityData = this.entityData
        this.chart_update = doUpdate
        this._getHistory()
        if (this.card_timestamp) this.timestampLayer.innerHTML = localDatetime(new Date().toISOString())
        this.updating = false
        this.initial = false
    }

    /**
     * checks if we need a graph update
     */
    checkUpdate() {
        if (this.updating === true) return false
        // check if we has changes
        if (this.hassEntities && this.hassEntities.length && this._hass) {
            this.hasChanged = false
            // reload the hass entities
            this.hassEntities = this._config.entities
                .map((x) => this._hass.states[x.entity])
                .filter((notUndefined) => notUndefined !== undefined)

            // check for update and set the entity state last and update flag
            for (let entity of this.entities) {
                const h = this.hassEntities.find((x) => x.entity_id === entity.entity)
                entity.laststate = entity.state
                entity.update = false
                if (h && entity.last_changed !== h.last_changed && entity.state !== h.state) {
                    entity.last_changed = h.last_changed
                    entity.state = h.state
                    entity.update = true
                    this.hasChanged = true
                }
            }

            if (this.hasChanged) {
                // refresh and update the graph
                this.updateGraph(true)
            }
            return this.hasChanged
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
                // get histroy data
                this.dataInfo = {
                    starttime: new Date(),
                    endtime: new Date(),
                    entities: this.entity_ids.join(","),
                    time: new Date().getTime(),
                    loading: false,
                    url: "",
                    prev_url: "not_set",
                    param: ""
                }
                this.dataInfo.starttime.setHours(this.dataInfo.starttime.getHours() - this.data_hoursToShow)
                this.dataInfo.endtime.setHours(this.dataInfo.endtime.getHours() + 2)
                const _newparam = `${this.dataInfo.endtime}:${this.dataInfo.entities}`
                if (this.dataInfo.param == _newparam) {
                    console.log("Data allready loaded...")
                    return
                }
                this.dataInfo.param = `${this.dataInfo.endtime}:${this.dataInfo.entities}`
                // build the api url
                this.dataInfo.url = `history/period/${this.dataInfo.starttime.toISOString()}?end_time=${this.dataInfo.endtime.toISOString()}&filter_entity_id=${
                    this.dataInfo.entities
                }&minimal_response`

                if (this.dataInfo.url !== this.dataInfo.prev_url) {
                    // get the history data
                    const prom = this._hass.callApi("GET", this.dataInfo.url).then(
                        (stateHistory) => this._buildGraphData(stateHistory, 1),
                        () => null
                    )
                    this.dataInfo.prev_url = this.dataInfo.url
                }
            } else {
                // build the current for the sensor(s)
                this._buildGraphData(null, 2)
            }
            this.lastUpdate = new Date().toISOString()
        }
    }

    /**
     * render the state data layer
     * @param {*} data
     */
    renderStateData(data) {
        // ------------------------------------------------
        //  SHOW STATE
        // ------------------------------------------------
        let _html = []
        if (this.currentData && this.chart_showstate && data) {
            let _visible = "margin:0;line-height:1.2em"
            _html.push('<div class="state-view-data">')
            for (const item of data) {
                let _style = ' style="' + _visible + ";color:" + item.color + '"'
                _html.push('<div class="stateitem" id="' + item.name + '"' + _style + '">')
                _html.push(
                    '<p class="state-view-value" style="color:' +
                        item.color +
                        ';">' +
                        _formatNumber(this.chart_locale, item.current || 0.0) +
                        "<span>" +
                        item.unit +
                        "</span></p>"
                )
                _html.push('<p class="state-view-name">' + item.name + "</p>")
                _html.push("</div>")
            }
            _html.push("</div>")
            this.currentData.innerHTML = _html.join("")
        }

        if (this.currentData && this.detailData && data) {
            // ------------------------------------------------
            //  DETAIL DATA
            // ------------------------------------------------
            if (this.detailData) {
                _html = []
                if (this.chart_showdetails.title) _html.push("<h2>" + this.chart_showdetails.title + "</h2>")
                _html.push('<div><table class="card-detail-table">')
                _html.push("<tbody><tr>")
                _html.push('<th width="20%"><b>Statistics</b></th>')
                _html.push('<th align="right">Min</th>')
                _html.push('<th align="right">Max</th>')
                _html.push('<th align="right">Current</th>')
                _html.push("<th>Date</th>")
                _html.push("</tr>")
                for (const item of data) {
                    _html.push("<tr>")
                    _html.push(
                        '<td><span style="font-size:4em;color:' +
                            item.color +
                            ';vertical-align:top;padding-right:8px">&bull;</span>' +
                            item.name +
                            "</td>"
                    )
                    _html.push(
                        "<td align='right'>" +
                            _formatNumber(this.chart_locale, item.min || 0.0) +
                            " " +
                            item.unit +
                            "</td>"
                    )
                    _html.push(
                        "<td align='right'>" +
                            _formatNumber(this.chart_locale, item.max || 0.0) +
                            " " +
                            item.unit +
                            "</td>"
                    )
                    _html.push(
                        "<td align='right'>" +
                            _formatNumber(this.chart_locale, item.current || 0.0) +
                            " " +
                            item.unit +
                            "</td>"
                    )
                    _html.push("<td>" + localDatetime(item.timestamp, this.chart_locale) + "</span>")
                    _html.push("</tr></tbody>")
                }
                _html.push("</table></div><br/>")
                if (_html.length) this.detailData.innerHTML = _html.join("")
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
            return null
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
            data_group_by: this.data_group_by,
            data_aggregate: this.data_aggregate,
            setting: this._config,
            chart_locale: this.chart_locale,
            lastUpdate: this.lastUpdate
        })

        // get the chart data
        if (mode === 1) {
            this.graphData = _chartData.getHistoryGraphData()
        } else {
            this.graphData = _chartData.getCurrentGraphData()
        }

        if (this.graphData === null) {
            console.error("No GraphData found for ", this.entityNames)
            return
        } else {
            if (this.graphData && this.graphData.config) {
                this.themeSettings.secondaryAxis = this.graphData.config.secondaryAxis || false
            }
        }

        if (this.chart_update) {
            if (this.graphChart && this.graphData) {
                this.graphChart.graphData = this.graphData
                this.graphChart.renderGraph(true)
            }
        } else {
            if (this.graphChart && this.graphData) {
                this.graphChart.graphData = this.graphData
                this.graphChart.renderGraph(false)
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
                }
            })
            if (_data) this.renderStateData(_data)
            return true
        }
        this.dataInfo.loading = false
    }

    /**
     * The connectedCallback() runs when the element is added to the DOM
     */
    connectedCallback() {
        this._initialized = true // important for loading charts !
        if (this.update_interval === 0) return
        this.updateTimer = setInterval(() => {
            if (this.updating === false) this.checkUpdate()
        }, this.update_interval)
    }

    /**
     * the disconnectedCallback() runs when  when the element is either removed from the DOM,
     */
    disconnectedCallback() {
        this._initialized = false // important for loading charts !
        if (this.updateTimer) {
            clearInterval(this.updateTimer)
        }
    }

    /**
     * The height of the card. Home Assistant uses this to automatically
     * distribute all cards over the available columns.
     */
    getCardSize() {
        return 1
    }
}

customElements.define("chart-card", ChartCard)

/** ----------------------------------------------------------
 
	Lovelaces chartjs - tools
  	(c) 2020 Peter Siebler
  	Released under the MIT license
 
 * ----------------------------------------------------------*/
"use strict"

/**
 * show info
 * @param {*} args
 */
function logInfo(enabled, ...args) {
    if (enabled) console.info(new Date().toISOString(), ...args)
}

const cssAttr = function (v) {
    return typeof v == "number" ? v + "px" : v
}

const _parseNumber = (n) => (n === parseInt(n) ? Number(parseInt(n)) : Number(parseFloat(n).toFixed(2)))
const _formatNumber = (locale, num) => new Intl.NumberFormat(locale).format(_parseNumber(num))
const getMin = (arr, val) => arr.reduce((min, p) => (Number(p[val]) < Number(min[val]) ? p : min), arr[0])
const getAvg = (arr, val) => arr.reduce((sum, p) => sum + Number(p[val]), 0) / arr.length
const getMax = (arr, val) => arr.reduce((max, p) => (Number(p[val]) > Number(max[val]) ? p : max), arr[0])
const arrMin = (arr) => Math.min(...arr)
const arrMax = (arr) => Math.max(...arr)
const arrSum = (arr) => arr.reduce((a, b) => a + b, 0)
const arrAvg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length

/**
 * get the date based on the locale
 * @param {*} d
 * @param {*} locale
 * options: {
        weekday: 'narrow' | 'short' | 'long',
        era: 'narrow' | 'short' | 'long',
        year: 'numeric' | '2-digit',
        month: 'numeric' | '2-digit' | 'narrow' | 'short' | 'long',
        day: 'numeric' | '2-digit',
        hour: 'numeric' | '2-digit',
        minute: 'numeric' | '2-digit',
        second: 'numeric' | '2-digit',
        timeZoneName: 'short' | 'long',

        // Time zone to express it in
        timeZone: 'Asia/Shanghai',
        // Force 12-hour or 24-hour
        hour12: true | false,

        // Rarely-used options
        hourCycle: 'h11' | 'h12' | 'h23' | 'h24',
        formatMatcher: 'basic' | 'best fit'
        }
 */
function localDatetime(d, locale) {
    if (!d) return ""
    if (!locale) locale = navigator.language || navigator.userLanguage || "en-GB"
    const date = new Date(d)
    if (isNaN(date)) return d
    return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric"
    }).format(date)
}

/**
 * Deep Merge
 * Used to merge the default and chart options, because the
 * helper.merge will not work...
 *
 * @param  {...any} sources
 * @returns combined object
 */
function deepMerge(...sources) {
    let acc = {}
    for (const source of sources) {
        if (source instanceof Array) {
            if (!(acc instanceof Array)) {
                acc = []
            }
            acc = [...acc, ...source]
        } else if (source instanceof Object) {
            for (let [key, value] of Object.entries(source)) {
                if (value instanceof Object && key in acc) {
                    value = deepMerge(acc[key], value)
                }
                acc = {
                    ...acc,
                    [key]: value
                }
            }
        }
    }
    return acc
}

/** ----------------------------------------------------------
 
	Lovelaces chartjs - colors
  	(c) 2020 Peter Siebler
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
];

const COLOR_RADARCHART = "rgba(41, 182, 246, 0.45)";
const COLOR_BUBBLECHAT = "rgba(255, 152, 0, 0.685)";
/**
 * get random color from DEFAULT_COLORS
 */
// var randomColor = DEFAULT_COLORS[Math.floor(Math.random()*DEFAULT_COLORS.length)];
const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);

/** ----------------------------------------------------------

  	chart data builder
  
  	TODO: this is not final, try to find a optimized methode
  
 * ----------------------------------------------------------*/

/**
 * class chart data builder
 */
class chartData {
    /**
     * constructor chart data
     * @param {*} config
     */
    constructor(config) {
        this.chart_type = config.chart_type
        this.card_config = config.card_config
        this.entities = config.entities
        this.entityOptions = config.entityOptions
        this.entityData = config.entityData
        this.entityNames = config.entityNames
        this.stateHistories = config.stateHistories
        this.data_group_by = config.data_group_by || "day"
        this.data_aggregate = config.data_aggregate || "last"
        this.settings = config.settings
        this.chart_locale = config.chart_locale
        this.data_pointStyles = [
            "circle",
            "triangle",
            "rectRounded",
            "rect",
            "rectRot",
            "cross",
            "star",
            "line",
            "dash"
        ]
        this.indicators = {
            up: "▲",
            down: "▼",
            equal: "≃"
        }
        this.graphData = {}
    }

    /**
     * build the grouped historydata
     *
     *
     * TODO: this is not final, try to find a optimized methode
     * ---------------------------------------------------------
     * @param {*} array
     * @param {*} fmt
     * @param {*} aggr
     */
    _getGroupHistoryData(array) {
        try {
            if (!array) return
            if (array && !array.length) return
            let groups = {}
            const _num = (n) => (n === parseInt(n) ? Number(parseInt(n)) : Number(parseFloat(n).toFixed(2)))
            const _fmd = (d) => {
                const t = new Date(d)
                if (isNaN(t)) return d
                if (this.data_group_by === "weekday") {
                    return {
                        name: date.toLocaleDateString(this.chart_locale, { weekday: "short" }),
                        label: date.toLocaleDateString(this.chart_locale, { weekday: "long" })
                    }
                }
                const day = ("0" + t.getDate()).slice(-2)
                const month = ("0" + (t.getMonth() + 1)).slice(-2)
                const year = t.getFullYear()
                const hours = ("0" + t.getHours()).slice(-2)
                const minutes = ("0" + t.getMinutes()).slice(-2)
                const seconds = ("0" + t.getSeconds()).slice(-2)
                switch (this.data_group_by) {
                    case "year":
                        return { name: year, label: year }
                    case "month":
                        return { name: `${year}.${month}`, label: `${year}.${month}` }
                    case "day":
                        return { name: `${month}.${day}`, label: `${month}.${day}` }
                    case "hour":
                        return { name: `${month}.${day} ${hours}`, label: [`${month}.${day}`, `${hours}.${minutes}`] }
                    case "minutes":
                        return {
                            name: `${month}.${day} ${hours}:${minutes}`,
                            label: [`${month}.${day}`, `${hours}.${minutes}`]
                        }
                    default:
                        return {
                            name: `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`,
                            label: `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`
                        }
                }
            }
            // first build the groups
            array.forEach(function (o) {
                let group = _fmd(o.last_changed)
                groups[group.name] = groups[group.name] || []
                o.timelabel = group.label
                groups[group.name].push(o)
            })
            // create the grouped seriesdata
            const aggr = this.data_aggregate
            return Object.keys(groups).map(function (group) {
                let items = groups[group].filter(
                    (item) => item.state && !isNaN(parseFloat(item.state)) && isFinite(item.state)
                )
                if (items && items.length === 0) {
                    return {
                        y: 0.0,
                        x: ""
                    }
                }
                if (aggr == "first") {
                    const item = items.shift()
                    return {
                        y: _num(item.state || 0.0),
                        x: item.timelabel
                    }
                }
                if (aggr == "last") {
                    const item = items[items.length - 1]
                    return {
                        y: _num(item.state || 0.0),
                        x: item.timelabel
                    }
                }
                if (aggr == "max") {
                    return items.reduce((a, b) =>
                        a.state > b.state
                            ? {
                                  y: num(a.state || 0.0),
                                  x: a.timelabel
                              }
                            : { y: num(b.state), x: b.timelabel }
                    )
                }
                if (aggr == "min")
                    return items.reduce((a, b) =>
                        a.state < b.state
                            ? {
                                  y: _num(a.state || 0.0),
                                  x: a.timelabel
                              }
                            : {
                                  y: _num(b.state || 0.0),
                                  x: b.timelabel
                              }
                    )
                if (aggr == "sum") {
                    const val = items.reduce((sum, entry) => sum + num(entry.state), 0)
                    return {
                        y: _num(val || 0.0),
                        x: items[0].timelabel
                    }
                }
                if (aggr == "avg") {
                    const val = items.reduce((sum, entry) => sum + _num(entry.state), 0) / items.length
                    return {
                        y: _num(val || 0.0),
                        x: items[0].timelabel
                    }
                }
                return items.map((items) => {
                    return {
                        y: _num(items.state || 0.0),
                        x: items.timelabel
                    }
                })
            })
        } catch (err) {
            console.error("Build Histroydata", err.message, err)
        }
    }

    /**
     * the default graph data
     */
    getDefaultGraphData() {
        return {
            data: {
                labels: [],
                datasets: []
            },
            config: {
                secondaryAxis: false,
                series: 1,
                gradient: false,
                options: {},
                statistics: {}
            }
        }
    }

    /** ----------------------------------------------------------
     *
     * chart data builder state (current) data
     *
     * ----------------------------------------------------------*/

    /**
     * Create dataseries for scatter chart
     * @param {*} _entities
     */
    createScatterChartData() {
        let _graphData = null
        let _entities = this.entities
        if (_entities && _entities.length % 2 === 0) {
            _graphData = this.getDefaultGraphData()
            _graphData.config.mode = "simple"
            for (let i = 0; i < _entities.length; i += 2) {
                // first entity holds the attributes
                const _attr = _entities[i]
                let _options = {
                    label: _attr.name || "",
                    unit: _attr.unit || "",
                    hoverRadius: 20,
                    radius: 15,
                    hitRadius: 20,
                    backgroundColor: _attr.backgroundColor || DEFAULT_COLORS[20 + i],
                    borderColor: _attr.borderColor || COLOR_BUBBLECHAT
                }
                if (this.entityOptions) {
                    _options = { ...this.entityOptions, ..._options }
                    _graphData.config.options = this.entityOptions
                }
                if (this.entityOptions && this.entityOptions.gradient !== undefined) {
                    _graphData.config.gradient = true
                }
                _options.data = [
                    {
                        x: _entities[i].state || 0.0,
                        y: _entities[i + 1].state || 0.0
                    }
                ]
                _graphData.data.datasets.push(_options)
            }
            _graphData.config.options.scatter = true
        } else {
            console.error("ScatterChart setting not valid", this.entities)
        }
        return _graphData
    }

    /**
     * create the series data for the bubble chart
     *
     * Important: the radius property, r is not scaled by the chart,
     * it is the raw radius in pixels of the bubble
     * that is drawn on the canvas.
     */
    createBubbleChartData() {
        let _graphData = null
        let _entities = this.entities
        if (_entities && _entities.length % 3 === 0) {
            _graphData = this.getDefaultGraphData()
            _graphData.config.mode = "simple"
            for (let i = 0; i < _entities.length; i += 3) {
                const _attr = _entities[i + 2]
                let _options = {
                    label: _attr.name || "",
                    scale: _attr.scale || 1.0,
                    unit: _attr.unit || "",
                    backgroundColor: _attr.backgroundColor || COLOR_BUBBLECHAT,
                    borderColor: _attr.borderColor || COLOR_BUBBLECHAT
                }
                if (this.entityOptions) {
                    _options = { ...this.entityOptions, ..._options }
                    _graphData.config.options = this.entityOptions
                }
                if (this.entityOptions && this.entityOptions.gradient !== undefined) {
                    _graphData.config.gradient = true
                }
                if (_attr && _attr.pointStyle) {
                    _options.pointStyle = _attr.pointStyle
                    _options.pointRadius = 6
                }
                if (_attr && _attr.pointRadius) {
                    _options.pointRadius = _attr.pointRadius
                }
                _options.data = [
                    {
                        x: _entities[i].state || 0.0,
                        y: _entities[i + 1].state || 0.0,
                        r: _entities[i + 2].state || 0.0
                    }
                ]
                _graphData.data.datasets.push(_options)
            }
            _graphData.config.options.bubble = true
        } else {
            console.error("BubbleChart setting not valid", this.entities)
        }
        return _graphData
    }

    /**
     * create the segment data for the bars
     * @param {*} dataset
     */
    createSimpleBarSegmentedData(dataset) {
        if (dataset.data && dataset.data.length) {
            dataset.data = dataset.data.map((i) => Number(i))
            const _max = Math.max(...dataset.data)
            const _min = Math.min(...dataset.data)
            const _helpers = Chart.helpers
            return {
                data: dataset.data.map((i) => _max - i),
                backgroundColors: dataset.backgroundColor.map((color) => _helpers.color(color).alpha(0.25).rgbString())
            }
        }
    }

    /**
     * create chart data
     * this is used for pie-, doughnut-, polarArea-,radar-, simple bar chart
     * because we do not need time series - only the current state values.
     *
     * this.graphData.config holds the configruation data
     *
     */
    createChartData() {
        let _data = []

        // entityData    : holds all  current values
        // entityNames   : holds all entities names
        
        // entities      : all entities data and options
        // entityOptions : global entities options

        const emptyIndexes = this.entityData.reduce((arr, e, i) => (e == 0 && arr.push(i), arr), [])
        _data = this.entityData.filter((element, index, array) => !emptyIndexes.includes(index))

        if (_data.length === 0) {
            console.error("No Histroydata present !")
            return null
        }

        let _defaultDatasetConfig = {
            unit: this.data_units || "",
            mode: "current"
        }

        let _graphData = this.getDefaultGraphData()
        _graphData.config.mode = "simple"

        // merge entity options
        if (this.entityOptions) {
            _defaultDatasetConfig = {
                ..._defaultDatasetConfig,
                ...this.entityOptions
            }
        }
        // merge dataset_config
        _graphData.data.labels = this.entityNames.filter((element, index, array) => !emptyIndexes.includes(index))
        _graphData.data.datasets[0] = _defaultDatasetConfig
        _graphData.data.datasets[0].unit = this.card_config.units || ""
        _graphData.data.datasets[0].label = this.card_config.title || ""

        // case horizontal bar
        if (this.card_config.chart.toLowerCase() === "horizontalbar") {
            _graphData.data.datasets[0].indexAxis = "y"
        }
        
        // custom colors from the entities
        let entityColors = this.entities
            .map((x) => {
                if (x.color !== undefined || x.backgroundColor !== undefined) return x.color || x.backgroundColor
            })
            .filter((notUndefined) => notUndefined !== undefined)

        if (this.entityOptions && this.entityOptions.gradient != undefined) {
            _graphData.config.gradient = true
        }

        if (entityColors.length === _graphData.data.labels.length) {
            // list entity colors "backgroundColor": []
            _graphData.data.datasets[0].backgroundColor = entityColors
            _graphData.data.datasets[0].showLine = false
        } else {
            if (this.chart_type === "radar") {
                _graphData.data.datasets[0].backgroundColor = COLOR_RADARCHART
                _graphData.data.datasets[0].borderColor = COLOR_RADARCHART
                _graphData.data.datasets[0].borderWidth = 1
                _graphData.data.datasets[0].pointBorderColor = COLOR_RADARCHART
                _graphData.data.datasets[0].pointBackgroundColor = COLOR_RADARCHART
                _graphData.data.datasets[0].tooltip = true
                _graphData.config.gradient = false
            } else {
                // geht backgroundcolor from DEFAULT_COLORS
                entityColors = DEFAULT_COLORS.slice(1, _data.length + 1)
                _graphData.data.datasets[0].backgroundColor = entityColors
                _graphData.data.datasets[0].borderWidth = 0
                _graphData.data.datasets[0].showLine = false
            }
        }
        _graphData.data.datasets[0].data = _data
        _graphData.config.segmentbar = false

        // add the data series and return the new graph data
        if (this.chart_type === "bar" && this.card_config.show && this.card_config.show.segmented) {
            const newData = this.createSimpleBarSegmentedData(_graphData.data.datasets[0])
            if (newData) {
                _graphData.data.datasets[1] = {}
                _graphData.data.datasets[1].data = newData.data
                _graphData.data.datasets[1].tooltip = false
                _graphData.data.datasets[1].backgroundColor = newData.backgroundColors
                _graphData.data.datasets[1].borderWidth = 0
                _graphData.data.datasets[1].showLine = false
                _graphData.config.segmentbar = newData.data.length !== 0
            }
            // _graphData.data.datasets[0].label = "DDD"
        }

        return _graphData
    }

    /**
     * get the graph data for the entities
     * all current states for the defined entities
     */
    getCurrentGraphData() {
        try {
            switch (this.chart_type.toLowerCase()) {
                case "bubble":
                    this.graphData = this.createBubbleChartData()
                    break
                case "scatter":
                    this.graphData = this.createScatterChartData()
                    break
                default:
                    this.graphData = this.createChartData()
                    break
            }
            return this.graphData
        } catch (err) {
            console.error("Current entities GraphData", err.message, err)
        }
        return null
    }

    /**
     * get series data for bubble or scatter chart
     */
    getSeriesData() {
        let _seriesData = []
        for (const list of this.stateHistories) {
            if (list.length === 0) continue
            if (!list[0].state) continue
            const items = this._getGroupHistoryData(list)
            _seriesData.push(items)
        }
        return _seriesData
    }

    /** ----------------------------------------------------------
     *
     * chart data builder history series data
     *
     * ----------------------------------------------------------*/

    /**
     * get the history bubble chart data
     */
    createHistoryBubbleData() {
        let _seriesData = this.getSeriesData()
        if (_seriesData && _seriesData.length % 3 === 0) {
            let _graphData = this.getDefaultGraphData()
            for (let r = 0; r < _seriesData.length; r += 3) {
                const _attr = this.entities[r + 2]
                let _data = []
                _seriesData[r].forEach(function (e, i) {
                    if (_seriesData[r + 1][i] && _seriesData[r + 2][i]) {
                        _data.push({
                            x: parseFloat(_seriesData[r + 0][i].y) || 0.0,
                            y: parseFloat(_seriesData[r + 1][i].y || 0.0),
                            r: parseFloat(_seriesData[r + 2][i].y || 0.0)
                        })
                    }
                })
                let _options = {
                    label: _attr.name || "",
                    unit: _attr.unit || "",
                    scale: _attr.scale || 1,
                    backgroundColor: _attr.backgroundColor || COLOR_BUBBLECHAT,
                    borderColor: _attr.borderColor || COLOR_BUBBLECHAT
                    // TODO: min, max, avg values
                }
                if (_attr && _attr.pointStyle) {
                    _options.pointStyle = _attr.pointStyle
                    _options.pointRadius = 6
                }
                if (_attr && _attr.pointRadius) {
                    _options.pointRadius = _attr.pointRadius
                }
                if (this.entityOptions) {
                    // simple merge the default with the global options
                    _options = { ..._options, ...this.entityOptions }
                    _graphData.config.options = this.entityOptions
                }
                _options.data = _data
                _graphData.data.datasets.push(_options)
            }
            if (_graphData.data.datasets.length) {
                _graphData.config.options.bubble = true
                return _graphData
            }
        }
        console.error("BubbleChart setting not valid", this.entities)
        return null
    }

    /**
     * get the history scatter chart data
     */
    createHistoryScatterData() {
        let _seriesData = this.getSeriesData()
        if (_seriesData && _seriesData.length % 2 === 0) {
            let _graphData = this.getDefaultGraphData()
            _graphData.config.mode = "history"
            for (let r = 0; r < _seriesData.length; r += 2) {
                // first entity hols the attributes
                const _attr = this.entities[r]
                let _data = []
                _seriesData[r].forEach(function (e, i) {
                    if (_seriesData[r][i] && _seriesData[r + 1][i]) {
                        _data.push({
                            x: parseFloat(_seriesData[r + 0][i].y) || 0.0,
                            y: parseFloat(_seriesData[r + 1][i].y || 0.0)
                        })
                    }
                })
                let _options = {
                    label: _attr.name || "",
                    unit: _attr.unit || "",
                    hoverRadius: 20,
                    radius: 15,
                    hitRadius: 20,
                    backgroundColor: _attr.backgroundColor || DEFAULT_COLORS[10 + r],
                    borderColor: _attr.borderColor || DEFAULT_COLORS[10 + r]
                    // TODO: min, max, avg values ???
                }
                if (_attr && _attr.pointStyle) {
                    _options.pointStyle = _attr.pointStyle
                    _options.pointRadius = 6
                }
                if (_attr && _attr.pointRadius) {
                    _options.pointRadius = _attr.pointRadius
                }
                if (this.entityOptions) {
                    // simple merge the default with the global options
                    _options = { ..._options, ...this.entityOptions }
                    _graphData.config.options = this.entityOptions
                }
                _options.data = _data
                _graphData.data.datasets.push(_options)
            }
            if (_graphData.data.datasets.length) {
                _graphData.config.options.bubble = true
                return _graphData
            }
        }
        console.error("ScatterChart setting not valid", this.entities)
        return null
    }

    /**
     * create the chart history data
     */
    createHistoryChartData() {
        let _graphData = this.getDefaultGraphData()
        _graphData.config.options.fill = false
        _graphData.config.mode = "history"

        // all for other carts
        for (const list of this.stateHistories) {
            if (list.length === 0) continue
            if (!list[0].state) continue

            // interate throw all entities data
            const items = this._getGroupHistoryData(list)

            // if(this.data_aggregate==='first'){
            //     console.log(this.chart_type, items, this.stateHistories)
            // }
            
            const id = list[0].entity_id

            // get all settings from the selected entity
            const _attr = this.entities.find((x) => x.entity === id)

            // build the dataseries and check ignore data with zero values

            let _items = this.card_config.ignoreZero
                ? items.map((d) => d.y).filter((x) => x != 0)
                : items.map((d) => d.y)

            // default Dataset Properties
            let _options = {
                label: _attr.name || "unkonwn",
                unit: _attr.unit || "",
                minval: 0.0,
                maxval: 0.0,
                sumval: 0.0,
                avgval: 0.0,
                current: _attr.state || 0.0,
                last_changed: items[0].last_changed || new Date(),
                mode: "history"
            }

            if (this.card_config.showdetails) {
                _options.minval = Math.min(..._items)
                _options.maxval = Math.max(..._items)
                _options.sumval = arrSum(_items)
                _options.avgval = arrAvg(_items)
            }

            if (this.card_config.chart.toLowerCase() === "horizontalbar") {
                _options.indexAxis = "y"
            }

            if (_attr && _attr.pointStyle) {
                _options.pointStyle = _attr.pointStyle
                _options.pointRadius = 6
            }
            if (_attr && _attr.pointRadius) {
                _options.pointRadius = _attr.pointRadius
            }

            if (this.entityOptions) {
                // simple merge the default with the global options
                _options = { ..._options, ...this.entityOptions }
                _graphData.config.options = { ..._graphData.config.options, ...this.entityOptions }
            }

            // simple merge the entity options
            if (_attr) _options = { ..._options, ..._attr }

            if (_attr.fill !== undefined) {
                _graphData.config.options.fill = _attr.fill
            } else {
                _attr.fill = ["bar", "horizontalbar"].includes(this.card_config.chart.toLowerCase())
            }

            if (_attr.fill && _attr.gradient && _attr.gradient.colors) {
                const _axis = _options.indexAxis === "y" ? "x" : "y"
                _options.gradient = {
                    backgroundColor: {
                        axis: _axis,
                        colors: _attr.gradient.colors
                    }
                }
                _options.labelcolor = _attr.gradient.colors[0]
                _options.borderColor = _attr.gradient.colors[0] || DEFAULT_COLORS[_graphData.config.series]
                _graphData.config.gradient = true
            } else {
                if (_attr.backgroundColor === undefined) {
                    _options.backgroundColor = DEFAULT_COLORS[_graphData.config.series]
                    _options.borderColor = DEFAULT_COLORS[_graphData.config.series]
                }
            }

            // check secondary axis
            if (!_graphData.config.secondaryAxis) {
                _graphData.config.secondaryAxis = _attr.yAxisID != undefined || _attr.xAxisID != undefined
            }

            // assign the data for the current series
            _options.data = _items

            // add the options, labels and data series
            _graphData.data.labels = items.map((l) => l.x)

            _graphData.data.datasets.push(_options)
            _graphData.config.series++
        }
        return _graphData
    }

    /**
     * build the graph cart data and datasets for the
     * defined graph chart. Uses the history data
     * for each entity
     *
     * @param {*} stateHistories
     * @param {*} update
     */
    getHistoryGraphData() {
        try {
            if (this.stateHistories && this.stateHistories.length) {
                // merge with current...

                switch (this.chart_type.toLowerCase()) {
                    case "bubble":
                        this.graphData = this.createHistoryBubbleData()
                        break
                    case "scatter":
                        this.graphData = this.createHistoryScatterData()
                        break
                    default:
                        this.graphData = this.createHistoryChartData()
                        break
                }
                return this.graphData
            }
        } catch (err) {
            console.error("Build History GraphData", err.message, err)
        }
        return null
    }
}

/** ----------------------------------------------------------
 
	Lovelaces chartjs
  	(c) 2020 Peter Siebler
  	Released under the MIT license
 
 * ----------------------------------------------------------*/

/**
 * Lovelaces chartjs
 * graph chart wrapper class
 *
 */
class graphChart {
    /**
     * graph chart constructor
     * @param {*} config
     *
     * @example:
     *  called form setConfig(config)...
     *  let settings = {
     *		ctx: this.ctx,
     *		chart_locale: this.chart_locale,
     *		chart_type: this.chart_type,
     *		themeSettings: this.themeSettings,
     *		chartconfig: this.chartconfig,
     *	}
     *	// init the graph chart
     *	this.graphChart = new graphChart(settings);
     *
     */
    constructor(config) {
        this.chart = null // current chart
        this.ctx = config.ctx || null // the chart canvas element
        this.canvasId = config.canvasId // canvas container id
        this.card_config = config.card_config // current card settings
        this.chart_locale = config.locale || "de-DE" // the locale for number(s) and date(s)
        this.chart_type = config.chart_type || "bar" // the chart type
        this.themeSettings = config.themeSettings || {} // the theme settings (dark or light)
        this.chartconfig = config.chartconfig || {} // the chart config from the template
        this.loader = config.loader // the loading animation
        this.graphData = {} // the graph data
        this.graphDataSets = [] // current graph settings
        this.setting = config.setting
        this.chart_ready = false // boolean chart allready exits
        this.lastUpdate = null // timestamp last chart update
        this.ChartControl = window.Chart3 || Chart // chart global settings
    }

    /**
     * change the theme settings
     * @param {*} options
     */
    setThemeSettings(options) {
        this.themeSettings = options
        return true
    }

    /**
     * chart global settings
     */
    _setChartDefaults() {
        // global default settings
        if (this.themeSettings.chartdefault === true) return
        this.ChartControl = window.Chart3
        try {
            if (this.ChartControl && this.ChartControl.defaults) {
                // global defailt settings
                this.ChartControl.defaults.responsive = true
                this.ChartControl.defaults.maintainAspectRatio = false
                this.ChartControl.defaults.animation = 0
                this.ChartControl.defaults.locale = this.chart_locale

                // global font settings
                if (
                    this.ChartControl.defaults &&
                    this.ChartControl.defaults.font &&
                    this.ChartControl.defaults.font.family
                ) {
                    this.ChartControl.defaults.font.family = this.themeSettings.fontFamily
                }
                if (this.ChartControl.defaults && this.ChartControl.defaults.color) {
                    this.ChartControl.defaults.color = this.themeSettings.fontColor
                    // new beta 7 !
                    this.ChartControl.defaults.plugins.legend.labels.color = this.themeSettings.fontColor
                }
                if (this.ChartControl.defaults.layout && this.ChartControl.defaults.layout.padding) {
                    this.ChartControl.defaults.layout.padding = {
                        top: 24,
                        left: 0,
                        right: 0,
                        bottom: 0
                    }
                }

                // Legend new beta 7 !
                if (this.ChartControl.defaults.plugins && this.ChartControl.defaults.plugins.legend) {
                    this.ChartControl.defaults.plugins.legend.position = "top"
                    this.ChartControl.defaults.plugins.legend.labels.usePointStyle = true
                    this.ChartControl.defaults.plugins.legend.labels.boxWidth = 8
                    this.ChartControl.defaults.plugins.legend.show = false
                }

                // Tooltips new beta 7 !
                if (this.ChartControl.defaults.plugins && this.ChartControl.defaults.plugins.tooltip) {
                    this.ChartControl.defaults.plugins.tooltip.enabled = true
                    this.ChartControl.defaults.plugins.tooltip.backgroundColor = this.themeSettings.tooltipsBackground
                    this.ChartControl.defaults.plugins.tooltip.titleColor = this.themeSettings.tooltipsFontColor
                    this.ChartControl.defaults.plugins.tooltip.bodyColor = this.themeSettings.tooltipsFontColor
                    this.ChartControl.defaults.plugins.tooltip.footerColor = this.themeSettings.tooltipsFontColor
                }

                // gridlines
                if (this.themeSettings && this.themeSettings.showGridLines) {
                    this.ChartControl.defaults.scale.gridLines.lineWidth = this.themeSettings.gridLineWidth
                    if (this.ChartControl.defaults.set) {
                        this.ChartControl.defaults.set("scale", {
                            gridLines: {
                                display: true,
                                color: this.themeSettings.gridlineColor,
                                drawBorder: true,
                                borderDash: this.themeSettings.borderDash,
                                zeroLineWidth: 8
                            }
                        })
                    }
                }

                // element settings
                if (this.ChartControl.defaults.elements && this.ChartControl.defaults.elements.arc)
                    this.ChartControl.defaults.elements.arc.borderWidth = 0
                if (this.ChartControl.defaults.elements && this.ChartControl.defaults.elements.line) {
                    this.ChartControl.defaults.elements.line.fill = false
                    this.ChartControl.defaults.elements.line.tension = 0
                    // this.ChartControl.defaults.elements.line.cubicInterpolationMode = 'monotone';
                }
                if (this.ChartControl.defaults.elements && this.ChartControl.defaults.elements.point) {
                    this.ChartControl.defaults.elements.point.radius = 0.33
                    this.ChartControl.defaults.elements.point.borderWidth = 0
                    this.ChartControl.defaults.elements.point.hoverRadius = 8
                    this.ChartControl.defaults.elements.point.hitRadius = 8
                }

                // chart type based
                if (this.ChartControl.defaults.set) {
                    switch (this.chart_type.toLowerCase()) {
                        case "radar":
                            this.ChartControl.defaults.set("controllers.radar.scales.r", {
                                ticks: {
                                    backdropColor: "transparent"
                                },
                                angleLines: {
                                    display: true,
                                    color: this.themeSettings.gridlineColor,
                                    lineWidth: this.themeSettings.gridLineWidth
                                },
                                gridLines: {
                                    circular: true
                                }
                            })
                            this.ChartControl.defaults.set("scale", {
                                gridLines: {
                                    display: true,
                                    lineWidth: this.themeSettings.gridLineWidth * 2,
                                    borderDash: [0]
                                }
                            })
                            this.ChartControl.defaults.elements.point.hoverRadius = 8
                            this.ChartControl.defaults.elements.point.pointRadius = 8
                            break

                        case "polararea":
                            this.ChartControl.defaults.set("controllers.polarArea.scales.r", {
                                ticks: {
                                    backdropColor: "transparent"
                                },
                                angleLines: {
                                    display: true,
                                    color: this.themeSettings.gridlineColor,
                                    lineWidth: this.themeSettings.gridLineWidth * 2
                                },
                                gridLines: {
                                    circular: true,
                                    lineWidth: this.themeSettings.gridLineWidth * 1.6,
                                    borderDash: [0]
                                }
                            })
                            this.ChartControl.defaults.set("scale", {
                                gridLines: {
                                    display: true
                                }
                            })
                            break
                        case "scatter":
                        case "bubble":
                        case "line":
                        case "bar":
                        case "pie":
                        case "doughnut":
                        default:
                            break
                    }
                }
                this.themeSettings.chartdefault = true
            }
        } catch (err) {
            console.error("Error Set Chart defaults for", this.chart_type, ": ", err, err.message)
        }
    }

    /**
     * set the chart option based on the default
     * and the chart settings.
     *
     * this.graphData.config holds the configruation data
     * from the data service
     *
     * @called: from rendergraph and updategraph
     */
    _setChartOptions() {
        // the animated loader
        const _loader = this.loader
        // chart default options
        let _options = {
            units: this.data_units || "",
            layout: {},
            chartArea: {
                backgroundColor: "transparent"
            },
            hover: {
                mode: "nearest",
                intersect: true
            },
            elements: {},
            spanGaps: true,
            plugins: {
                title: {},
                tooltip: {},
                legend: {
                    display: this.themeSettings.showLegend || false
                },
                scales: {}
            },
            animation: {
                onComplete: function () {
                    if (_loader) _loader.style.display = "none"
                }
            },
            onResize: null
        }

        if (this.themeSettings.gradient === true) {
            if (this.graphData.config.gradient === true && this.graphData.config.mode === "simple") {
                //enable gradient colors for state charts
                _options.gradientcolor = {
                    color: true,
                    type: this.chart_type
                }
            }
            if (this.graphData.config.gradient) {
                // enable gradient colors for data series chart
                _options.plugins = {
                    gradient
                }
            }
        }

        // ---------------------------------------------------
        // check secondary axis
        // this.graphData.config holds the configruation data
        // this.graphData.data.datasets data per series
        // ---------------------------------------------------
        if (
            this.graphData.config.secondaryAxis &&
            this.graphData &&
            this.graphData.data &&
            this.graphData.data.datasets
        ) {
            let _scaleOptions = {}
            this.graphData.data.datasets.forEach((dataset) => {
                if (dataset.yAxisID) {
                    _scaleOptions[dataset.yAxisID] = {}
                    _scaleOptions[dataset.yAxisID].id = dataset.yAxisID
                    _scaleOptions[dataset.yAxisID].type = "linear"
                    _scaleOptions[dataset.yAxisID].position = dataset.yAxisID
                    _scaleOptions[dataset.yAxisID].display = true
                    if (dataset.yAxisID.toLowerCase() == "right") {
                        _scaleOptions[dataset.yAxisID].gridLines = {
                            borderDash: [2, 5],
                            drawOnChartArea: false
                        }
                    }
                }
                if (dataset.xAxisID) {
                    _scaleOptions[dataset.xAxisID] = {}
                    _scaleOptions[dataset.xAxisID].id = dataset.xAxisID
                    _scaleOptions[dataset.xAxisID].type = "linear"
                    _scaleOptions[dataset.xAxisID].position = dataset.xAxisID
                    _scaleOptions[dataset.xAxisID].display = true
                    if (dataset.xAxisID.toLowerCase() == "top") {
                        _scaleOptions[dataset.xAxisID].gridLines = {
                            borderDash: [2, 5],
                            drawOnChartArea: false
                        }
                    }
                }
            })
            if (_scaleOptions) {
                _options.scales = _scaleOptions
            }
        }
        // set the axis label based on the data settings
        if (this.chart_type.toLowerCase() === "bubble") {
            let labelX = this.card_config.entities[0].name
            labelX += this.card_config.entities[0].unit ? " (" + this.card_config.entities[0].unit + ")" : ""
            let labelY = this.card_config.entities[1].name
            labelY += this.card_config.entities[1].unit ? " (" + this.card_config.entities[1].unit + ")" : ""
            _options.scales = {
                x: {
                    id: "x",
                    scaleLabel: {
                        display: true,
                        labelString: labelX
                    }
                },
                y: {
                    id: "y",
                    scaleLabel: {
                        display: true,
                        labelString: labelY
                    }
                }
            }
            // scale bubble (optional)
            // _options.elements = {
            //     point: {
            //         radius: (context) => {
            //             const value = context.dataset.data[context.dataIndex];
            //             return value._r * 0.5;
            //         }
            //     }
            // };
        }

        // case barchart segment
        // TODO: better use a plugin for this feature.
        // set bar as stacked, hide the legend for the segmentbar,
        // hide the tooltip item for the segmentbar.
        if (this.graphData.config.segmentbar === true) {
            _options.scales = {
                x: {
                    id: "x",
                    stacked: true
                },
                y: {
                    id: "y",
                    stacked: true
                }
            }
            _options.plugins.legend = {
                display: false,
                labels: {
                    filter: (legendItem, data) => {
                        return data.datasets[legendItem.datasetIndex].tooltip !== false
                    }
                }
            }
            _options.plugins.tooltip.callbacks = {
                label: (chart) => {
                    if (chart.dataset.tooltip === false || !chart.dataset.label) {
                        return null
                    }
                    return chart.formattedValue + " " + chart.dataset.unit || ""
                }
            }
        }
        if (this.chart_type.toLowerCase() === "bubble") {
            _options.plugins.legend = {
                display: false
            }
        }
        // preset cart current config
        let chartCurrentConfig = {
            type: this.chart_type,
            data: {
                labels: [],
                datasets: []
            },
            options: _options
        }

        // chart global settings
        this._setChartDefaults()
        // ---------------------------------------
        // merge default with chart config options
        // this.chartconfig.options see yaml config
        // - chart
        //   - options:
        // ---------------------------------------
        if (this.chartconfig.options) {
            chartCurrentConfig.options = deepMerge(_options, this.chartconfig.options)
        } else {
            chartCurrentConfig.options = _options
        }
        return chartCurrentConfig
    }

    /**
     * developer test
     * send the chart settings to the local server.
     * @param {*} chartdata
     */
    sendJSON(url, chartdata) {
        // Creating a XHR object
        let xhr = new XMLHttpRequest()
        // let url = "http://dev.siebler.at/test/getdata.php?file="+this.card_config.id+'.json';

        // open a connection
        xhr.open("POST", url, true)

        // Set the request header i.e. which type of content you are sending
        xhr.setRequestHeader("Content-Type", "application/json")

        // Create a state change callback
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                // Print received data from server
                console.log("sendJson", this.responseText)
            }
        }

        // Converting JSON data to string
        var data = JSON.stringify(chartdata)
        console.log(data)

        // Sending data with the request
        xhr.send(data)
    }

    /**
     * render the graph based on the settings and datasets.
     * @example:
     *    this.graphChart.graphData = this.graphData
     *    this.graphChart.renderGraph()
     */
    renderGraph(doUpdate) {
        try {
            if (this.graphData) {
                if (
                    this.graphDataSets &&
                    this.graphDataSets.length &&
                    JSON.stringify(this.graphDataSets) === JSON.stringify(this.graphData.data.datasets)
                ) {
                    // same data as before, skip redraw...
                    return
                }
                // append the data for the current chart settings
                let graphOptions = this._setChartOptions()
                graphOptions.data = {
                    labels: this.graphData.data.labels,
                    datasets: this.graphData.data.datasets
                }

                // Chart declaration
                if (this.ctx && graphOptions.data && graphOptions.options) {
                    if (doUpdate && this.chart && this.chart.data) {
                        // redraw the chart with the current options
                        // and updated data series
                        this.chart.data = graphOptions.data
                        this.chart.update({
                            duration: 0,
                            easing: "linear"
                        })
                    } else {
                        // set the chart options
                        if (this.chart_ready === false && this.ChartControl.register) {
                            // create and draw the new chart with the current settings
                            // and the dataseries. Register all plugins
                            if (this.graphData.config.gradient && this.themeSettings.gradient === true) {
                                this.ChartControl.register(gradient)
                            }
                            if (
                                this.ChartControl &&
                                this.chartconfig &&
                                this.chartconfig.options &&
                                this.chartconfig.options.chartArea &&
                                this.chartconfig.options.chartArea.backgroundColor !== ""
                            ) {
                                this.ChartControl.register({
                                    id: "chardbackground",
                                    beforeDraw: function (chart) {
                                        if (
                                            chart.config.options.chartArea &&
                                            chart.config.options.chartArea.backgroundColor
                                        ) {
                                            const chartArea = chart.chartArea
                                            const ctx = chart.ctx
                                            ctx.save()
                                            ctx.fillStyle = chart.config.options.chartArea.backgroundColor
                                            ctx.fillRect(
                                                chartArea.left,
                                                chartArea.top,
                                                chartArea.right - chartArea.left,
                                                chartArea.bottom - chartArea.top
                                            )
                                            ctx.restore()
                                        }
                                    }
                                })
                            }
                        }

                        // just for developer
                        // if (this.card_config.testcase) this.sendJSON(this.card_config.testcase, graphOptions)

                        if (this.chart) {
                            // be shure that no chart exits before create..
                            this.chart.destroy()
                            this.chart = null
                        }

                        this.chart = new window.Chart3(this.ctx, graphOptions)
                        this.graphDataSets = this.graphData.data.datasets

                        if (this.chart) {
                            this.chart_ready = true
                        }
                    }
                }
            } else {
                console.error("Missing settings or data", graphOptions)
            }
        } catch (err) {
            console.error("Render Graph Error on ", this.chart_type, ": ", err, err.message)
        }
    }
}
