# Eleventy’s ISO8601 Date parser

Features:

- Zero dependency super minimal ISO8601 date parsing library. Alternatives were [too lax, inaccurate, huge on disk, or hundle in bundle](https://fediverse.zachleat.com/@zachleat/114870836413532617).
- Dates with 8 digits do not require `-` delimiters (all other dates require delimiters, e.g. `YYYY-MM`)
- Times with 6 digits do not require `:` delimiters (all others times require delimiters, e.g. `HH:II`)
- Requires the `T` delimiter for date and time
- Defaults to UTC when time zone is unknown instead of local time (`Z` can be explicit or implied)
  - This matches previous behavior in Eleventy and this feature maintains consistency between build and deploy servers.
- Supports +00:00 or -00:00 style time zone offsets
- Invalid strings throw errors.

Not supported:

- Standalone times are not supported (must be date or datetime)
- [ISO week date syntax](https://en.wikipedia.org/wiki/ISO_week_date) (e.g. `YYYY-W01-1`)
- Day of year syntax is not supported (e.g. `YYYY-001`, `YYYY-365`)
- Fractional syntax for hours or minutes (e.g. `T14.6` or `T10:30.6`). Fractional seconds (e.g. milliseconds) are supported (of course).

## `luxon` Comparison

More strict parsing compared with [Luxon’s `fromISO`](https://moment.github.io/luxon/#/parsing?id=iso-8601) (used in Eleventy v0.x through v3):

```
2016
2016-05
201605                    # Dropped, delimiter required if date is not 8 digits
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