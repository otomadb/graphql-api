import { describe, expect, test } from "vitest";

import { splitDate } from "./splitDate.js";

describe("splitDate()", () => {
  test.each([
    [new Date(100), new Date(200), 5, [new Date(120), new Date(140), new Date(160), new Date(180), new Date(200)]],
  ])("case %#", (start, end, split) => {
    const actual = splitDate(start, end, split);
    expect(actual).toStrictEqual(actual);
  });
});
