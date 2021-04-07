/**
 * lovelace-chart-card 2.0.1
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

  (c) 2021 Peter Siebler
  Released under the MIT license

/** -------------------------------------------------------------------*/
"use strict"

// Chart.js  and used plugins, production use min.js
import "/hacsfiles/chart-card/chart.js?module"

// ! importend to fix the collision with ha used chart.js 2.9
window.Chart3 = Chart

// gradient, see themesettings
const gradient = window["chartjs-gradient"]

// all about the application
const appinfo = {
    name: "✓ custom:chart-card ",
    app: "chart-card",
    version: "v2.0.2/v3.0.1",
    chartjs: Chart.version || "v3.0.1",
    assets: "/hacsfiles/chart-card/assets/",
    github: "https://github.com/zibous/lovelace-graph-chart-card"
}
// render the app-info for this custom card
console.info(
    `%c ${appinfo.name}          %c ▪︎▪︎▪︎▪︎ ${appinfo.version}  ▪︎▪︎▪︎▪︎`,
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
/**
 * set the default setting for the cart
 * @param {*} theme
 */
function setChartDefaults(theme) {
    if (window.Chart3 && window.Chart3.defaults) {
        if (window.Chart3.defaults.theme && theme.theme == window.Chart3.defaults.theme) return

        window.Chart3.defaults.theme = theme.theme
        window.Chart3.defaults.responsive = true
        window.Chart3.defaults.maintainAspectRatio = false
        window.Chart3.defaults.hoverOffset = 8
        if (!theme.useAnimations) window.Chart3.defaults.animation = 0

        window.Chart3.defaults.locale = theme.locale
        window.localeNames = getLocaleText(window.Chart3.defaults.locale)

        window.Chart3.defaults.font.family = theme.font
        window.Chart3.defaults.color = convertColor(theme.fontColor)

        window.Chart3.defaults.layout.padding.top = theme.padding.top || 0
        window.Chart3.defaults.layout.padding.bottom = theme.padding.bottom || 0
        window.Chart3.defaults.layout.padding.left = theme.padding.left || 0
        window.Chart3.defaults.layout.padding.right = theme.padding.right || 0

        window.Chart3.defaults.plugins.legend.labels.color = convertColor(theme.fontColor)
        window.Chart3.defaults.plugins.legend.position = "top"
        window.Chart3.defaults.plugins.legend.labels.usePointStyle = true
        window.Chart3.defaults.plugins.legend.labels.boxWidth = 8
        window.Chart3.defaults.plugins.legend.show = false

        window.Chart3.defaults.plugins.tooltip.backgroundColor = convertColor(theme.tooltipsBackground)
        window.Chart3.defaults.plugins.tooltip.titleColor = convertColor(theme.tooltipsFontColor)
        window.Chart3.defaults.plugins.tooltip.bodyColor = convertColor(theme.tooltipsFontColor)
        window.Chart3.defaults.plugins.tooltip.footerColor = convertColor(theme.tooltipsFontColor)
        window.Chart3.defaults.plugins.tooltip.enabled = true

        window.Chart3.defaults.elements.arc.borderWidth = 0
        window.Chart3.defaults.elements.line.fill = false
        window.Chart3.defaults.elements.line.tension = 0.225

        window.Chart3.defaults.elements.point.borderWidth = 0
        window.Chart3.defaults.elements.point.hoverRadius = 8
        window.Chart3.defaults.elements.point.hitRadius = 8

        window.Chart3.defaults.scale.grid.drawBorder = true
        window.Chart3.defaults.scale.grid.borderWidth = parseFloat((theme.gridLineWidth * 1.1).toFixed(3)) || 1.0

        window.Chart3.defaults.scale.grid.color = convertColor(theme.gridlineColor, 0.8)
        window.Chart3.defaults.scale.grid.lineWidth = theme.gridLineWidth
        window.Chart3.defaults.scale.grid.borderDash = theme.borderDash

        window.Chart3.defaults.scale.grid.lineWidth = (ctx) => (ctx.index === 0 ? 0 : theme.gridLineWidth || 1.0)
        window.Chart3.defaults.scale.grid.borderColor = convertColor(theme.zeroLineColor)

        window.Chart3.defaults.scale.alignToPixels = true
        window.Chart3.defaults.scales.radialLinear.ticks.backdropColor = "transparent"

        if (window.gradient) window.Chart3.register(window.gradient)
    }
}

/**
 * Entities Data Class
 */
class Entities {
    constructor(entities) {
        this.items = entities || {}
    }
    addEntity(entity) {
        this.items[entity.entity] = entity
    }
    setData(entity, data) {
        this.items[entity] = data
    }
    setDataField(name, field, value) {
        this.items[name][field] = value
    }
    getSize() {
        return this.getEntityIds().length
    }
    isValid() {
        return this.getSize() != 0
    }
    useAliasFields() {
        let count = 0
        this.getEntityIds().forEach((id) => {
            const _entity = this.items[id]
            count += this.items[id].attribute ? 1 : 0
        })
        return count != 0
    }
    hasChanged(hassEntities) {
        let hasChanged = false
        if (hassEntities && hassEntities.length) {
            const _entityList = this.getEntitieslist()
            for (let entity of _entityList) {
                const h = hassEntities.find((x) => x.entity_id === entity.entity)
                entity.laststate = entity.state
                entity.update = false
                if (h && entity.last_changed !== h.last_changed && entity.state !== h.state) {
                    entity.last_changed = h.last_changed
                    entity.state = h.state
                    entity.update = true
                    hasChanged = true
                }
            }
        }
        return hasChanged
    }
    getEntity(index) {
        if (Number.isInteger(index)) {
            return this.getEntitieslist()[index]
        }
        return this.items[index]
    }
    getNames() {
        return this.getAttribute("name")
    }
    getAttribute(name) {
        let d = this.items
        return Object.keys(d)
            .map(function (index) {
                return d[index][name]
            })
            .filter((notUndefined) => notUndefined !== undefined)
    }
    getOptions(index, name) {
        const d = this.getEntity(index)
        if (d && d.style && !name) return d.style
        if (d && d.style && d.style[name] !== undefined) return d.style[name]
        return {}
    }
    getDataScales(index) {
        const d = this.getEntity(index)
        if (d) {
            return d.datascales
        }
        return { range: 24, unit: "day", format: "MMM d", factor: 1.0, ignoreZero: true, aggregate: "last" }
    }
    getStyle(index) {
        return this.getEntity(index).style
    }
    getColors() {
        const d = this.items
        return Object.keys(d)
            .map(function (index) {
                if (
                    (d[index].style && d[index].style.color) !== undefined ||
                    (d[index].style && d[index].style.backgroundColor) !== undefined
                )
                    return d[index].style.color || d[index].style.backgroundColor
            })
            .filter((notUndefined) => notUndefined !== undefined)
    }
    getData(name = null) {
        if (!name) {
            return this.getAttribute("state")
        }
        return this.items[name].state
    }
    getEntityIds() {
        return Object.keys(this.items)
    }
    getEntityIdsAsString() {
        const d = Object.keys(this.items).map((x) => this.items[x].entity)
        return [...new Set(d)].join(",")
        // return Object.keys(this.items).join(",")
    }
    getEntities() {
        return Object.entries(this.items)
    }
    getEntitieslist() {
        const d = this.items
        return Object.keys(d).map(function (field) {
            return d[field]
        })
    }
    getItemLabels(index) {
        this.getEntity(index).labels
    }
    getItemData(index) {
        this.getEntity(index).seriesdata.data
    }
    getDataset(name) {
        if (this.items[name].seriesdata && this.items[name].seriesdata.data) {
            const _seriesdata = this.items[name].seriesdata.data
            let labels = []
            let data = []
            _seriesdata.forEach((item) => {
                labels.push(item.localedate)
                data.push(item.y)
            })
            return { labels: labels, data: data }
        }
        return { labels: [], data: [] }
    }
    getSeriesData() {
        let _seriesData = []
        const _itmList = this.getEntityIds()
        for (const id of _itmList) {
            const _entity = this.items[id]
            if (_entity.seriesdata) _seriesData.push(_entity.seriesdata)
        }
        return _seriesData
        // this.getEntityIds().forEach((id) => {
        //     const _entity = this.items[id]
        //     if (_entity.seriesdata) {
        //         _seriesData.push(_entity.seriesdata)
        //     }
        // })
        // return _seriesData
    }
}

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
        this.DEBUGDATA.API.elapsed = 0
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
            showGridLines: ["bar", "line", "bubble", "scatter"].includes(this.chart_type.toLowerCase()) || false,
            secondaryAxis: false,
            gridLineWidth: 1.0,
            borderDash: [1, 1],
            padding: {
                top: 20,
                right: 12,
                bottom: 12,
                left: 12
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
            this.themeSettings.showGridLines = ["bar", "line", "bubble", "scatter"].includes(this.chart_type.toLowerCase()) || false
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
                card_config: this._config,
                entity_items: this.entity_items,
                chart_locale: this.chart_locale,
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
            this.timestampLayer.innerHTML = localDatetime(new Date().toISOString())
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
                if (!["left", "right", "center"].includes(this.chart_showstate.toLowerCase())) {
                    this.chart_showstate = false
                }
            }

            /**
             * detail settings and loader
             * default is spinning-circles, lovelace config can overwrite the default
             */
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

            /**
             * check chart type
             */
            const availableTypes = ["line", "radar", "bar", "horizontalBar", "pie", "doughnut", "polarArea", "bubble", "scatter"]
            if (!this.chart_type) {
                throw new Error("You need to define type of chart")
            } else if (!availableTypes.includes(this.chart_type)) {
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
             * all setting for history charts (timeseries charts)
             * line charts allway set as timeseries charts
             */
            this.datascales = Object.assign({}, this._config.datascales)
            this.datascales.useTimeSeries = this.datascales.unit != undefined ? true : false
            this.datascales.range = this.datascales.range || 0
            if (this.chart_type === "line" && this.datascales.range === 0) {
                this.datascales.range = 144
            }
            this.datascales.unit = this.datascales.unit || "day"
            this.datascales.format = this.datascales.format || "MM d"
            this.datascales.factor = this.datascales.factor || 1.0
            this.datascales.ignoreZero = this.datascales.ignoreZero || true
            this.datascales.aggregate = this.datascales.aggregate || "last"

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
            if (["bubble", "scatter"].includes(this.chart_type.toLocaleLowerCase())) {
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
                    this.entity_options = entity.options
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
                            item.datascales.ignoreZero = item.ignoreZero || this.datascales.ignoreZero
                            item.datascales.aggregate = item.aggregate || this.datascales.aggregate
                            item.datascales.factor = item.factor || this.datascales.factor
                            item.datascales.useTimeSeries = this.datascales.useTimeSeries
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
            if (this.card_timestamp) this.timestampLayer.innerHTML = localDatetime(new Date().toISOString())
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
        /**
         * check if the card is visible
         */
        if (this.card.getClientRects().length == 0) return
        this.APISTART = performance.now()
        this.DEBUGDATA.PROFILER.APICALL = {
            start: performance.now()
        }
        if (this.ready) {
            if (this.datascales.range > 0 && this.entity_items.getSize()) {
                /**
                 * start date, time and end date
                 */
                this.dataInfo.time = new Date().getTime()
                this.dataInfo.starttime = new Date()
                this.dataInfo.starttime.setHours(-this.datascales.range, 1, 0, 0)
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
                        (stateHistory) => this._buildGraphData(stateHistory, 1),
                        () => null
                    )
                    this.dataInfo.prev_url = this.dataInfo.url
                }
            } else {
                /**
                 * build the current for the sensor(s)
                 */
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
                    _html.push("<td align='right'>" + _formatNumber(this.chart_locale, item.min || 0.0) + " " + item.unit + "</td>")
                    _html.push("<td align='right'>" + _formatNumber(this.chart_locale, item.max || 0.0) + " " + item.unit + "</td>")
                    _html.push(
                        "<td align='right'>" + _formatNumber(this.chart_locale, item.current || 0.0) + " " + item.unit + "</td>"
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
     * for developers show the debugdata if enabled
     */
    _renderDebugInfo() {
        if (this.DEBUGMODE) {
            this.DEBUGDATA.CARD = this.card_title
            this.DEBUGDATA.API.updateIntervall = msToTime(this.update_interval)
            this.DEBUGDATA.API.elapsed = msToTime(performance.now() - this.APISTART)
            this.DEBUGDATA.API.datainfo = this.dataInfo
            this.DEBUGDATA.DATA_ENTITIES = this.entity_items.items
            this.DEBUGDATA.LOVELACE_CONFIG = this._config
            this.DEBUGDATA.LOCALEINFO = window.localeNames
            delete this.DEBUGDATA.PROFILER.APICALL.start
            delete this.DEBUGDATA.PROFILER.GETBUCKETDATA.start
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
            this.DEBUGDATA.API.datamode = mode == 1 ? "History" : "Current"
            this.DEBUGDATA.PROFILER.APICALL.elapsed = msToTime(performance.now() - this.DEBUGDATA.PROFILER.APICALL.start)
            this.DEBUGDATA.PROFILER.GETBUCKETDATA = {
                start: performance.now()
            }
        }
        /**
         * check historydata
         */
        if ((mode === 1 && !stateHistories) || (stateHistories && !stateHistories.length)) {
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

        if (mode == 1) {
            const dataprovider = new DataProvider({
                datainfo: this.dataInfo,
                datascales: this.datascales,
                debugmode: this.DEBUGMODE,
                debugdata: this.DEBUGDATA
            })
            /**
             * create the seriesdata
             */
            if (dataprovider.getSeriesdata(stateHistories) == false) {
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
            chart_type: this.chart_type,
            card_config: this._config,
            entityOptions: this.entity_options,
            entity_items: this.entity_items,
            //settings: this._config,
            debugmode: this.DEBUGMODE,
            debugdata: this.DEBUGDATA
        })
        if (mode === 1) {
            this.graphData = _chartData.getHistoryGraphData()
        } else {
            this.graphData = _chartData.getCurrentGraphData()
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
            this.DEBUGDATA.PROFILER.GETBUCKETDATA.elapsed = msToTime(
                performance.now() - this.DEBUGDATA.PROFILER.GETBUCKETDATA.start
            )
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

/** ----------------------------------------------------------
 
	Lovelaces chartjs - tools
  	(c) 2020,2021 Peter Siebler
  	Released under the MIT license
 
 * ----------------------------------------------------------*/

/**
 * convert color to alpha channel
 * @param {*} colorstr
 * @returns
 */
function convertColor(colorstr, alpha = 1.0) {
    if (window.Chart3 && window.Chart3.helpers && window.Chart3.helpers.color) {
        return window.Chart3.helpers.color(colorstr).alpha(alpha).rgbString() || colorstr
    }
    return colorstr
}

/**
 * show info
 * @param {*} args
 */
function logInfo(enabled, ...args) {
    if (enabled) {
        console.info(`%cLOGINFO ${new Date().toISOString()}:`, "color:white;background:#0275d8;padding:4px", ...args)
    }
}
/**
 * css helper
 * @param {string} v
 * @returns
 */
const cssAttr = function (v) {
    return typeof v == "number" ? v + "px" : v
}

// all number helpers
const _parseNumber = (n) => (n === parseInt(n) ? Number(parseInt(n)) : Number(parseFloat(n).toFixed(3)))
const roundToBase = (x = 0.0, base = 3) => Math.pow(base, Math.floor(Math.log(x) / Math.log(base)))
const _formatNumber = (locale, num) => new Intl.NumberFormat(locale).format(_parseNumber(num))
const _safeParseFloat = function (value) {
    value = parseFloat(value)
    return isFinite(value) ? +value.toFixed(3) : 0.0
}

/**
 * convert time to readable string
 * @param {*} duration
 * @returns
 */
function msToTime(duration) {
    var milliseconds = parseInt(duration % 1000),
        seconds = parseInt((duration / 1000) % 60),
        minutes = parseInt((duration / (1000 * 60)) % 60),
        hours = parseInt((duration / (1000 * 60 * 60)) % 24)
    hours = hours < 10 ? "0" + hours : hours
    minutes = minutes < 10 ? "0" + minutes : minutes
    seconds = seconds < 10 ? "0" + seconds : seconds

    return hours + ":" + minutes + ":" + seconds + "." + milliseconds
}

/**
 * fix date string for safari
 * @param {*} strDate
 * @returns
 */
function strToDate(strDate) {
    if (!strDate) return null
    const date = new Date(strDate.replace(/-|\ |\./gi, "/"))
    if (isNaN(date)) {
        console.error("Not a valid date string", strDate)
        return null
    }
    return date
}

/**
 *
 * @param {*} d
 * @param {*} locale
 * @returns
 */
function localDatetime(d, locale = "at-DE") {
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
 * check the date
 * @param {*} date
 * @returns
 */
function checkDate(date) {
    date = date || new Date()
    if (!isNaN(date) && typeof date !== "object") {
        date = new Date(date * 1000)
    } else if (typeof date === "string") {
        date = new Date(date)
    }
    return date
}

/**
 * set the local text for the day- and monthnames
 */
function getLocaleText(locale = "DE") {
    return {
        days_narrow: [...Array(7).keys()].map((day) =>
            new Intl.DateTimeFormat(locale, { weekday: "narrow" }).format(new Date(Date.UTC(2021, 5, day)))
        ),
        days_short: [...Array(7).keys()].map((day) =>
            new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(Date.UTC(2021, 5, day)))
        ),
        days_long: [...Array(7).keys()].map((day) =>
            new Intl.DateTimeFormat(locale, { weekday: "long" }).format(new Date(Date.UTC(2021, 5, day)))
        ),
        month_narrow: [...Array(12).keys()].map((month) =>
            new Intl.DateTimeFormat(locale, { month: "narrow" }).format(new Date(Date.UTC(2021, month, 1)))
        ),
        month_short: [...Array(12).keys()].map((month) =>
            new Intl.DateTimeFormat(locale, { month: "short" }).format(new Date(Date.UTC(2021, month, 1)))
        ),
        month_long: [...Array(12).keys()].map((month) =>
            new Intl.DateTimeFormat(locale, { month: "long" }).format(new Date(Date.UTC(2021, month, 1)))
        )
    }
}

/**
 * Get week number in the year.
 * @param  {Integer} [weekStart=0]  First day of the week. 0-based. 0 for Sunday, 6 for Saturday.
 * @return {Integer}                0-based number of week.
 */
Date.prototype.getWeek = function (weekStart = 1) {
    var januaryFirst = new Date(this.getFullYear(), 0, 1)
    weekStart = weekStart || 0
    return Math.floor(((this - januaryFirst) / 86400000 + januaryFirst.getDay() - weekStart) / 7)
}

/*
 * Date Format
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 * https://blog.stevenlevithan.com/archives/date-time-format
 */

var formatdate = (function () {
    const token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZWQw]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        timezoneClip = /[^-+\dA-Z]/g,
        pad = function (val, len) {
            val = String(val)
            len = len || 2
            while (val.length < len) val = "0" + val
            return val
        }
    return function (date, mask, utc) {
        const dF = formatdate
        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
            mask = date
            date = undefined
        }
        date = date ? new Date(date) : new Date()
        if (isNaN(date)) throw SyntaxError("invalid date")

        mask = String(dF.masks[mask] || mask || dF.masks["default"])
        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4)
            utc = true
        }

        if (mask == "") return date.getTime()

        const _ = utc ? "getUTC" : "get",
            d = date[_ + "Date"](),
            D = date[_ + "Day"](),
            m = date[_ + "Month"](),
            y = date[_ + "FullYear"](),
            H = date[_ + "Hours"](),
            M = date[_ + "Minutes"](),
            s = date[_ + "Seconds"](),
            L = date[_ + "Milliseconds"](),
            o = utc ? 0 : date.getTimezoneOffset(),
            flags = {
                // day
                d: d,
                dd: pad(d),
                ddd: window.localeNames.days_short[D],
                dddd: window.localeNames.days_long[D],
                // week
                W: date.getWeek(1),
                w: date.getWeek(0),
                // month
                m: m + 1,
                mm: pad(m + 1),
                mmm: window.localeNames.month_short[m],
                mmmm: window.localeNames.month_long[m],
                // year
                yy: String(y).slice(2),
                yyyy: y,
                Q: "Q" + Math.floor(((date.getMonth() / 3) % 4) + 1),
                // time hour
                h: H % 12 || 12,
                hh: pad(H % 12 || 12),
                H: H,
                HH: pad(H),
                // time minute
                M: M,
                MM: pad(M),
                // time seconds
                s: s,
                ss: pad(s),
                // time Milliseconds
                l: pad(L, 3),
                L: pad(L > 99 ? Math.round(L / 10) : L),
                // time am / pm
                t: H < 12 ? "a" : "p",
                tt: H < 12 ? "am" : "pm",
                T: H < 12 ? "A" : "P",
                TT: H < 12 ? "AM" : "PM",
                // GMT/UTC timezone
                Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + (Math.abs(o) % 60), 4)
            }

        return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1)
        })
    }
})()

