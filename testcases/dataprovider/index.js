// ---------------------------
// Testcase dataprovider
// ---------------------------

class DataProvider {
    /**
     * constructor dataprovider
     * @param {*} config
     */
    constructor(config) {
        this.aggregate = config.aggregate || "last";
        this.groupby = config.groupby || "day";
        this.stateHistories = config.datasource;
        this.datasource = config.datasource[0] || [];
    }

    /**
     * checks if we have valid history data
     */
    _isValid() {
        return this.stateHistories && this.stateHistories.length > 0;
    }
    /**
     * format number
     * @param {*} n
     */
    _formatNumber(n) {
        return n === parseInt(n) ? Number(parseInt(n)) : Number(parseFloat(n).toFixed(2));
    }

    /**
     * format date based on the group by parameter
     * @param {*} str
     */
    _formatDate(str) {
        const t = new Date(str);
        const date = ("0" + t.getDate()).slice(-2);
        const month = ("0" + (t.getMonth() + 1)).slice(-2);
        const year = t.getFullYear();
        const hours = ("0" + t.getHours()).slice(-2);
        const minutes = ("0" + t.getMinutes()).slice(-2);
        const seconds = ("0" + t.getSeconds()).slice(-2);
        switch (this.groupby) {
            case "year":
                return year;
            case "month":
                return `${year}-${month}`;
            case "weekday":
                return date;
            case "day":
                return `${year}-${month}-${date}`;
            case "hour":
                return `${year}-${month}-${date} ${hours}:00:00`;
            default:
                return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
        }
    }

    /**
     * build the group data based on the group parameter
     *
     * @uses _formatDate
     */
    _buildGroupdata() {
        if (!this._isValid) return null;
        let groups = {};
        const me = this;
        const _fmd = (d) => {
            const t = new Date(d);
            const date = ("0" + t.getDate()).slice(-2);
            const month = ("0" + (t.getMonth() + 1)).slice(-2);
            const year = t.getFullYear();
            const hours = ("0" + t.getHours()).slice(-2);
            const minutes = ("0" + t.getMinutes()).slice(-2);
            const seconds = ("0" + t.getSeconds()).slice(-2);
            switch (this.groupby) {
                case "year":
                    return year;
                case "month":
                    return `${year}-${month}`;
                case "weekday":
                    return date;
                case "day":
                    return `${year}-${month}-${date}`;
                case "hour":
                    return `${year}-${month}-${date} ${hours}:00:00`;
                default:
                    return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
            }
        };
        //const _gf = new Intl.DateTimeFormat("de-AT", { dateStyle: "short", timeStyle: "short" });
        //const _gf = new Intl.DateTimeFormat("de-AT", { dateStyle: "short"});

        this.datasource.forEach(function (o) {
            //const group = _gf.format(new Date(o.last_changed)); // [Done] exited with code=0 in 0.261 seconds
            const group = _fmd(o.last_changed);                   // [[Done] exited with code=0 in 0.158 seconds
            groups[group] = groups[group] || [];
            o.last_changed = group;
            groups[group].push(o);
        });
        return groups;
    }

    /**
     * get series data for bubble or scatter chart
     */
    getSeriesData() {
        if (!this._isValid) return null;
        let _seriesData = [];
        for (const list of this.stateHistories) {
            if (list.length === 0) continue;
            if (!list[0].state) continue;
            const items = this.getdata(list);
            _seriesData.push(items);
        }
        return _seriesData;
    }

    /**
     * build the grouped data
     *
     * @uses _buildGroupdata
     * @uses _formatDate
     * @uses _formatNumber
     */
    getdata() {
        if (!this._isValid) return null;
        try {
            if (!this.datasource) return;
            if (this.datasource && !this.datasource.length) return;
            const _num = (n) => (n === parseInt(n) ? Number(parseInt(n)) : Number(parseFloat(n).toFixed(2)));
            const _aggr = this.aggregate;
            const groups = this._buildGroupdata();
            if (!groups) {
                console.error("No data found");
            }
            // build the results
            return Object.keys(groups).map(function (group) {
                let items = groups[group].filter(
                    (item) => item.state && !isNaN(parseFloat(item.state)) && isFinite(item.state)
                );
                if (items && items.length === 0) {
                    return {
                        y: 0.0,
                        x: ""
                    };
                }
                if (_aggr == "first") {
                    const item = items.shift();
                    return {
                        y: _num(item.state || 0.0),
                        x: item.last_changed
                    };
                }
                if (_aggr == "last") {
                    const item = items[items.length - 1];
                    return {
                        y: _num(item.state || 0.0),
                        x: item.last_changed
                    };
                }
                if (_aggr == "max") {
                    return items.reduce((a, b) =>
                        a.state > b.state
                            ? {
                                  y: _num(a.state || 0.0),
                                  x: a.last_changed
                              }
                            : { y: _num(b.state), x: b.last_changed }
                    );
                }
                if (_aggr == "min")
                    return items.reduce((a, b) =>
                        a.state < b.state
                            ? {
                                  y: _num(a.state || 0.0),
                                  x: a.last_changed
                              }
                            : {
                                  y: _num(b.state || 0.0),
                                  x: b.last_changed
                              }
                    );
                if (_aggr == "sum") {
                    const val = items.reduce((sum, entry) => sum + _num(entry.state), 0);
                    return {
                        y: val || 0.0,
                        x: items[0].last_changed
                    };
                }
                if (_aggr == "avg") {
                    const val = items.reduce((sum, entry) => sum + _num(entry.state), 0) / items.length;
                    return {
                        y: val || 0.0,
                        x: items[0].last_changed
                    };
                }
                return items.map((items) => {
                    return {
                        y: _num(items.state || 0.0),
                        x: items.timestamp
                    };
                });
            });
        } catch (err) {
            console.error("Build Histroydata", err.message, err);
        }
    }
}

// -------------------------------
// testcase group data
// -------------------------------
const config = {
    groupby: "day",
    aggregate: "last",
    datasource: require("./data.json")
};
const dp = new DataProvider(config);
const result = dp.getdata();

// -------------------------------
// results
// -------------------------------
//console.log(JSON.stringify(result, null, 4));
console.log(result);
console.log(result[0]);
console.log(result[result.length - 1]);
