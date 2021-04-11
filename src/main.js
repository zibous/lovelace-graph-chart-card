/** --------------------------------------------------------------------
  Custom Chart Card for chart.js
  (c) 2021 Peter Siebler
  Released under the MIT license
/** -------------------------------------------------------------------*/

// ! importend to fix the collision with ha used chart.js 2.9
window.Chart3 = Chart
const gradient = window["chartjs-gradient"]

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
        margin-top: 1.925em;
    }
    .card-detail-view  hr{
        border-bottom-width: 0px;
        opacity:0.5;
    }   
    .card-detail-view h2{
        margin-left: 0.5em
    }
    .card-detail-table{
        margin: 0 auto;
        font-size:0.925em;
        font-weight:300;
        width: 95%;
        border-collapse: collapse !important;
        table-layout: fixed;
        text-align:left;
        line-height: 1.8rem
    }
    table-row-background-color

    .card-detail-table  tr:nth-child(even) {background: var(--table-row-background-color)}
    .card-detail-table  tr:nth-child(odd) {background:var(--table-row-alternative-background-color)}

    .card-detail-table th{
        padding: 0 6px;
        font-weight:400;
    }
    .card-detail-table td{
        padding: 0 6px;
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

        /**
         * Element functionality written in here
         */
        this._hass = null
        this._config = null
        this.attachShadow({ mode: "open" })

        /**
         * card settings
         */
        this.card_icon = null
        this.card_title = null
        this.card_height = 240

        /**
         * all for chart
         */
        this.theme = ""
        this.themeSettings = null
        this.graphChart = null
        this.chart_type = "bar"
        this.chart_locale = "de-DE"
        this.chart_update = false
        this.ctx = null
        this.chartconfig = null
        this.graphData = {}

        /**
         *  data providers
         */
        this.hassEntities = [] // all from hass
        this.entity_items = new Entities(null, false) // all entity data
        this.entity_options = null // all entity options

        /**
         *  data service
         */
        this.updateTimer = -1
        this.update_interval = 60 * 1000
        this.skipRender = false
        this.lastUpdate = null
        this.ready = false
        this.updating = false
        this._initialized = false
        this.initial = true

        /**
         * all for the dataprovider
         */
        this.dataInfo = {
            starttime: new Date(),
            endtime: new Date(),
            entity_items: null,
            entities: "",
            group_by: "1h",
            time: new Date().getTime(),
            loading: false,
            url: "",
            prev_url: "not_set",
            param: "",
            options: ""
        }

        /**
         * internal debugger and profiler
         */
        this.DEBUGMODE = 0
        this.DEBUGDATA = {
            API: {}
        }
        this.APISTART = performance.now()
        this.DEBUGDATA.API.elapsed_total = 0
        this.DEBUGDATA.PROFILER = {}
    }

    /**
     * evaluate the CSS variable
     * @param {*} variable
     */
    _evaluateCssVariable(v) {
        try {
            return getComputedStyle(document.documentElement).getPropertyValue(v).trim()
        } catch (err) {
            console.error("ERROR evaluateCssVariable:", v, "ERROR", err.message, err)
        }
        return v
    }
    /**
     * set the default settings
     */
    _setDefaultThemeSettings() {
        this.themeSettings = {
            theme: { theme: "system", dark: false },
            fontColor: "#1E1E1E",
            fontFamily: "Quicksand, Roboto,'Open Sans','Rubik','Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
            gridlineColor: "1E1E1E",
            zeroLineColor: "#333333",
            tooltipsBackground: "#ecf0f1",
            tooltipsFontColor: "#647687",
            showGridLines: CT_CHARTGRIDLINES.includes(this.chart_type.toLowerCase()) || false,
            secondaryAxis: false,
            gridLineWidth: 1.0,
            borderDash: [1, 1],
            padding: {
                top: 20,
                right: 24,
                bottom: 12,
                left: 24
            },
            useAnimations: true,
            locale: this.chart_locale
        }
    }
    /**
     * get the settings from the hass theme
     * @returns boolean
     */
    _getThemeSettings() {
        this._setDefaultThemeSettings()
        try {
            this.themeSettings.fontColor =
                (this.chart_themesettings && this.chart_themesettings.fontcolor) ||
                this._evaluateCssVariable("--chartjs-text-fontColor") ||
                this._evaluateCssVariable("--primary-text-color") ||
                this.themeSettings.fontFamily
            this.themeSettings.fontFamily =
                this._evaluateCssVariable("--chartjs-fontFamily") ||
                this._evaluateCssVariable("--paper-font-common-base_-_font-family") ||
                "Quicksand, Roboto,'Open Sans','Rubik','Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
            this.themeSettings.gridlineColor =
                (this.chart_themesettings && this.chart_themesettings.gridlinecolor) ||
                this._evaluateCssVariable("--chartjs-gridline-color") ||
                this._evaluateCssVariable("--light-primary-color") ||
                this.themeSettings.gridlineColor
            this.themeSettings.zeroLineColor =
                (this.chart_themesettings && this.chart_themesettings.zerolinecolor) ||
                this._evaluateCssVariable("--chartjs-zero-gridline-color") ||
                this._evaluateCssVariable("--dark-primary-color") ||
                this.themeSettings.zeroLineColor
            this.themeSettings.tooltipsBackground =
                (this.chart_themesettings && this.chart_themesettings.tooltipsbackground) ||
                this._evaluateCssVariable("--chartjs-tooltip-background") ||
                this.themeSettings.tooltipsBackground
            this.themeSettings.tooltipsFontColor =
                (this.chart_themesettings && this.chart_themesettings.tooltipsfontcolor) ||
                this._evaluateCssVariable("--chartjs-text-fontcolor") ||
                this.themeSettings.tooltipsFontColor
            this.themeSettings.showGridLines = CT_CHARTGRIDLINES.includes(this.chart_type.toLowerCase()) || false
            this.themeSettings.secondaryAxis = false
            this.themeSettings.themecolorused = this._evaluateCssVariable("--chartjs-theme") || false

            this.themeSettings.useAnimations = this._evaluateCssVariable("--chart-animantions") || this.themeSettings.useAnimations

            /**
             * get the theme from the hass or private theme settings
             */
            if (this.theme === undefined || this.theme.dark === undefined) {
                this.theme = { theme: "system", dark: this.themeSettings.themecolorused === "dark" || false }
                this.themeSettings.theme = this.theme
            }
            if (this.theme && this.theme.dark != undefined) {
                this.themeSettings.theme = this.theme
            }
            this.themeSettings.gridLineWidth = this.themeSettings.theme.dark ? 0.8 : 1.0
            this.themeSettings.borderDash = [1, 1]

            if (this.chartconfig.options && this.chartconfig.options.scale && this.chartconfig.options.scale.gridLines)
                this.themeSettings.showGridLines = true
            if (this.chartconfig.options && this.chartconfig.options.legend) this.themeSettings.showLegend = true

            if (this.DEBUGMODE) {
                this.DEBUGDATA.THEMESETTINGS = this.themeSettings
            }
            setChartDefaults(this.themeSettings)

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
        /**
         * get the theme settings (color, font...)
         * and init the graph chart
         */
        this._getThemeSettings()
        if (this.ctx) {
            let settings = {
                ctx: this.ctx,
                canvasId: this.canvasId,
                entity_items: this.entity_items,
                chart_type: this.chart_type,
                chartconfig: this.chartconfig,
                loader: this.loader,
                debugmode: this.DEBUGMODE,
                debugdata: this.DEBUGDATA
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

        /**
         * the ha-card
         */
        const card = document.createElement("ha-card")
        card.setAttribute("class", "graph-card")
        card.id = this.id + "-card"
        card.setAttribute("data-graphtype", this.chart_type)
        if (this.chart_themesettings && this.chart_themesettings.cardbackground) {
            /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
            card.style.cssText += `background: ${this.chart_themesettings.cardbackground} !important;`
        }

        /**
         * ha-card content layer
         */
        const content = document.createElement("div")
        content.setAttribute("class", "card-content")
        content.id = this.id + "-view"
        content.style.height = cssAttr(this.card_height)

        /**
         * ha-card icon and title
         */
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

        /**
         * ha-card canavas element
         */
        this.canvasId = this.id + "-chart"
        const canvas = document.createElement("canvas")
        canvas.setAttribute("class", "card-canvas")
        this.ctx = canvas.getContext("2d")
        canvas.id = this.canvasId
        let _canavasOffset = 10
        if (this.showstate && this.showstate === "center") {
            _canavasOffset = 60
        }
        canvas.height = this.card_height - _canavasOffset
        canvas.style.height = cssAttr(this.card_height - _canavasOffset)
        canvas.style.maxHeight = cssAttr(this.card_height - _canavasOffset)
        canvas.style.display = "block"

        /**
         * ha-card svg loader element
         */
        if (this.loaderart) {
            this.loader = document.createElement("img")
            this.loader.setAttribute("class", "card-loader")
            this.loader.id = this.id + "-loader"
            this.loader.alt = "loading..."
            this.loader.style.width = "60"
            this.loader.src = appinfo.assets + this.loaderart + ".svg"
        }

        /**
         * ha-card state data
         */
        if (this.chart_showstate) {
            this.currentData = document.createElement("div")
            this.currentData.setAttribute("class", "card-state-view")
            this.currentData.id = this.id + "state-view"
        }

        /**
         * ha-card detail data
         */
        if (this.chart_showdetails) {
            this.detailData = document.createElement("div")
            this.detailData.setAttribute("class", "card-detail-view")
            this.detailData.id = this.id + "detail-info"
            this.currentData.setAttribute("data-view", this.detailData.id)
        } else {
            content.style.maxHeight = cssAttr(this.card_height)
        }

        /**
         * add all defined elements to the card
         */
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
            this._renderCardTimestamp()
            card.appendChild(this.timestampLayer)
        }
        this.card = card

        /**
         * create the ha-card
         */
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
     * all registrated entities for this chart
     */
    getEntities() {
        const _entities = this._config.entities || []
        if (!_entities || _entities.length === 0) return
        /**
         * remove filterlist items
         * only entity items skip options
         */
        const _filterlist = this._config.entities.filter((x) => x.entity_filter != undefined)
        const _entitylist = this._config.entities.filter((x) => x.entity != undefined)
        /**
         * check filterlist and merge this
         */
        if (this._hass && this._hass.states && _filterlist && _filterlist.length) {
            const _hass_states = this._hass.states
            const _filterEntities = filter(_hass_states, _filterlist)
            return [..._entitylist, ..._filterEntities]
        }
        return _entities
    }

    /**
     * check the yaml based datascale settings
     */
    _checkDatascales() {
        this.datascales = Object.assign({}, this._config.datascales)

        this.datascales.chart = this.chart_type.toLowerCase()
        this.datascales.cardtitle = this.card_title
        this.datascales.range = this.datascales.range || 0

        if (typeof this.datascales.mode == "undefined") {
            this.datascales.mode = CT_DATASCALEMODES[this.datascales.chart]
        } else {
            this.datascales.mode = CT_DATASCALEMODES[this.datascales.mode] || CT_DATASCALEMODES[this.datascales.chart]
        }

        if (this.datascales.range !== 0 && !this.datascales.mode.history) {
            this.datascales.mode.history = true
        }

        if (this.chart_type === "line" && this.datascales.range === 0) {
            this.datascales.range = 24
            this.datascales.unit = "hour"
            this.datascales.format = this.datascales.format || this.datascales.unit
        }

        if (this.datascales.range) {
            this.datascales.unit = this.datascales.unit || "day"
            this.datascales.format = this.datascales.format || "day"
            this.datascales.ignoreZero = this.datascales.ignoreZero || true
            this.datascales.aggregate = this.datascales.aggregate || "last"
        }

        if (this.datascales.unit && DSC_UNITS.includes(this.datascales.unit.toLowerCase()) == false) {
            this.datascales.range = 24
            this.datascales.unit = "day"
            this.datascales.format = this.datascales.format || this.datascales.unit
        }

        if (this.datascales.aggregate && DSC_RANGES.includes(this.datascales.aggregate.toLowerCase()) == false) {
            this.datascales.aggregate = "last"
        }

        this.datascales.factor = this.datascales.factor || 1.0
        this.datascales.isoWeekday = this.datascales.isoWeekday || 1
    }

    /**
     * Home Assistant will call setConfig(config) when the configuration changes (rare).
     * If you throw an exception if the configuration is invalid,
     * Lovelace will render an error card to notify the user.
     */
    setConfig(config) {
        /**
         * check yaml config
         */
        if (!config.entities) {
            throw new Error("You need to define an entity")
        }

        try {
            /**
             * simple check if we have allready the config present
             */
            if (this._config) {
                console.error("CHART-CART Config", config.title, " allready loaded...")
                return
            }

            /**
             * set the root element for the card
             */
            this.root = this.shadowRoot
            while (this.root.hasChildNodes()) {
                this.root.removeChild(root.lastChild)
            }

            /**
             * default style settings
             */
            const clonedStyle = style.cloneNode(true)
            this.root.appendChild(clonedStyle)

            /**
             * get the config from the lovelace
             */
            this._config = Object.assign({}, config)
            this._config.chart = this._config.chart || "bar"
            /**
             * debugger settings
             * default is no debug mode
             */
            this.DEBUGMODE = this._config.debug || this.DEBUGMODE

            /**
             * ha-card settings
             * default is no title
             */
            this.card_title = this._config.title || ""
            this.card_icon = this._config.icon || null
            this.card_height = this._config.height || 240
            this.card_timestamp = this._config.cardtimestamp || true

            /**
             * all settings for the chart
             * default is bar chart
             */
            this.chart_type = this._config.chart || "bar"
            this._config.id = this.chart_type + Math.floor(Math.random() * 1000)

            /**
             * showstate settings: right, left, center
             * default do not show the state
             */
            this.chart_showstate = this._config.showstate || false
            this.chart_showstate = this.chart_showstate === true ? "right" : this.chart_showstate
            if (this.chart_showstate) {
                if (!STATE_POS.includes(this.chart_showstate.toLowerCase())) {
                    this.chart_showstate = false
                }
            }

            /**
             * detail settings
             */
            this.chart_showdetails = this._config.showdetails || false
            this.chart_showdetails =
                (this.chart_showdetails.title_mean ||
                    "" + this.chart_showdetails.title_min ||
                    "" + this.chart_showdetails.title_max ||
                    "") != ""

            /**
             * detail optional theme and loader
             * default is spinning-circles, lovelace config can overwrite the default
             */
            this.chart_showdetails = this._config.showdetails
            this.chart_themesettings = this._config.theme || null
            this.loaderart = this._config.loader || "three-dots"

            if (!LOADERFILES.includes(this.loaderart)) {
                this.loaderart = "spinning-circles"
            }

            /**
             * check chart type
             */
            if (!this.chart_type) {
                throw new Error("You need to define type of chart")
            } else if (!CT_AVIABLETYPES.includes(this.chart_type)) {
                throw new Error(
                    "Invalid config for 'chart:'" + this.chart_type + ". Available options are: " + availableTypes.join(", ")
                )
            }
            if (this.chart_type.toLowerCase() === "horizontalbar") {
                this.chart_type = "bar"
            }

            /**
             * set the chartconfig config
             */
            this.chartconfig = {}
            this.chartconfig.type = this.chart_type
            if (this._config.options || this._config.chartOptions) {
                this.chartconfig.options = this._config.options || this._config.chartOptions
            }

            /**
             * setting for data handling
             * default is navigator language, hass will overrite this
             */
            this.chart_locale = navigator.language || navigator.userLanguage || "DE"
            this._checkLocale()

            /**
             * data scale settings
             */
            this._checkDatascales()

            /**
             * set the update_intervall
             * default is every minute (60 * 1000)
             * lovelace setting can overwrite this
             */
            this.update_interval = this._config.update_interval * 1000 || this.update_interval

            /**
             * check if we can use showstate
             * showstate not possible for bubble and scatter or
             * on simple state charts
             */
            if (CT_NOSHOWSTATES.includes(this.chart_type.toLocaleLowerCase())) {
                this.chart_showstate = false
            } else {
                if (this.datascales.range === 0 && this.chart_showstate) {
                    this.chart_showstate = false
                }
            }
            this.chart_showstate = this.chart_showstate == true ? "right" : this.chart_showstate

            /**
             * create the card and apply the chartjs config
             */
            if (this._initialized === false) {
                this._creatHACard()
            }
        } catch (err) {
            console.error(err.message, config, err)
        }
    }

    /**
     * apply all data to the used entity items
     * @param {*} _entities
     * @returns true / false
     */
    setEntity_itemsData(_entities) {
        if (this.ready === false && this.entity_items.getSize() !== this.hassEntities.length) {
            /**
             * init interate throw all _config.entities
             */
            this.entity_options = null
            this.entity_items = new Entities(null)
            for (const entity of _entities) {
                if (entity.options) {
                    /**
                     * all global entity options
                     */
                    this.entity_options = Object.assign({}, entity.options)
                } else {
                    /**
                     * hass entity
                     */
                    const h = this.hassEntities.find((x) => x.entity_id === entity.entity)
                    if (h) {
                        /**
                         * create new item
                         */
                        let item = this.entity_items.getEntity(entity.entity) || Object.assign({}, entity)
                        if (h.attributes) {
                            if (item.name === undefined) item.name = h.attributes.friendly_name || item.name
                            item.unit = h.attributes.unit_of_measurement || item.unit || ""
                        }
                        /**
                         * add this the entities list
                         */
                        if (item.name !== undefined) {
                            /**
                             * item state
                             */
                            item.last_changed = h.last_changed
                            item.state = h.state || 0.0
                            item.value = h.state || 0.0
                            /**
                             * item data scales
                             */
                            item.datascales = this.datascales
                            item.datascales.ignoreZero = item.ignoreZero || this.datascales.ignoreZero || false
                            item.datascales.aggregate = item.aggregate || this.datascales.aggregate || "last"
                            item.datascales.factor = item.factor || this.datascales.factor
                            item.datascales.useStatistics = this.chart_showdetails || false
                            item.state = item.state * item.datascales.factor
                            item.factor = item.datascales.factor
                            if (item.attribute) {
                                item.state = (h.attributes[item.attribute] || 0.0) * item.factor
                            }
                            item.chart = this.chart_type
                            /**
                             * add the item to the entity_items
                             */
                            this.entity_items.addEntity(item)
                        }
                    }
                }
                if (this.entity_options === null) {
                    this.entity_options = {
                        settings: false,
                        mode: this.datascales.mode || CT_DATASCALEMODES["disabled"]
                    }
                } else {
                    this.entity_options.mode = this.entity_options.mode || this.datascales.mode || CT_DATASCALEMODES["disabled"]
                }
            }
            return this.entity_items.isValid() || false
        }
        return false
    }

    /**
     * HASS settings
     *
     */
    set hass(hass) {
        /**
         * check if hass is present
         */
        if (hass === undefined) return

        /**
         * skip not initialized
         */
        if (this.timeOut) clearTimeout(this.timeOut)

        this._hass = hass

        /**
         * check locale changed
         */
        const _locale = this._hass.language || navigator.language || navigator.userLanguage || "en-GB"
        if (this.chart_locale !== _locale) {
            this.chart_locale = _locale
            window.localeNames = getLocaleText(_locale)
            window.Chart3.defaults.locale = _locale
            this._getThemeSettings()
            if (this.graphChart) {
                this.themeSettings.theme = this.theme
                this.updateGraph(true)
            }
        }

        /**
         * check the theme or if theme changed
         */
        this.selectedTheme = hass.selectedTheme || { theme: "system", dark: false }
        if (this.theme && this.theme.dark !== this.selectedTheme.dark) {
            // theme has changed
            this.theme = this.selectedTheme
            this._getThemeSettings()
            if (this.graphChart) {
                this.themeSettings.theme = this.theme
                this.updateGraph(true)
            }
        }
        this.theme = this.selectedTheme

        /**
         * get the list of all entities
         */
        const _entities = this.getEntities()
        if (!_entities) {
            console.error(this.chart_type, "No valid entities found, check your settings...")
            return
        }

        /**
         * An object list containing the states of all entities in Home Assistant.
         * The key is the entity_id, the value is the state object.
         */
        this.hassEntities = _entities.map((x) => hass.states[x.entity]).filter((notUndefined) => notUndefined !== undefined)

        /**
         * check if we have valid entities and skip if we can'nt find the
         * entities in the hass entities list.
         */
        if (!this.hassEntities || this.hassEntities.length === 0) {
            console.error(this.chart_type, "No valid entities found, check your settings...")
            return
        }

        /**
         * update only if we has a chart and update_interval is not set
         */
        if (this.skipRender && this.updating === false && this.update_interval === 0) {
            this.checkUpdate()
            return
        }
        this.ready = this.setEntity_itemsData(_entities)

        /**
         * wait for 1 before call updateGraph
         */
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
            /**
             * create the graph chart
             */
            this._getThemeSettings()
            this.themeSettings.theme = this.theme
            this._setChartConfig()
            doUpdate = false
        }
        if (!this.graphChart) return
        this.updating = true

        /**
         * get the histroy data and render the graph
         */
        this._getThemeSettings()
        this.themeSettings.theme = this.theme

        /**
         * get all current entitydata
         */
        if (this.entity_items.getSize) {
            this.graphChart.entityData = this.entity_items.getData()
            this.chart_update = doUpdate
            this._getHistory()
            this._renderCardTimestamp()
        }

        this.updating = false
        this.initial = false
    }

    /**
     * checks if we need a graph update
     */
    checkUpdate() {
        if (this.updating === true) return false
        this.hasChanged = false
        const _entityList = this.entity_items.getEntitieslist()
        if (this.hassEntities && this.hassEntities.length && this._hass) {
            this.hassEntities = _entityList
                .map((x) => this._hass.states[x.entity])
                .filter((notUndefined) => notUndefined !== undefined)
            this.hasChanged = this.entity_items.hasChanged(this.hassEntities)
            if (this.hasChanged) {
                /**
                 * refresh and update the graph
                 */
                this.updateGraph(true)
            }
        }
        return this.hasChanged
    }

    /**
     * Get all histroy data for all registrated entity ids
     * or get the entity data if no time slot (datascales.range) is defined.
     * Call an API on the Home Assistant server.
     */
    _getHistory() {
        if (this.dataInfo.loading == true) return
        /**
         * check if the card is visible
         */
        if (this.card && this.card.getClientRects().length == 0) return
        this.ready = this.entity_items.isValid()

        if (this.ready) {
            
            if (this.DEBUGMODE) {
                this.APISTART = performance.now()
                /**
                 * set the start time for the api call
                 */
                this.DEBUGDATA.PROFILER.GETHASSDATA = {
                    start: performance.now()
                }
                this.DEBUGDATA.PROFILER.GETBUCKETDATA = {
                    start: performance.now()
                }
                this.DEBUGDATA.PROFILER.GETSTATEDATA = {
                    start: performance.now()
                }
            }

            if (this.datascales.range > 0) {
                /**
                 * start date, time and end date
                 */
                this.dataInfo.time = new Date().getTime()
                this.dataInfo.starttime = new Date()

                if (this.datascales.range < 1.0) {
                    this.dataInfo.starttime.setMinutes(this.dataInfo.starttime.getMinutes() - this.datascales.range * 60)
                } else {
                    this.dataInfo.starttime.setHours(this.dataInfo.starttime.getHours() - this.datascales.range)
                }
                this.dataInfo.endtime = new Date()
                this.dataInfo.entities = this.entity_items.getEntityIdsAsString()
                this.dataInfo.entity_items = this.entity_items.items
                this.dataInfo.useAlias = this.entity_items.useAliasFields()
                this.dataInfo.ISO_startime = this.dataInfo.starttime.toISOString()
                this.dataInfo.ISO_endtime = this.dataInfo.endtime.toISOString()

                /**
                 * remove skip initial state when fetching not-cached data (slow)
                 * significant_changes_only to only return significant state changes.
                 * minimal_response to only return last_changed and state for
                 * states other than the first and last state (much faster).
                 * disable minimal_response this if alias (attribute) fields is used...
                 */
                this.dataInfo.options = "&skip_initial_state"
                this.dataInfo.options += `&significant_changes_only=${this.dataInfo.useAlias ? 1 : 0}`
                if (!this.dataInfo.useAlias) this.dataInfo.options += "&minimal_response"

                /**
                 * simple param check
                 */
                if (this.dataInfo.param == `${this.dataInfo.endtime}:${this.dataInfo.entities}`) {
                    console.warn("Data allready loaded...")
                    return
                }
                this.dataInfo.param = `${this.dataInfo.endtime}:${this.dataInfo.entities}`

                /**
                 * build the api url
                 */
                this.dataInfo.url = `history/period/${this.dataInfo.ISO_startime}?end_time=${this.dataInfo.ISO_endtime}&filter_entity_id=${this.dataInfo.entities}${this.dataInfo.options}`
                if (this.dataInfo.url !== this.dataInfo.prev_url) {
                    /**
                     * get the history data
                     */
                    this.dataInfo.loading = true
                    const prom = this._hass.callApi("GET", this.dataInfo.url).then(
                        (stateHistory) => this._buildGraphData(stateHistory, API_DATAMODE.history),
                        () => null
                    )
                    this.dataInfo.prev_url = this.dataInfo.url
                }
            } else {
                /**
                 * build the current for the sensor(s)
                 */
                this._buildGraphData(null, API_DATAMODE.statemode)
            }
        }
    }

    /**
     * render the state data layer
     * @param {*} data
     */
    renderStateData(data) {
        let _html = []
        /**
         * SHOW STATE LAYER
         */
        if (this.currentData && this.chart_showstate && data) {
            let _visible = "margin:0;line-height:1.2em"
            _html.push(`<div class="state-view-data ${this.chart_showstate}">`)
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
        /**
         * SHOW DETAIL DATA
         */
        if (this.currentData && this.detailData && data) {
            const _statdata = this.entity_items.getStatisticData()
            if (_statdata) {
                _html = []
                _html.push(`<hr color="${this.themeSettings.gridlineColor}" size="0.25"/>`)
                if (this.chart_showdetails.title) _html.push(`<h2>${this.chart_showdetails.title}</h2>`)
                _html.push('<div><table class="card-detail-table">')
                _html.push("<tr>")
                _html.push(`<th width="20%"><b>${this.chart_showdetails.title_sensor || "Statitics"}</b></th>`)

                if (this.chart_showdetails.title_min && this.chart_showdetails.title_mean != "")
                    _html.push(`<th align="right">${this.chart_showdetails.title_mean}</th>`)

                if (this.chart_showdetails.title_min && this.chart_showdetails.title_min != "")
                    _html.push(`<th align="right">${this.chart_showdetails.title_min}</th>`)

                if (this.chart_showdetails.title_min && this.chart_showdetails.title_max != "")
                    _html.push(`<th align="right">${this.chart_showdetails.title_max}</th>`)

                _html.push(`<th align="right">${this.chart_showdetails.title_current}</th>`)

                _html.push(`<th>${this.chart_showdetails.title_timestamp || "Timestamp"}</th>`)
                _html.push("</tr>")
                _statdata.forEach((item) => {
                    _html.push("<tr>")
                    _html.push(
                        '<td><span style="font-size:4em;color:' +
                            item.color +
                            ';vertical-align:top;padding-right:8px">&bull;</span>' +
                            item.name +
                            "</td>"
                    )
                    if (this.chart_showdetails.title_min && this.chart_showdetails.title_mean != "")
                        _html.push(
                            "<td align='right'>" + _formatNumber(this.chart_locale, item.mean || 0.0) + " " + item.unit + "</td>"
                        )
                    if (this.chart_showdetails.title_min && this.chart_showdetails.title_min != "")
                        _html.push(
                            "<td align='right'>" + _formatNumber(this.chart_locale, item.min || 0.0) + " " + item.unit + "</td>"
                        )
                    if (this.chart_showdetails.title_min && this.chart_showdetails.title_max != "")
                        _html.push(
                            "<td align='right'>" + _formatNumber(this.chart_locale, item.max || 0.0) + " " + item.unit + "</td>"
                        )
                    _html.push(
                        "<td align='right'>" + _formatNumber(this.chart_locale, item.current || 0.0) + " " + item.unit + "</td>"
                    )
                    _html.push("<td>" + localDatetime(item.timestamp, this.chart_locale) + "</span>")
                    _html.push("</tr>")
                })
                _html.push("</table></div><br/>")
                if (_html.length) this.detailData.innerHTML = _html.join("")
            }
        }
    }

    /**
     * render the card timestamp
     */
    _renderCardTimestamp() {
        if (this.card_timestamp && this.timestampLayer) {
            this.timestampLayer.innerHTML = localDatetime(new Date().toISOString())
        }
    }
    /**
     * for developers show the debugdata if enabled
     */
    _renderDebugInfo() {
        if (this.DEBUGMODE) {
            this.DEBUGDATA.CARD = this.card_title
            this.DEBUGDATA.API.updateIntervall = msToTime(this.update_interval)
            this.DEBUGDATA.API.elapsed_total = msToTime(performance.now() - this.APISTART)
            this.DEBUGDATA.API.datainfo = this.dataInfo
            this.DEBUGDATA.DATA_ENTITIES = this.entity_items.items
            this.DEBUGDATA.LOVELACE_CONFIG = this._config
            this.DEBUGDATA.LOCALEINFO = window.localeNames
            if (this.DEBUGDATA.PROFILER) {
                delete this.DEBUGDATA.PROFILER.GETHASSDATA.start
                delete this.DEBUGDATA.PROFILER.GETBUCKETDATA.start
                delete this.DEBUGDATA.PROFILER.GETSTATEDATA.start
                delete this.DEBUGDATA.PROFILER.CHART.start
            }
            console.info(
                `%cDEBUGDATA ${this.chart_type.toUpperCase()} ${appinfo.name} ${appinfo.version}:`,
                "color:white;background:#cc283a;padding:4px",
                this.DEBUGDATA
            )
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
        if (this.DEBUGMODE) {
            this.DEBUGDATA.API.datamode = mode == API_DATAMODE.history ? "History" : "Current"
            if (mode == API_DATAMODE.history) {
                /**
                 * calculate the api elapsed time
                 */
                this.DEBUGDATA.PROFILER.GETHASSDATA.elapsed = msToTime(
                    performance.now() - this.DEBUGDATA.PROFILER.GETHASSDATA.start
                )

                /**
                 * set the start for the PROFILER.GETBUCKETDATA
                 */

                this.DEBUGDATA.PROFILER.GETBUCKETDATA = {
                    start: performance.now()
                }
            }
        }

        /**
         * check historydata
         */
        if ((mode === API_DATAMODE.history && !stateHistories) || (stateHistories && !stateHistories.length)) {
            if (this.DEBUGMODE) {
                this.DEBUGDATA.API.ERROR = "No Historydata found!"
                this._renderDebugInfo()
            }
            this.dataInfo.loading = false
            return null
        }

        /**
         * checke all entity data values
         */
        if (!this.entity_items.isValid) {
            if (this.DEBUGMODE) {
                this.DEBUGDATA.API.ERROR = "No valid Entities found!"
                this.DEBUGDATA.API.DATA = stateHistories
                this._renderDebugInfo()
            }
            this.dataInfo.loading = false
            return null
        }

        if (mode == API_DATAMODE.history) {
            const dataprovider = new DataProvider({
                datainfo: this.dataInfo,
                datascales: this.datascales,
                debugmode: this.DEBUGMODE,
                debugdata: this.DEBUGDATA
            })
            /**
             * create the seriesdata
             */
            if (dataprovider.getSeriesdata(stateHistories, this.chart_type) == false) {
                if (this.DEBUGMODE) {
                    this.DEBUGDATA.API.DATA = stateHistories
                    this.DEBUGDATA.API.ERROR = "Transform Historydata failed!"
                    this._renderDebugInfo()
                }
                this.dataInfo.loading = false
                return null
            }
        }

        /**
         * get the chart data
         */
        const _chartData = new chartData({
            card_config: {
                title: this.card_title,
                chart: this._config.chart.toLowerCase(),
                chartOptions: this.chartconfig.options
            },
            entity_items: this.entity_items,
            entityOptions: this.entity_options,
            debugmode: this.DEBUGMODE,
            debugdata: this.DEBUGDATA
        })

        if (mode === API_DATAMODE.history) {
            this.graphData = _chartData.getHistoryGraphData()
            this.lastUpdate = new Date().toISOString()
        } else {
            this.graphData = _chartData.getCurrentGraphData()
            this.lastUpdate = new Date().toISOString()
        }

        if (this.graphData === null) {
            if (this.DEBUGMODE) {
                this.DEBUGDATA.API.ERROR = "No GraphData found!"
                this.DEBUGDATA.API.DATA = stateHistories
                this._renderDebugInfo()
            }
            this.dataInfo.loading = false
            return null
        } else {
            if (this.graphData && this.graphData.config) {
                this.themeSettings.secondaryAxis = this.graphData.config.secondaryAxis || false
            }
        }

        if (this.DEBUGMODE) {
            if (mode === API_DATAMODE.statemode) {
                this.DEBUGDATA.PROFILER.GETSTATEDATA.elapsed = msToTime(
                    performance.now() - this.DEBUGDATA.PROFILER.GETSTATEDATA.start
                )                
            }
            this.DEBUGDATA.PROFILER.CHART = {
                start: performance.now()
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
        if (this.DEBUGMODE) {
            this.DEBUGDATA.PROFILER.CHART.elapsed = msToTime(performance.now() - this.DEBUGDATA.PROFILER.CHART.start)
        }

        this._renderCardTimestamp()

        if (mode === API_DATAMODE.history) {
            if (this.chart_showstate) {
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
            }

            if (this.DEBUGMODE) {
                this.DEBUGDATA.PROFILER.GETBUCKETDATA.elapsed = msToTime(
                    performance.now() - this.DEBUGDATA.PROFILER.GETBUCKETDATA.start
                )
                this._renderDebugInfo()
            }
            this.dataInfo.loading = false
            return true
        }

        if (this.DEBUGMODE) {
            this._renderDebugInfo()
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