/**
 * Some common format strings
 */
formatdate.masks = {
    default: "ddd, d mmmm yyyy HH:MM:ss.l",
    shortDate: "m.d.yy",
    mediumDate: "d.m.yyyy",
    longDate: "d mmmm yyyy",
    fullDate: "dddd, d mmmm yyyy",
    shortTime: "H:MM",
    mediumTime: "HH:MM:ss",
    longTime: "HH:MM:ss.L",
    isoDate: "yyyy-mm-dd",
    isoTime: "HH:MM:ss",
    isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'",
    week: "W",
    quater: "Q",
    datetime: "ddd, d mmmm yyyy HH:MM:ss",
    millisecond: "HH:MM:ss l",
    second: "HH:mm:ss l",
    minute: "HH:mm l",
    hour: "HH:mm",
    day: "ddd, d.mmm",
    month: "mmm yyyy",
    year: "yyyy"
}

/**
 * statistics get result value from array
 * based on the aggreation mode
 */
const arrStatistics = {
    max: function (array) {
        return Math.max.apply(null, array)
    },
    min: function (array) {
        return Math.min.apply(null, array)
    },
    range: function (array) {
        return arr.max(array) - arr.min(array)
    },
    midrange: function (array) {
        return arr.range(array) / 2
    },
    mean: function (array) {
        return _safeParseFloat(arrStatistics.sum(array) / array.length)
    },
    sum: function (array) {
        var num = 0
        for (var i = 0, l = array.length; i < l; i++) num += array[i]
        return _safeParseFloat(num)
    },
    last: function (array) {
        return array[array.length - 1]
    },
    first: function (array) {
        return array[0]
    }
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
/**
 * resultlist.sort(compareValues('state'));
 *
 * @param {*} key
 * @param {*} order
 */
function compareValues(key, order = "asc") {
    return function innerSort(a, b) {
        if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
            // property doesn't exist on either object
            return 0
        }
        const varA = typeof a[key] === "string" ? a[key].toUpperCase() : a[key]
        const varB = typeof b[key] === "string" ? b[key].toUpperCase() : b[key]
        let comparison = 0
        if (varA > varB) {
            comparison = 1
        } else if (varA < varB) {
            comparison = -1
        }
        return order === "desc" ? comparison * -1 : comparison
    }
}

