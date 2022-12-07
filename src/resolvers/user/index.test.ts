import { expect, it, test } from "vitest";

import { UserModel } from "../../graphql/models.js";
import { resolveId } from "./index.js";

test("User.id", () => {
  it("add prefix", () => {
    const actual = resolveId({ id: "1" } as UserModel);
    expect(actual).toBe("user:1");
  });
});
