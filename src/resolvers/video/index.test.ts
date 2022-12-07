import { GraphQLResolveInfo } from "graphql";
import { describe, expect, it } from "vitest";

import { Context } from "../../context.js";
import { VideoModel } from "../../graphql/models.js";
import { SortOrder } from "../../graphql/resolvers.js";
import { resolveVideo } from "./index.js";

describe("resolver Video.id", () => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
  const resolveId: Exclude<typeof resolveVideo, undefined>["id"] = resolveVideo?.id!;

  it("実装されているか", () => {
    expect(resolveId).toBeDefined();
  });

  it("prefixを付ける", () => {
    const actual = resolveId({ id: "1" } as VideoModel, {}, {} as Context, {} as GraphQLResolveInfo);
    expect(actual).toBe("video:1");
  });
});

describe("resolver Video.history", () => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
  const resolveHistory = resolveVideo?.history!;

  it("実装されているか", () => {
    expect(resolveHistory).toBeDefined();
  });

  it("現状は空配列を返す", () => {
    const actual = resolveHistory(
      {} as VideoModel,
      { skip: 0, limit: 0, order: { createdAt: SortOrder.Asc } },
      {} as Context,
      {} as GraphQLResolveInfo
    );
    expect(actual).eqls([]);
  });
});