/**
 * capitalize string
 * @param {*} s
 */
const capitalize = (s) => {
    if (typeof s !== "string") return ""
    return s.charAt(0).toUpperCase() + s.slice(1)
}

/**
 * filter entities from this._hass.states
 * @call: filter(this._hass.states,this.config_filter)
 *
 *  filter:
 *     - sensor.orangenbaum*
 *     - sensor.energie*
 *
 * @param {*} list
 * @param {*} filters
 */
function filter(list, filters) {
    /**
     * filter object
     * @param {*} stateObj
     * @param {*} pattern
     */
    function _filterName(stateObj, pattern) {
        let parts
        let attribute
        //console.log("STATEOBJECT:",stateObj,pattern)
        if (typeof pattern === "object") {
            parts = pattern["key"].split(".")
            attribute = pattern["key"]
        } else {
            parts = pattern.split(".")
            attribute = pattern
        }
        const regEx = new RegExp(`^${attribute.replace(/\*/g, ".*")}$`, "i")
        return stateObj.search(regEx) === 0
    }
    let entities = []

    filters.forEach((item) => {
        const _filters = []
        _filters.push((stateObj) => _filterName(stateObj, item.entity_filter))
        if (_filters && _filters.length) {
            Object.keys(list)
                .sort()
                .forEach((key) => {
                    Object.keys(list[key]).sort()
                    if (_filters.every((filterFunc) => filterFunc(`${key}`))) {
                        let newItem
                        if (item.attribute) {
                            // check if we can use the attribute for this entity
                            if (list[key].attributes[item.attribute]) {
                                let _name = list[key].attributes.friendly_name ? list[key].attributes.friendly_name : key
                                _name += item.name ? " " + item.name : " " + capitalize(item.attribute)
                                newItem = {
                                    entity: key,
                                    name: _name,
                                    unit: item.unit || "",
                                    state: list[key].attributes[item.attribute.toLowerCase()],
                                    attributes: list[key].attributes,
                                    last_changed: list[key].last_changed,
                                    field: item.attribute.toLowerCase()
                                }
                                newItem.attributes.friendly_name = newItem.name
                            }
                        } else {
                            // simple entity...
                            newItem = {
                                entity: key,
                                name: list[key].attributes.friendly_name ? list[key].attributes.friendly_name : key,
                                state: list[key].state,
                                attributes: list[key].attributes,
                                last_changed: list[key].last_changed
                            }
                        }
                        if (newItem) {
                            if (item.options) {
                                newItem.options = item.options
                            }
                            if (newItem.state && (item.state_min_value || item.state_max_value)) {
                                const _min = item.state_min_value || Number.MIN_VALUE
                                const _max = item.state_max || Number.MAX_VALUE
                                newItem.state = parseFloat(newItem.state)
                                if ((newItem.state - _min) * (newItem.state - _max) <= 0) {
                                    entities.push(newItem)
                                }
                            } else {
                                entities.push(newItem)
                            }
                        }
                    }
                })
        }
    })
    return entities
}

