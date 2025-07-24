# `@11ty/parse-date-strings`

Features:

- Zero dependency super minimal [RFC 9557](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/PlainDateTime#rfc_9557_format)-compatible date parsing library. Date strings are also parseable by `Temporal.PlainDate.from`, `Temporal.Instant.from`, or `Temporal.PlainDateTime.from` to prepare for wider [Temporal API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal) support.
  - Alternatives: [`temporal-polyfill`](https://github.com/fullcalendar/temporal-polyfill) or [`js-temporal/temporal-polyfill`](https://github.com/js-temporal/temporal-polyfill)
- Invalid strings throw errors.
- Time zone notes:
  - Defaults to UTC when time zone is unknown (*not* local time). This matches previous behavior in Eleventy and this feature maintains consistency between build and deploy servers.
  - Supports `+00`, `+00:00`, `-00`, or `-00:00` style time zone offsets (`:` delimiter is optional)
- Delimiter notes:
  - *Requires* a `T` or `t` or ` ` (space) delimiter with DateTime strings
  - Delimiters in dates (`-`) and times (`:`) are optional

Not supported (for RFC 9557 compatibility):

- Standalone time formats are *not* supported (must be Date or DateTime)
- [ISO week date syntax](https://en.wikipedia.org/wiki/ISO_week_date) is *not* supported (e.g. `YYYY-W01-1`)
- Day of year syntax is *not* supported (e.g. `YYYY-001`, `YYYY-365`)
- Fractional hours or minutes (e.g. `T14.6` or `T10:30.6`) are *not* supported. Fractional seconds (e.g. milliseconds) are supported (of course).

## Usage

```
npm install @11ty/parse-date-strings
```

```js
import { parse } from "@11ty/parse-date-strings

// `parse` returns JavaScript Date

parse("2000-01-01") instanceof Date
// true

parse("2000-01-01").toUTCString()
// "Mon, 01 Jan 2001 00:00:00 GMT"
```

## Comparisons

### `luxon`

More strict parsing compared with [Luxon’s `fromISO`](https://moment.github.io/luxon/#/parsing?id=iso-8601) (used in Eleventy v0.x through v3):

```
2016-05-25
20160525
2016-05-25T09
2016-05-25T09:24
2016-05-25T09:24:15
2016-05-25T09:24:15.123
2016-05-25T0924
2016-05-25T092415
2016-05-25T092415.123
2016-05-25T09:24:15,123

# No YYYY or YYYYMM syntax
2016                      # Dropped
2016-05                   # Dropped
201605                    # Dropped

# No ISO week date syntax
2016-W21-3                # Dropped
2016W213                  # Dropped
2016-W21-3T09:24:15.123   # Dropped
2016W213T09:24:15.123     # Dropped

# No day of year syntax (e.g. 200th day of the year)
2016-200                  # Dropped
2016200                   # Dropped
2016-200T09:24:15.123     # Dropped

# No implied current day (time-only syntax)
09:24                     # Dropped
09:24:15                  # Dropped
09:24:15.123              # Dropped
09:24:15,123              # Dropped
```