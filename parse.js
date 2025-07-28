/**
 * _Times are parsed as UTC if no offset is specified_
 */
export class IsoDateParts {
	static FULL_DATE_REGEX = /^([+-]\d{6}|\d{4})-?([01]\d)-?([0-3]\d)$/;
	static DATETIME_REGEX = /^([+-]\d{6}|\d{4})-?([01]\d)-?([0-3]\d)[Tt ]([0-2]\d(?:[\.\,]\d+)?)(?::?([0-5]\d(?:[\.\,]\d+)?)(?::?([0-5]\d))?(?:[\.\,](\d{1,9}))?)?(Z|[+-][0-2]\d(?::?[0-5]\d)?)?$/;
	static TIMEZONE_REGEX = /^([+-]\d{2})(?::?(\d{2}))?$/;
	static IS_FRACTIONAL_REGEX = /^\d+[\.\,]\d+$/;

	static getTimezoneOffset(offset = "Z") {
		let [, hours = "0", minutes = "0"] = offset.match(this.TIMEZONE_REGEX) ?? [];

    let sign = hours[0] === '-' ? -1 : 1;
		return {
			hours: parseInt(hours, 10),
			minutes: parseInt(minutes, 10) * sign
		};
	}

	/** @param {RegExpMatchArray} match */
	static getByDateTime(
		_, // full match
		year = "",
		month = "0", // 0-indexed default
		day = "1", // 1-indexed default
		hours = "0",
		minutes = "0",
		seconds = "0",
		milliseconds = "0",
		timezone = "Z",
	) {
		let offset = this.getTimezoneOffset(timezone);

		return {
			year: parseInt(year, 10),
			month: parseInt(month, 10) - 1,
			day: parseInt(day, 10),
			hours: parseInt(hours, 10) - offset.hours,
			minutes: parseInt(minutes, 10) - offset.minutes,
			seconds: parseInt(seconds, 10),
			// may include extra precision but we only count the first 3 digits for milliseconds
			milliseconds: parseInt(milliseconds.slice(0, 3), 10),
		};
	}

  /** @param {string} str An [RFC 9557](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/PlainDateTime#rfc_9557_format)-compatible string */
	static getParts(str = "") {
		let dateTimeMatch = str.match(this.FULL_DATE_REGEX) ?? str.match(this.DATETIME_REGEX);
		if(!dateTimeMatch) {
		  throw new Error(`Unsupported date format: ${str}`);
		}
		if(dateTimeMatch.slice(4,6).some(part => !!part?.match(this.IS_FRACTIONAL_REGEX))) {
			throw new Error(`Unsupported date format (fractional hours or minutes): ${str}`);
		}

		return this.getByDateTime(...dateTimeMatch);
	}
}

export class IsoDate {
  /** @type {number} */
  year;
  /** @type {number} */
  month;
  /** @type {number} */
  day;
  /** @type {number} */
  hours;
  /** @type {number} */
  minutes;
  /** @type {number} */
  seconds;
  /** @type {number} */
  milliseconds;
  /** @type {string} */
  source;

  /** @param {string} str An [RFC 9557](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/PlainDateTime#rfc_9557_format)-compatible string */
	static parse(str) {
		let parts = IsoDateParts.getParts(str);
		if(parts) {
			let iso = new IsoDate(parts);
			iso.source = str;
			iso.checkParts();

			return new Date(Date.UTC(...iso.getArgs()));
		}

		throw new Error(`Unsupported date format: ${str}`);
	}

	/**
	 * @param {object} parts
	 * @param {number} parts.year
	 * @param {number} parts.month
	 * @param {number} parts.day
	 * @param {number} parts.hours
	 * @param {number} parts.minutes
	 * @param {number} parts.seconds
	 * @param {number} parts.milliseconds
	 */
	constructor(parts) {
		// parts.day, parts.year, parts.month
		Object.assign(this, parts);
	}

	/** @returns {[number, number, number, number, number, number, number]} */
	getArgs() {
		return [this.year, this.month, this.day, this.hours, this.minutes, this.seconds, this.milliseconds];
	}

	checkParts() {
		// months: 0-indexed, 0–11 are valid
		if(this.month < 0 || this.month > 11) {
			throw new Error(`Unsupported date format (invalid month): ${this.source}`);
		}

		// check if days are too big
		if(this.day < 1 || new Date(Date.UTC(this.year, this.month, 1)).getUTCMonth() !== new Date(Date.UTC(this.year, this.month, this.day)).getUTCMonth()) {
			throw new Error(`Unsupported date format (invalid days for month): ${this.source}`);
		}
	}
}

/** @param {string} str An [RFC 9557](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/PlainDateTime#rfc_9557_format)-compatible string */
export function parse(str) {
	return IsoDate.parse(str);
}