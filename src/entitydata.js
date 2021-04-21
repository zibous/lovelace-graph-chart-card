/**
 * Entities Data Class
 */
class Entities {
    /**
     * constructor entities class
     * @param {object} entities
     */
    constructor(entities) {
        this.items = entities || {}
    }
    /**
     * add a entity to the collection
     * @param {objec} entity
     */
    addEntity(entity) {
        if (entity.dataid) {
            this.items[entity.dataid] = entity
        } else {
            this.items[entity.id] = entity
        }
    }
    _getDataFromInfluxDb() {}
    /**
     * set the data for the selected entity
     * @param {*} entity
     * @param {*} data
     */
    setData(entity, data) {
        this.items[entity] = data
    }
    /**
     * set data fields for the selected entity
     * @param {*} name
     * @param {*} field
     * @param {*} value
     */
    setDataField(name, field, value) {
        this.items[name][field] = value
    }
    /**
     * get the number of registrated entities
     * @returns number
     */
    getSize() {
        return this.getEntityIds().length
    }
    /**
     * simple check if entities are registrated
     * @returns boolean
     */
    isValid() {
        return this.getSize() != 0
    }
    /**
     * get the number of used attribute fields
     * @returns number
     */
    useAliasFields() {
        let count = 0
        this.getEntityIds().forEach((id) => {
            const _entity = this.items[id]
            count += this.items[id].attribute ? 1 : 0
        })
        return count != 0
    }
    /**
     * get the entity data value
     * @param {*} itemdata
     * @returns number
     */
    calcItemValue(itemdata) {
        let _v = +itemdata.value || 0.0
        _v = _v * itemdata.factor
        if (itemdata.target_value && isNumeric(itemdata.target_value)) {
            _v = (itemdata.value / itemdata.target_value) * 100.0
        }
        return _safeParseFloat(_v) || 0.0
    }
    /**
     * check if we get new data from Homeassistant
     * @param {*} hassEntities
     * @returns boolean
     */
    hasChanged(hassEntities) {
        let hasChanged = false
        if (hassEntities && hassEntities.length) {
            const _entityList = this.getEntitieslist()
            for (let entity of _entityList) {
                const h = hassEntities.find((x) => x.entity_id === entity.entity)
                entity.laststate = entity.state || 0.0
                entity.update = false
                if (h && entity.last_changed !== h.last_changed && entity.state !== h.state) {
                    entity.last_changed = h.last_changed
                    entity.state = this.calcItemValue({
                        value: entity.useAttribute ? getAttributeValue(h, entity.field) : h.state,
                        factor: entity.factor || 1.0,
                        target_value: entity.target_value
                    })
                    if (entity.target_value && isNumeric(entity.target_value)) {
                        entity.unit = "%"
                        entity.current = h.state
                    }
                    entity.update = true
                    hasChanged = true
                }
            }
        }
        return hasChanged
    }
    /**
     * get entity from the collection
     * @param {*} index
     * @returns object
     */
    getEntity(index) {
        if (Number.isInteger(index)) {
            return this.getEntitieslist()[index]
        }
        return this.items[index]
    }
    /**
     * get the list of entities names
     * @returns list
     */
    getNames() {
        return this.getAttribute("name")
    }
    /**
     * get the attributes list
     * @param {*} name
     * @returns list
     */
    getAttribute(name) {
        let d = this.items
        return Object.keys(d)
            .map(function (index) {
                return d[index][name]
            })
            .filter((notUndefined) => notUndefined !== undefined)
    }
    /**
     * get the opitions for the selected entity
     * @param {*} index
     * @param {*} name
     * @returns object
     */
    getOptions(index, name) {
        const d = this.getEntity(index)
        if (d && d.style && !name) return d.style
        if (d && d.style && d.style[name] !== undefined) return d.style[name]
        return {}
    }
    /**
     * get the data scales for the selected entity
     * @param {*} index
     * @returns object
     */
    getDataScales(index) {
        const d = this.getEntity(index)
        if (d) {
            return d.datascales
        }
        return { range: 24, unit: "day", format: "MMM d", factor: 1.0, ignoreZero: true, aggregate: "last" }
    }
    /**
     * get the style settings for the selected entity
     * @param {*} index
     * @returns object
     */
    getStyle(index) {
        return this.getEntity(index).style
    }
    /**
     * get the color settings
     * @returns object
     */
    getColors() {
        const d = this.items
        return Object.keys(d)
            .map(function (index) {
                if (
                    (d[index].style && d[index].style.color !== undefined) ||
                    (d[index].style && d[index].style.backgroundColor !== undefined)
                )
                    return d[index].style.color || d[index].style.backgroundColor
            })
            .filter((notUndefined) => notUndefined !== undefined)
    }
    /**
     * get the data for the selected entity
     * @param {*} name
     * @returns list
     */
    getData(name = null) {
        if (!name) {
            return this.getAttribute("state")
        }
        return this.items[name].state
    }
    /**
     * get chartdata for simple charts
     */
    getChartLabelAndData() {
        let labels = [],
            data = [],
            colors = []
        const _itmList = this.getEntitieslist()
        _itmList.forEach((item) => {
            if (item.ignoreZero ? item.state !== 0 : true) {
                labels.push(item.name)
                data.push(item.state)
                if (item.style) colors.push(item.style.color || item.style.backgroundColor)
            }
        })
        return { labels: labels, colors: colors, data: data }
    }
    /**
     * get all entity id's for the registrated entities
     * @returns list
     */
    getEntityIds() {
        return Object.keys(this.items)
    }
    /**
     * check if we have entities with
     * datasource ...
     */
    checkDataSouresItems() {
        return Object.keys(this.items).filter((item) => this.items[item].datasource != undefined)
    }
    /**
     * get entities id's as string
     * @returns string
     */
    getEntityIdsAsString() {
        const d = Object.keys(this.items)
            .filter((item) => this.items[item].datasource == undefined && this.items[item].stateOnly == false)
            .map((item) => this.items[item].id)
        return [...new Set(d)].join(",")
    }
    /**
     * get all entities
     * @returns list
     */
    getEntities() {
        return Object.entries(this.items)
    }
    /**
     * get entities as object list
     * @returns objects
     */
    getEntitieslist() {
        const d = this.items
        return Object.keys(d).map(function (field) {
            return d[field]
        })
    }
    /**
     * get all
     * @param {*} index
     * @returns labels
     */
    getItemLabels(index) {
        return this.getEntity(index).labels
    }
    /**
     * get all data for the selected entity
     * @param {*} index
     * @returns object
     */
    getItemData(index) {
        return this.getEntity(index).seriesdata.data
    }
    /**
     * get the seriedata for the selected entity
     * @param {*} name
     * @returns list
     */
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
    /**
     * get the statistics data for all entities
     * @returns list
     */
    getStatisticData() {
        let _data = []
        const _itmList = this.getEntitieslist()
        _itmList.forEach((item) => {
            let _result = {}
            if (item.seriesdata && item.seriesdata.data) {
                const _values = item.seriesdata.data.map((d) => d.y)
                if (_values.length) {
                    _result.max = arrStatistics.max(_values)
                    _result.min = arrStatistics.min(_values)
                    _result.sum = arrStatistics.sum(_values)
                    _result.mean = arrStatistics.mean(_values)
                    _result.last = _values[_values.length - 1]
                    _result.first = _values[0]
                }
            }
            _result.name = item.name
            _result.entity = item.entity
            _result.color = item.style.backgroundColor || item.style.color
            if (item.style.gradient && item.style.gradient.colors) {
                _result.color = _result.color || item.style.gradient.colors[0]
            }
            _result.current = item.state
            _result.unit = item.unit || ""
            _result.timestamp = item.last_changed
            _data.push(_result)
        })
        return _data
    }
    /**
     * get all seriesdata for all entities
     * @returns list
     */
    getSeriesData() {
        let _seriesData = []
        const _itmList = this.getEntityIds()
        for (const id of _itmList) {
            const _entity = this.items[id]
            if (_entity.seriesdata) _seriesData.push(_entity.seriesdata)
        }
        return _seriesData
    }
}
