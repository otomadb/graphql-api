import { GraphQLResolveInfo } from "graphql";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

import { Context } from "../resolvers/types.js";
import { mkBilibiliMADSourceService } from "./BilibiliMADSource.service.js";
import { mkFindBilibiliMADSourceResolver } from "./findBilibiliMADSource.resolver.js";

const mockedFindBy = vi.fn();
vi.mock("./BilibiliMADSource.service.js", () => ({
  mkBilibiliMADSourceService: () => ({
    findBySourceId: mockedFindBy,
  }),
}));

describe("mkFindBilibiliMADSourceResolver", () => {
  let service: ReturnType<typeof mkBilibiliMADSourceService>;
  let resolver: ReturnType<typeof mkFindBilibiliMADSourceResolver>;

  beforeAll(async () => {
    service = mkBilibiliMADSourceService({} as Parameters<typeof mkBilibiliMADSourceService>[0]);
    resolver = mkFindBilibiliMADSourceResolver({ BilibiliMADSourceService: service });
  });

  afterEach(async () => {
    vi.clearAllMocks();
  });

  test("sourceIdがundefined", async () => {
    await expect(
      resolver({}, { input: { sourceId: undefined } }, {} as Context, {} as GraphQLResolveInfo),
    ).rejects.toThrowError();
  });

  test("存在する場合", async () => {
    mockedFindBy.mockResolvedValueOnce({ id: "1" });

    const actual = await resolver({}, { input: { sourceId: "1" } }, {} as Context, {} as GraphQLResolveInfo);

    expect(actual).toStrictEqual({ id: "1" });
  });

  test("存在しない場合", async () => {
    mockedFindBy.mockResolvedValueOnce(null);

    const actual = await resolver({}, { input: { sourceId: "1" } }, {} as Context, {} as GraphQLResolveInfo);

    expect(actual).toBeNull();
  });
});
