/** --------------------------------------------------------------------

  Custom Chart Card 
  based on https://github.com/sdelliot/pie-chart-card

  chartjs:    https://www.chartjs.org/
  gradient:   https://github.com/kurkle/chartjs-plugin-gradient#readme

/** -------------------------------------------------------------------*/
"use strict"

// Chart.js  and used plugins, production use min.js
import "/hacsfiles/chart-card/chart.js?module"

// ! importend to fix the collision with ha used chart.js 2.9
window.Chart3 = Chart;

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
        
        if (this.ready === false && this.entities.length !== this.hassEntities.length) {
            this.entityOptions = null
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
