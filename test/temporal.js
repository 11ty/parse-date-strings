import { Temporal } from 'temporal-polyfill';

const TIMEZONE_REGEX = /([+-]\d{2}):?(\d{2})?$/;

function convertTemporalToTimestamp(d) {
  // for Temporal.Instant
  if(d.epochMilliseconds) {
    return d.epochMilliseconds;
  }

  // PlainDate and PlainDateTime
  return Date.UTC(d.year, d.month-1, d.day, d.hour || 0, d.minute || 0, d.second || 0, d.millisecond || 0);
}

export function parseDate(str) {
  let d = Temporal.PlainDate.from(str, {
    overflow: "reject"
  });
  return new Date(convertTemporalToTimestamp(d)).toUTCString();
}

export function parseDateTime(str) {
  let d;
  if(str.endsWith("Z") || str.match(TIMEZONE_REGEX)) {
    d = Temporal.Instant.from(str, {
      overflow: "reject"
    });
  } else {
    d = Temporal.PlainDateTime.from(str, {
      overflow: "reject"
    });
  }

  let timestamp = convertTemporalToTimestamp(d);
  return new Date(timestamp).toUTCString();
}

export function parse(str) {
  let result;
  let errors = [];
  try {
    result = parseDate(str);
  } catch(e) {
    errors.push(e);
  }
  try {
    result = parseDateTime(str);
  } catch(e) {
    errors.push(e);
  }

  // if both methods resulted in errors
  if(errors.length === 2) {
    throw errors.pop();
  }

  return result;
}
