import { GraphQLResolveInfo } from "graphql";

import { Context } from "../../context.js";
import { TagModel } from "../../graphql/models.js";
import { resolveTag } from "./index.js";

describe("resolver Tag.id", () => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
  const resolveId = resolveTag?.id!;

  it("実装されているか", () => {
    expect(resolveId).toBeDefined();
  });

  it("prefixを付ける", () => {
    const actual = resolveId({ id: "1" } as TagModel, {}, {} as Context, {} as GraphQLResolveInfo);
    expect(actual).toBe("tag:1");
  });
});

describe("resolver Tag.history", () => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
  const resolveHistory = resolveTag?.history!;

  it("実装されているか", () => {
    expect(resolveHistory).toBeDefined();
  });

  it("現状は空配列を返す", () => {
    const actual = resolveHistory({} as TagModel, {}, {} as Context, {} as GraphQLResolveInfo);
    expect(actual).toStrictEqual([]);
  });
});
