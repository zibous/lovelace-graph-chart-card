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
            _result.current = item.state
            _result.unit = item.unit || ""
            _result.timestamp = item.last_changed
            _data.push(_result)
        })
        return _data
    }
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
