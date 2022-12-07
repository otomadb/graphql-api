import { describe, expect, it } from "vitest";

import { TagModel } from "../../graphql/models.js";
import { resolveHistory, resolveId } from "./index.js";

describe("Tag.id", () => {
  it("add prefix", () => {
    const actual = resolveId({ id: "1" } as TagModel);
    expect(actual).eq("tag:1");
  });
});

describe("Tag.history", () => {
  it("must be empty", () => {
    const actual = resolveHistory();
    expect(actual).toStrictEqual([]);
  });
});
