import { assert, test } from 'vitest';
import { DateTime } from 'luxon';
import { IsoDate, parse } from "./parse.js";
import { parse as temporalParse } from "./test/temporal.js";

// This test suite compares with Luxon output for maximum backwards compatibility
import { shouldSkip, VALID_TEST_CASES, INVALID_TEST_CASES, SUPPLIED_TEST_CASES } from './test/utils.js';

// Some test cases from https://moment.github.io/luxon/#/parsing?id=ad-hoc-parsing
// ISO8601 date parsing https://github.com/11ty/eleventy/issues/3587
for(let line of VALID_TEST_CASES.split("\n")) {
  if(shouldSkip(line)) {
    continue;
  }

  test(`Parse ${line}`, () => {
    // assert.equal(received, expected)

    // Compare to luxon
    assert.equal(parse(line).toUTCString(), DateTime.fromISO(line, {zone: "utc"}).toJSDate().toUTCString());

    // Compare to Temporal
    assert.equal(parse(line).toUTCString(), temporalParse(line).toString());
  });
}

// These test cases are expected to fail
for(let line of INVALID_TEST_CASES.split("\n")) {
  if(shouldSkip(line)) {
    continue;
  }

  test(`Bad syntax: ${line}`, () => {
    try {
      parse(line);
      assert.isTrue(false);
    } catch(e) {
      assert.isTrue(e.message.startsWith("Unsupported date format"))
      assert.isTrue(e.message.endsWith(line))
    }
  });

  test(`Bad syntax: ${line} (Temporal)`, () => {
    try {
      temporalParse(line);
      assert.isTrue(false);
    } catch(e) {
      assert.isTrue(e instanceof Error)
    }
  });
}

for(let line of SUPPLIED_TEST_CASES.split("\n")) {
  if(shouldSkip(line)) {
    continue;
  }

  test(`Parse ${line}`, () => {
    // assert.equal(received, expected)

    // Compare to luxon
    assert.equal(parse(line).toUTCString(), DateTime.fromISO(line, {zone: "utc"}).toJSDate().toUTCString());

    // Compare to Temporal
    assert.equal(parse(line).toUTCString(), temporalParse(line).toString());
  });
}