/** ----------------------------------------------------------
 
	Lovelaces chartjs
  	(c) 2021 Peter Siebler
  	Released under the MIT license
 
 * ----------------------------------------------------------*/

const SERIESDEFAULT_VALUE = 0.0 // default value if missing data
const TRANSFORM_MODE = {
    statebased: 1, // entity.state based on aggregation
    datalabel: 2, // data.array label.array
    seriesdata: 3 // data.x and data.y
}

/**
 * Lovelaces chartjs
 * Dataprovider for chart.js
 *
 */
class DataProvider {
    /**
     * constructor data provider
     * @param {*} settings
     */
    constructor(settings) {
        this.dataInfo = settings.datainfo
        this.datascales = settings.datascales
        this.DEBUGMODE = settings.debugmode
        this.DEBUGDATA = settings.debugdata
        this.locale = window.Chart3.defaults.locale | "DE"
        this.ready = this._checkParam()
        this.version = "1.0.1"
    }

    /**
     * check the settings and hass api call settings
     * @returns boolean
     */
    _checkParam() {
        if (this.datascales && this.dataInfo.entity_items && Object.keys(this.dataInfo.entity_items)) {
            // settings series data
            this.datascales.unit = this.datascales.unit || "day"
            this.datascales.range = this.datascales.range || 24
            this.datascales.aggregate = this.datascales.aggregate || "last"
            return true
        }
        return false
    }

