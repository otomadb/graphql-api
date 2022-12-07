import { describe, expect, it } from "vitest";

import { UserModel } from "../../graphql/models.js";
import { resolveId } from "./index.js";

describe("resolver User.id", () => {
  it("prefixを付ける", () => {
    const actual = resolveId({ id: "1" } as UserModel);
    expect(actual).toBe("user:1");
  });
});
