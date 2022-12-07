import { GraphQLResolveInfo } from "graphql";
import { describe, expect, it } from "vitest";

import { Context } from "../../context.js";
import { UserModel } from "../../graphql/models.js";
import { resolveUser } from "./index.js";

describe("resolver User.id", () => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
  const resolveId = resolveUser?.id!;

  it("実装されているか", () => {
    expect(resolveId).toBeDefined();
  });

  it("prefixを付ける", () => {
    const actual = resolveId({ id: "1" } as UserModel, {}, {} as Context, {} as GraphQLResolveInfo);
    expect(actual).toBe("user:1");
  });
});