    /**
     * build the seriesdata based on the grouped data
     * @param {*} id
     * @param {*} data
     * @returns number data series
     */
    _createTimeSeriesData(_entity, data) {
        _entity.seriesdata = _entity.seriesdata || []
        _entity.seriesdata.data = _entity.seriesdata.data || []
        _entity.seriesdata.data = Object.entries(data).map(function (row) {
            const _values = row[1].data
            if (_values && _values.length) {
                let _itemdata = {
                    x: new Date(row[0]).getTime(),
                    localedate: row[1].localedate,
                    y: arrStatistics[_entity.datascales.aggregate](_values)
                }
                if (_entity.datascales.useStatistics) {
                    _itemdata.statistics = {
                        current: _entity.state,
                        first: _values[0],
                        last: _values[_values.length - 1],
                        max: arrStatistics.max(_values),
                        min: arrStatistics.min(_values),
                        sum: arrStatistics.sum(_values),
                        avg: arrStatistics.mean(_values)
                    }
                }
                return _itemdata
            }
        })
        _entity.service.data_count = _entity.seriesdata.data.length
        return _entity.service.data_count
    }

    /**
     * get seriesdata
     * @param {array} deviceStates from hass API call
     * @returns boolean
     */
    getSeriesdata(deviceStates) {
        function validItem(item, ignoreZero = false) {
            return ignoreZero
                ? item != 0 && item != "unavailable" && item != "undefined"
                : item != "unavailable" && item != "undefined"
        }
        /**
         * dateformat
         * @param {*} datevalue
         * @param {*} mode
         * @param {*} format
         * @returns
         */
        function formatDateLabel(datevalue, mode = "label", format = "day") {
            const groupFormats = {
                millisecond: "yyyy/m/d H:MM:ss",
                datetime: "yyyy/m/d H:MM:ss",
                secund: "yyyy/m/d H:MM:ss",
                minute: "yyyy/m/d H:MM:00",
                hour: "yyyy/m/d H:00",
                day: "yyyy/m/d",
                month: "yyyy/m/1",
                year: "yyyy/1/1"
            }
            if (mode == "group") return formatdate(datevalue, groupFormats[format] || "day")
            return formatdate(datevalue, format)
        }
        /**
         * interate throw all devicestates and build
         * the result based on the settings (date format, aggregation)
         */
        if (deviceStates && deviceStates.length) {
            deviceStates.forEach((states) => {
                const _entityId = states[0].entity_id
                const _entity = this.dataInfo.entity_items[_entityId]                
                if (_entityId) {                    
                    const _fld = _entity.attribute
                    const _factor = _entity.factor || 1.0
                    /**
                     * all servicedata information
                     */
                    _entity.service = {}
                    _entity.service.dataprovider = this.version
                    _entity.service.data_mode = TRANSFORM_MODE.seriesdata
                    _entity.service.hass_start = this.dataInfo.starttime
                    _entity.service.hass_end = this.dataInfo.endtime
                    _entity.service.hass_url = this.dataInfo.url
                    _entity.service.data_range = this.datascales.range
                    _entity.service.data_group = _entity.datascales.unit
                    _entity.service.data_aggregate = _entity.datascales.aggregate
                    _entity.service.data_count = 0
                    if (!_entity.hasOwnProperty("ignoreZero")) _entity.ignoreZero = false
                    /**
                     * first build the group and returns the series data
                     */
                    let _data = []
                    states = _fld
                        ? states.filter((item) => validItem(item.attributes[_fld], _entity.ignoreZero))
                        : states.filter((item) => validItem(item.state, _entity.ignoreZero))
                    states.forEach(function (row) {
                        const _index = formatDateLabel(row.last_changed, "group", _entity.datascales.unit)
                        let _val = SERIESDEFAULT_VALUE
                        _val =
                            _fld && row.attributes && _fld in row.attributes
                                ? _safeParseFloat(row.attributes[_fld])
                                : _safeParseFloat(row.state)
                        _val = _val * _factor
                        _data[_index] = _data[_index] || []
                        _data[_index]["data"] = _data[_index]["data"] || []
                        _data[_index]["localedate"] = formatDateLabel(row.last_changed, "label", _entity.datascales.unit)
                        _data[_index]["data"].push(_safeParseFloat(_val))
                    })
                    /**
                     * build the series data based on the grouped data series
                     */
                    _entity.service.data_count = this._createTimeSeriesData(_entity, _data)
                }
            })
            return true
        }
    }
}

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
        this.entity_options = config.entityOptions
        this.entity_items = config.entity_items
        // this.settings = config.settings
        this.DEBUGMODE = config.debugmode
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
        this.version = "1.0.1"
    }

    /**
     * the default graph data
     */
    getDefaultGraphData() {
        return {
            data: {
                datasets: []
            },
            config: {
                mode: "init",
                secondaryAxis: false,
                series: 0,
                gradient: false,
                options: {},
                statistics: {},
                segmentbar: false,
                timescale: false
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
        if (!this.entity_items.isValid) return null
        let _graphData = null

        let numEntyties = this.entity_items.getSize()
        let _entities = this.entity_items.getEntitieslist()

        if (numEntyties % 2 === 0) {
            _graphData = this.getDefaultGraphData()
            _graphData.config.mode = "simple"
            for (let i = 0; i < numEntyties; i += 2) {
                /**
                 * first entity holds the attributes
                 */
                const _attr = this.entity_items.getOptions(i)
                let _options = {
                    label: _entities[i].name || "",
                    unit: _entities[i].unit || "",
                    hoverRadius: 20,
                    radius: 15,
                    pointRadius: 15,
                    hitRadius: 20,
                    backgroundColor: _attr.backgroundColor || DEFAULT_COLORS[20 + i * 5],
                    borderColor: _attr.borderColor || DEFAULT_COLORS[20 + i * 5]
                }
                if (this.entity_options) {
                    _options = { ...this.entity_options, ..._options }
                    _graphData.config.options = this.entity_options
                }
                if (this.entity_options && this.entity_options.gradient !== undefined) {
                    _graphData.config.gradient = true
                }
                _options.data = [
                    {
                        x: _entities[i].state || 0.0,
                        y: _entities[i + 1].state || 0.0
                    }
                ]
                if (_attr) _options = { ..._options, ..._attr }
                _graphData.data.datasets.push(_options)
            }
            _graphData.config.options.scatter = true
        } else {
            console.error("ScatterChart setting not valid ", _entities)
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
        if (!this.entity_items.isValid) return null
        let _graphData = null

        let numEntyties = this.entity_items.getSize()
        let _entities = this.entity_items.getEntitieslist()

        if (numEntyties % 3 === 0) {
            _graphData = this.getDefaultGraphData()
            _graphData.config.mode = "simple"
            for (let i = 0; i < _entities.length; i += 3) {
                const _attr = this.entity_items.getOptions(i + 1)
                let _options = {
                    label: _entities[i + 2].name || "",
                    scale: _attr.scale || 1.0,
                    unit: _entities[i + 2].unit || "",
                    backgroundColor: _attr.backgroundColor || DEFAULT_COLORS[24 + i * 5],
                    borderColor: _attr.borderColor || DEFAULT_COLORS[24 + i * 5]
                }
                if (this.entity_options) {
                    _options = { ...this.entity_options, ..._options }
                    _graphData.config.options = this.entity_options
                }
                if (this.entity_options && this.entity_options.gradient !== undefined) {
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
                if (_attr) _options = { ..._options, ..._attr }
                _graphData.data.datasets.push(_options)
            }
            _graphData.config.options.bubble = true
        } else {
            console.error("BubbleChart setting not valid", _entities)
        }
        return _graphData
    }

    /** ----------------------------------------------------------
     *
     * chart data builder state series data
     *
     * ----------------------------------------------------------*/

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
     * create chart data - entity state based
     * this is used for pie-, doughnut-, polarArea-,radar-, simple bar chart
     * because we do not need time series - only the current state values.
     */
    createChartData() {
        
        /**
         * entities      : all entities data and options
         * entityOptions : global entities options
         */
        if (!this.entity_items.isValid) return null

        let _data = this.entity_items.getData()

        if (_data.length === 0) {
            console.error("No Data present !")
            return null
        }

        let _defaultDatasetConfig = {
            mode: "current",
            unit: ""
        }

        let _graphData = this.getDefaultGraphData()
        _graphData.config.mode = "simple"

        /**
         * merge entity options
         */
        if (this.entity_options) {
            _defaultDatasetConfig = {
                ..._defaultDatasetConfig,
                ...this.entity_options
            }
        }

        /**
         * merge dataset_config
         */
        _graphData.data.labels = this.entity_items.getNames()
        _graphData.data.datasets[0] = _defaultDatasetConfig
        _graphData.data.datasets[0].label = this.card_config.title || ""
        if (this.entity_options && this.entity_options.unit)
            _graphData.data.datasets[0].unit = this.entity_options.unit || ""

        /**
         * case horizontal bar
         */
        if (this.card_config.chart.toLowerCase() === "horizontalbar") {
            _graphData.data.datasets[0].indexAxis = "y"
        }

        /**
         * custom colors from the entities
         */
        let entityColors = this.entity_items.getColors()

        if (this.entity_options && this.entity_options.gradient != undefined) {
            _graphData.config.gradient = true
        }

        if (entityColors.length === _graphData.data.labels.length) {
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
                /**
                 * get backgroundcolor from DEFAULT_COLORS
                 */
                entityColors = DEFAULT_COLORS.slice(1, _data.length + 1)
                _graphData.data.datasets[0].backgroundColor = entityColors
                _graphData.data.datasets[0].borderWidth = 0
                _graphData.data.datasets[0].showLine = false
            }
        }
        _graphData.data.datasets[0].data = _data
        _graphData.config.segmentbar = false

        /**
         * add the data series and return the new graph data
         */
        if (this.chart_type === "bar" && this.card_config.options && this.card_config.options.segmented) {
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

    /** ----------------------------------------------------------
     *
     * chart data builder history series data
     *
     * ----------------------------------------------------------*/

    /**
     * get the history bubble chart data
     */
    createHistoryBubbleData() {
        if (!this.entity_items.isValid) return null

        let _seriesData = this.entity_items.getSeriesData()

        if (_seriesData && _seriesData.length % 3 === 0) {
            let _graphData = this.getDefaultGraphData()
            for (let r = 0; r < _seriesData.length; r += 3) {
                const _attr = this.entity_items.getOptions(r + 2) || {}
                let _data = []
                _seriesData[r].data.forEach(function (e, i) {
                    if (_seriesData[r + 1].data[i] && _seriesData[r + 2].data[i]) {
                        _data.push({
                            x: parseFloat(_seriesData[r + 0].data[i].y) || 0.0,
                            y: parseFloat(_seriesData[r + 1].data[i].y || 0.0),
                            r: parseFloat(_seriesData[r + 2].data[i].y || 0.0)
                        })
                    }
                })
                let _options = {
                    label: this.entity_items.getEntity(r + 2).name || "",
                    unit: this.entity_items.getEntity(r + 2).unit || "",
                    scale: this.entity_items.getEntity(r + 2).scale || 1,
                    backgroundColor: _attr.backgroundColor || DEFAULT_COLORS[17 + r * 5],
                    borderColor: _attr.borderColor || DEFAULT_COLORS[17 + r * 5]
                    // TODO: min, max, avg values
                }
                if (_attr && _attr.pointStyle) {
                    _options.pointStyle = _attr.pointStyle
                    _options.pointRadius = 6
                }
                if (_attr && _attr.pointRadius) {
                    _options.pointRadius = _attr.pointRadius
                }
                if (this.entity_options) {
                    _options = { ..._options, ...this.entity_options }
                    _graphData.config.options = this.entity_options
                }
                if (_attr) _options = { ..._options, ..._attr }
                _options.data = _data
                _graphData.data.datasets.push(_options)
            }
            if (_graphData.data.datasets.length) {
                _graphData.config.options.bubble = true
                return _graphData
            }
        }
        console.error("BubbleChart setting not valid for ", this.entity_items.getNames())
        return null
    }

    /**
     * get the history scatter chart data
     */
    createHistoryScatterData() {
        if (!this.entity_items.isValid) return null

        let _seriesData = this.entity_items.getSeriesData()

        if (_seriesData && _seriesData.length % 2 === 0) {
            let _graphData = this.getDefaultGraphData()
            _graphData.config.mode = "history"

            for (let r = 0; r < _seriesData.length; r += 2) {
                const _attr = this.entity_items.getOptions(r) || {}
                let _data = []
                _seriesData[r].data.forEach(function (e, i) {
                    if (_seriesData[r].data[i] && _seriesData[r + 1].data[i]) {
                        _data.push({
                            x: parseFloat(_seriesData[r + 0].data[i].y) || 0.0,
                            y: parseFloat(_seriesData[r + 1].data[i].y || 0.0)
                        })
                    }
                })
                /**
                 * default options
                 */
                let _options = {
                    label: this.entity_items.getEntity(r).name || "",
                    unit: this.entity_items.getEntity(r).unit || "",
                    hoverRadius: 18,
                    pointRadius: 16,
                    hitRadius: 22,
                    backgroundColor: _attr.backgroundColor || DEFAULT_COLORS[27 + r * 5],
                    borderColor: _attr.borderColor || DEFAULT_COLORS[27 + r * 5]
                    // TODO: min, max, avg values ???
                }
                if (this.entity_options) {
                    _options = { ..._options, ...this.entity_options }
                    _graphData.config.options = this.entity_options
                }
                if (_attr) _options = { ..._options, ..._attr }

                _options.data = _data
                _graphData.data.datasets.push(_options)
            }
            if (_graphData.data.datasets.length) {
                _graphData.config.options.bubble = true
                return _graphData
            }
        }
        console.error("ScatterChart setting not valid for ", this.entity_items.getNames())
        return null
    }

    /**
     * ----------------------------------------------------------------------
     * create chart data - history state based
     * ----------------------------------------------------------------------
     * Get the series data for all entities from the
     * history and create the chart history data
     */
    createHistoryChartData() {
        let _graphData = this.getDefaultGraphData()

        _graphData.config.options.fill = false
        _graphData.config.mode = "history"

        const entities = this.entity_items.getEntityIds()
        entities.forEach((id) => {
            /**
             * current selected entity
             */
            const _entity = this.entity_items.items[id]
            let _entityOptions = { ...this.entity_items.getOptions(_entity.entity) }

            /**
             * default Dataset Properties
             */
            let _options = {
                label: _entity.name || "unkonwn",
                unit: _entity.unit || "",
                minval: 0.0,
                maxval: 0.0,
                sumval: 0.0,
                avgval: 0.0,
                pointRadius: 0,
                current: _entity.state || 0.0,
                last_changed: _entity.last_changed || new Date(),
                mode: "history"
            }

            if (this.card_config.chart.toLowerCase() === "horizontalbar") {
                _options.indexAxis = "y"
            }

            if (this.card_config.chart.toLowerCase() === "radar") {
                _options.pointRadius = 12
                _options.hoverRadius = 18
                _options.hitRadius = 22
            }

            if (this.entity_options) {
                _options = { ..._options, ...this.entity_options }
                _graphData.config.options = { ..._graphData.config.options, ...this.entity_options }
            }

            /**
             * add all options from style settings
             */
            _options = { ..._options, ..._entityOptions }
            _graphData.config.options.fill =
                _entityOptions.fill || ["bar", "horizontalbar"].includes(this.card_config.chart.toLowerCase())

            if (_entityOptions.fill && _entityOptions.gradient && _entityOptions.gradient.colors) {
                const _axis = _options.indexAxis === "y" ? "x" : "y"
                _options.gradient = {
                    backgroundColor: {
                        axis: _axis,
                        colors: _entityOptions.gradient.colors
                    }
                }
                _options.labelcolor = _entityOptions.gradient.colors[0]
                _options.borderColor = _entityOptions.gradient.colors[0] || DEFAULT_COLORS[_graphData.config.series]
                _graphData.config.gradient = true
            } else {
                if (_entityOptions.backgroundColor === undefined) {
                    _options.backgroundColor = DEFAULT_COLORS[_graphData.config.series]
                    _options.borderColor = DEFAULT_COLORS[_graphData.config.series]
                }
            }

            /**
             * check secondary axis
             */
            if (!_graphData.config.secondaryAxis) {
                _graphData.config.secondaryAxis =
                    _entityOptions.yAxisID != undefined || _entityOptions.xAxisID != undefined
            }

            /**
             * add the options, labels and data series
             */
            _graphData.config.timescale = _entity.datascales.useTimeSeries
            if (_entity.datascales.useTimeSeries && _entity.seriesdata && _entity.seriesdata.data) {
                _options.data = _entity.seriesdata.data
            } else {
                const _seriesdata = this.entity_items.getDataset(id)
                if(_seriesdata){
                    _graphData.data.labels = _seriesdata.labels
                    _options.data = _seriesdata.data
                }                
            }

            _graphData.data.datasets.push(_options)
            _graphData.config.series++
        })
        return _graphData
    }

    /**
     * build the graph cart data and datasets for the
     * defined graph chart. Uses the history data
     * for each entity
     */
    getHistoryGraphData() {
        try {
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
        } catch (err) {
            console.error("Build History GraphData", err.message, err)
        }
        return null
    }
}

/** ----------------------------------------------------------
 
	Lovelaces chartjs
  	(c) 2021 Peter Siebler
  	Released under the MIT license
 
 * ----------------------------------------------------------*/

/**
 * format the x-axis date/time label
 * @param {*} tickValue
 * @param {*} index
 * @param {*} ticks
 * @returns formatted tick value
 */
function xAxisFormat(tickValue, index, ticks) {
    if (this && this.options.time && this.options.time.unit) {
        const dateFormatPattern = this.options.time.unit
        if (dateFormatPattern && Number.isInteger(tickValue)) {
            return formatdate(+tickValue, dateFormatPattern)
        }
    }
    return tickValue
}

/**
 * format the y-axis date/time label
 * @param {*} tickValue
 * @param {*} index
 * @param {*} ticks
 * @returns formated tick value
 */
function yAxisFormat(tickValue, index, ticks) {
    return tickValue
}

/**
 * format the tooltip title
 * if attribute localedate is present, this is returned
 * as label otherwise the data.label will be used.
 * @param {*} context
 * @returns string
 */
function formatToolTipTitle(context) {
    const data = context[0].raw
    if (context[0].label && data && data.localedate) {
        return data.localedate || context[0].label
    }
    return context[0].label || ""
}

/**
 * format the tooltip label
 * @param {*} context
 * @returns string
 */
function formatToolTipLabel(context) {
    if (context.dataset.tooltip === false || !context.dataset.label) {
        return null
    }
    let label = context.dataset.label || ""
    const data = context.raw
    const unit = context.dataset.unit ? ` ${context.dataset.unit}` : ""
    label += ": " + context.formattedValue + unit
    // if (context.raw.statistics) {
    //   label = [label, "Statistics", context.raw.statistics]
    // }
    return label
}

/**
 * Lovelaces chartjs
 * graph chart wrapper class
 *
 */
class graphChart {
    /**
     * graph chart constructor
     * @param {*} config
     */
    constructor(config) {
        // settings
        this.ctx = config.ctx || null // the chart canvas element
        this.canvasId = config.canvasId // canvas container id
        this.card_config = config.card_config // current card settings
        this.entity_items = config.entity_items // all entities
        this.chart_locale = config.locale || "de-DE" // the locale for number(s) and date(s)
        this.chart_type = config.chart_type || "bar" // the chart type
        this.chartconfig = config.chartconfig || {} // the chart config from the template
        this.loader = config.loader // the loading animation
        this.DEBUGMODE = config.debugmode || 0 // internal debugging enabled
        this.DEBUGDATA = config.debugdata
        // all class based
        this.chart = null // current chart
        this.graphData = {} // the graph data
        this.graphDataSets = [] // current graph settings
        this.chart_ready = false // boolean chart allready exits
        this.lastUpdate = null // timestamp last chart update
        this.ChartControl = window.Chart3 || Chart // chart global settings
        this.version = "1.0.1"
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
            unit: "",
            hoverOffset: 8,
            layout: {},
            interaction: {
                mode: "nearest",
                intersect: false
            },
            chartArea: {
                backgroundColor: "transparent"
            },
            elements: {},
            spanGaps: true,
            plugins: {
                title: {},
                tooltip: {},
                legend: {
                    display: ["pie", "doughnut", "polararea", "line"].includes(this.chart_type.toLowerCase()) || false
                }
            },
            animation: {
                onComplete: function () {
                    if (_loader) _loader.style.display = "none"
                }
            },
            onResize: null
        }

        if (this.graphData.config.gradient === true && this.graphData.config.mode === "simple") {
            //enable gradient colors for state charts
            _options.gradientcolor = {
                color: true,
                type: this.chart_type
            }
        }
        if (gradient && this.graphData.config.gradient) {
            // enable gradient colors for data series chart
            _options.plugins = {
                gradient
            }
        }

        /**
         * check secondary axis
         * this.graphData.config holds the configruation data
         * this.graphData.data.datasets data per series
         */
        if (this.graphData.config.secondaryAxis && this.graphData && this.graphData.data && this.graphData.data.datasets) {
            let _scaleOptions = {}
            this.graphData.data.datasets.forEach((dataset) => {
                if (dataset.yAxisID) {
                    _scaleOptions[dataset.yAxisID] = {}
                    _scaleOptions[dataset.yAxisID].id = dataset.yAxisID
                    _scaleOptions[dataset.yAxisID].type = "linear"
                    _scaleOptions[dataset.yAxisID].position = dataset.yAxisID
                    _scaleOptions[dataset.yAxisID].display = true
                    if (dataset.yAxisID.toLowerCase() == "right") {
                        _scaleOptions[dataset.yAxisID].grid = {
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
                        _scaleOptions[dataset.xAxisID].grid = {
                            drawOnChartArea: false
                        }
                    }
                }
            })
            if (_scaleOptions) {
                _options.scales = _scaleOptions
            }
        }

        /**
         * bubble axis label based on the data settings
         */
        if (this.chart_type.toLowerCase() === "bubble") {
            const _itemlist = this.entity_items.getEntitieslist()
            let labelX = _itemlist[0].name
            labelX += _itemlist[0].unit ? " (" + _itemlist[0].unit + ")" : ""
            let labelY = _itemlist[1].name
            labelY += _itemlist[1].unit ? " (" + _itemlist[1].unit + ")" : ""
            _options.scales = {
                x: {
                    id: "x",
                    title: {
                        display: true,
                        text: labelX
                    }
                },
                y: {
                    id: "y",
                    title: {
                        display: true,
                        text: labelY
                    }
                }
            }
            // scale bubble (optional)
            if (this.graphData.config.bubbleScale) {
                _options.elements = {
                    point: {
                        radius: (context) => {
                            const value = context.dataset.data[context.dataIndex]
                            return value._r * this.graphData.config.bubbleScale
                        }
                    }
                }
            }
        }

        /**
         * special case for timescales to translate the date format
         */
        if (this.graphData.config.timescale && this.card_config.datascales) {
            _options.scales = _options.scales || {}
            _options.scales.x = _options.scales.x || {}
            _options.scales.x.type = "time"
            _options.scales.x.time = {
                unit: this.card_config.datascales.unit,
                displayFormats: {}
                //tooltipFormat: "EEEEEE, dd.MMM.yyyy H:ss" //this.card_config.datascales.format
            }
            _options.scales.x.ticks = {
                callback: xAxisFormat
            }
            _options.plugins.tooltip = {
                callbacks: {
                    label: formatToolTipLabel,
                    title: formatToolTipTitle
                }
            }
            // _options.scales.y = _options.scales.y || {}
            // _options.scales.y.ticks = {
            //     callback: yAxisFormat
            // }
            // _options.scales.x.time.displayFormats[_options.scales.x.time.unit] = this.card_config.datascales.format
        }else{
            /**
             * callbacks for tooltip
             */
            _options.plugins.tooltip = {
                callbacks: {
                    label: formatToolTipLabel
                }
            }
        }

        /**
         * case barchart segment
         * TODO: better use a plugin for this feature.
         * set bar as stacked, hide the legend for the segmentbar,
         * hide the tooltip item for the segmentbar.
         */
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
        }

        /**
         * disable bubble legend
         */
        if (this.chart_type.toLowerCase() === "bubble") {
            _options.plugins.legend = {
                display: false
            }
        }

        /**
         * preset cart current config
         */
        let chartCurrentConfig = {
            type: this.chart_type,
            data: {
                datasets: []
            },
            options: _options
        }

        /**
         * merge default with chart config options
         * this.chartconfig.options see yaml config
         * - chart
         *   - options:
         */
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
                console.info("sendJson", this.responseText)
            }
        }

        // Converting JSON data to string
        var data = JSON.stringify(chartdata)
        console.info(data)

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
                    datasets: this.graphData.data.datasets
                }
                if (this.graphData.data.labels) {
                    graphOptions.data.labels = this.graphData.data.labels
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
                        if (this.DEBUGMODE) {
                            this.DEBUGDATA.CHARD = {
                                chartOptions: graphOptions,
                                chartMode: "update data ready",
                                chartjs: window.Chart3.version,
                                chartGraphdata: this.graphData.config
                            }
                        }
                    } else {
                        // set the chart options
                        if (this.chart_ready === false && this.ChartControl.register) {
                            // create and draw the new chart with the current settings
                            // and the dataseries. Register all plugins
                            if (this.graphData.config.gradient) {
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
                                        if (chart.config.options.chartArea && chart.config.options.chartArea.backgroundColor) {
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
                        // console.log(this.chart_type, graphOptions)
                        // if (this.card_config.testcase) this.sendJSON(this.card_config.testcase, graphOptions)

                        if (this.chart) {
                            // be shure that no chart exits before create..
                            this.chart.destroy()
                            this.chart = null
                        }

                        if (this.DEBUGMODE) {
                            console.log(graphOptions)
                        }

                        this.chart = new window.Chart3(this.ctx, graphOptions)
                        this.graphDataSets = this.graphData.data.datasets

                        if (this.DEBUGMODE) {
                            this.DEBUGDATA.CHARD = {
                                chartOptions: graphOptions,
                                chartMode: "new data ready",
                                chartjs: window.Chart3.version,
                                chartmodul: "v " + this.version,
                                chartGraphdata: this.graphData.config
                            }
                        }

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
