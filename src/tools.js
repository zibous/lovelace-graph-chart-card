/* eslint-disable no-bitwise */

const dtFormat = function (key) {
	const df = [];
	df["timestamp"] = "timestamp";
	df["day"] = "%Y-%M-%d";
	df["hour"] = "%Y-%M-%d %H:00:00";
	df["month"] = "%Y-%M";
	df["year"] = "%Y";
	if (key in df) return df[key];
	else return df["timestamp"];
};


function formatDate(d, fmt) {
	const date = new Date(d);

	function pad(value) {
		return value.toString().length < 2 ? "0" + value : value;
	}
	if (fmt == "timestamp") {
		return (
			date.getUTCFullYear() +
			"-" +
			pad(date.getUTCMonth() + 1) +
			"-" +
			pad(date.getUTCDate()) +
			" " +
			pad(date.getUTCHours()) +
			":" +
			pad(date.getUTCMinutes()) +
			":" +
			pad(date.getUTCSeconds())
		);
	}
	return fmt.replace(/%([a-zA-Z])/g, function (_, fmtCode) {
		switch (fmtCode) {
			case "Y":
				return date.getUTCFullYear();
			case "M":
				return pad(date.getUTCMonth() + 1);
			case "d":
				return pad(date.getUTCDate());
			case "H":
				return pad(date.getUTCHours());
			case "m":
				return pad(date.getUTCMinutes());
			case "s":
				return pad(date.getUTCSeconds());
			default:
				throw new Error("Unsupported format code: " + fmtCode);
		}
	});
}

function datavalue(value, prefix, suffix) {
	try {
		let v = value;
		prefix = prefix ? prefix : "";
		suffix = suffix ? suffix : "";
		if (GLOBAL.LOCALE && GLOBAL.LOCALE !== "") {
			if (typeof v === "number") {
				v = new Intl.NumberFormat(GLOBAL.LOCALE).format(v);
				if (!isNaN(v)) v = value;
			} else if (new Date(v) instanceof Date) {
				if (!isNaN(Date.parse(v))) {
					v = new Date(v).toLocaleDateString(GLOBAL.LOCALE, {
						day: "numeric",
						month: "short",
						year: "numeric",
					});
				}
			}
		}
		return prefix + " " + v + " " + suffix;
	} catch (err) {
		console.error("Datavalue Error: ", err.message);
	}
	return prefix + value + suffix;
}

function mergedata(current, update) {
	Object.keys(update).forEach(function (key) {
		if (
			current.hasOwnProperty(key) &&
			typeof current[key] === "object" &&
			!(current[key] instanceof Array)
		) {
			mergedata(current[key], update[key]);
		} else {
			current[key] = update[key];
		}
	});
	return current;
}

function num(n) {
	return n === parseInt(n) ? parseInt(n) : parseFloat(n).toFixed(2);
}

export {
    dtFormat,
    formatDate,
    datavalue,
	mergedata,
	num
}