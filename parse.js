// Times are parsed as UTC if no offset is specified
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
		return {
			hours: parseInt(hours, 10) || 0,
			minutes: parseInt(minutes, 10) || 0
		};
	}

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

	static getParts(str = "") {
		let dateTimeMatch = str.match(this.FULL_DATE_REGEX) ?? str.match(this.DATETIME_REGEX);
		if(!dateTimeMatch) {
		  throw new Error(`Unsupported date format: ${str}`);
		}
		if(dateTimeMatch[4]?.match(this.IS_FRACTIONAL_REGEX) || dateTimeMatch[5]?.match(this.IS_FRACTIONAL_REGEX)) {
			throw new Error(`Unsupported date format (fractional hours or minutes): ${str}`);
		}

		return this.getByDateTime(...dateTimeMatch);
	}
}

export class IsoDate {
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

	constructor(parts) {
		// parts.day, parts.year, parts.month, parts.week
		Object.assign(this, parts);
	}

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

export function parse(str) {
	return IsoDate.parse(str);
}