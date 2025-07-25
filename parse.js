/**
 * _Times are parsed as UTC if no offset is specified_
 */
export class IsoDateParts {
	static DEFAULT_TIMEZONE_OFFSET = {
		hours: 0,
		minutes: 0,
	};

	static FULL_DATE_REGEX = /^([+-]\d{6}|\d{4})-?([01]\d)-?([0-3]\d)$/;
	static DATETIME_REGEX = /^([+-]\d{6}|\d{4})-?([01]\d)-?([0-3]\d)[Tt ]([0-2]\d(?:[\.\,]\d+)?)(?::?([0-5]\d(?:[\.\,]\d+)?)(?::?([0-5]\d))?(?:[\.\,](\d{1,9}))?)?(Z|[+-][0-2]\d(?::?[0-5]\d)?)?$/;
	static TIMEZONE_REGEX = /^([+-]\d{2})(?::?(\d{2}))?$/;
	static IS_FRACTIONAL_REGEX = /^\d+[\.\,]\d+$/;

	static getTimezoneOffset(offset = "") {
		if(offset === "Z") {
			return this.DEFAULT_TIMEZONE_OFFSET;
		}
		let match = offset.match(this.TIMEZONE_REGEX);
		if(!match) {
			return this.DEFAULT_TIMEZONE_OFFSET;
		}

		let [hours, minutes] = [match[1], match[2]];
		let sign = hours[0] === '-' ? -1 : 1;
		return {
			hours: parseInt(hours, 10) || 0,
			minutes: (parseInt(minutes, 10) || 0) * sign
		};
	}

	/** @param {RegExpMatchArray} match */
	static getByDateTime(match) {
		let offset = this.getTimezoneOffset(match[8]);

		return {
			year: parseInt(match[1], 10),
			month: match[2] ? parseInt(match[2], 10) - 1 : 0,
			day: match[3] ? parseInt(match[3], 10) : 1, // 1-indexed default
			hours: (match[4] ? parseInt(match[4], 10) : 0) - offset.hours,
			minutes: (match[5] ? parseInt(match[5], 10) : 0) - offset.minutes,
			seconds: match[6] ? parseInt(match[6], 10) : 0,
			// may include extra precision but we only count the first 3 digits for milliseconds
			milliseconds: match[7] ? parseInt(match[7].slice(0, 3), 10) : 0,
		};
	}

	/** @param {string} str An [RFC 9557](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/PlainDateTime#rfc_9557_format)-compatible string */
	static getParts(str) {
		let dateMatch = str.match(this.FULL_DATE_REGEX);
		if(dateMatch) {
			return this.getByDateTime(dateMatch);
		}

		let dateTimeMatch = str.match(this.DATETIME_REGEX);
		if(dateTimeMatch) {
			if(dateTimeMatch[4]?.match(this.IS_FRACTIONAL_REGEX) || dateTimeMatch[5]?.match(this.IS_FRACTIONAL_REGEX)) {
				throw new Error(`Unsupported date format (fractional hours or minutes): ${str}`);
			}

			return this.getByDateTime(dateTimeMatch);
		}

		throw new Error(`Unsupported date format: ${str}`);
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