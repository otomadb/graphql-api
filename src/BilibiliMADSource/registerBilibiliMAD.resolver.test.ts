import { GraphQLResolveInfo } from "graphql";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

import { RegisterBilibiliMadSucceededPayload } from "../gql/graphql.js";
import { buildGqlId } from "../resolvers/id.js";
import { Context } from "../resolvers/types.js";
import { err, ok } from "../utils/Result.js";
import { mkBilibiliMADSourceService } from "./BilibiliMADSource.service.js";
import { mkRegisterBilibiliMADResolver, RegisterBilibiliMADResolver } from "./registerBilibiliMAD.resolver.js";

const mockRegister = vi.fn();
vi.mock("./BilibiliMADSource.service.js", () => {
  return {
    mkBilibiliMADSourceService: () => ({
      register: mockRegister,
    }),
  };
});

describe("registerBilibiliMAD", () => {
  let service: ReturnType<typeof mkBilibiliMADSourceService>;
  let resolver: RegisterBilibiliMADResolver;

  beforeAll(async () => {
    service = mkBilibiliMADSourceService({} as Parameters<typeof mkBilibiliMADSourceService>[0]);
    resolver = mkRegisterBilibiliMADResolver({ BilibiliMADSourceService: service });
  });

  beforeEach(async () => {
    vi.clearAllMocks();
  });

  test("tagIdが重複", async () => {
    await expect(
      resolver(
        {},
        {
          input: {
            tagIds: [buildGqlId("Tag", "1"), buildGqlId("Tag", "1"), buildGqlId("Tag", "2")],
          } as Parameters<typeof resolver>[1]["input"],
        },
        { currentUser: { id: "1" } } as Context,
        {} as GraphQLResolveInfo,
      ),
    ).rejects.toThrowError(/duplicated tag id/);
  });

  test("tagIdがGraphQL IDではない", async () => {
    await expect(
      resolver(
        {},
        { input: { tagIds: ["1", buildGqlId("Tag", "2")] } as Parameters<typeof resolver>[1]["input"] },
        { currentUser: { id: "1" } } as Context,
        {} as GraphQLResolveInfo,
      ),
    ).rejects.toThrowError(/invalid tag id/);
  });

  test("semitagNamesが重複", async () => {
    await expect(
      resolver(
        {},
        {
          input: {
            tagIds: [buildGqlId("Tag", "1"), buildGqlId("Tag", "2")],
            semitagNames: ["1", "1"],
          } as Parameters<typeof resolver>[1]["input"],
        },
        { currentUser: { id: "1" } } as Context,
        {} as GraphQLResolveInfo,
      ),
    ).rejects.toThrowError(/duplicated semitag names/);
  });

  test("sourceIdsが重複", async () => {
    await expect(
      resolver(
        {},
        {
          input: {
            tagIds: [buildGqlId("Tag", "1"), buildGqlId("Tag", "2")],
            semitagNames: ["1", "2"],
            sourceIds: ["1", "1"],
          } as Parameters<typeof resolver>[1]["input"],
        },
        { currentUser: { id: "1" } } as Context,
        {} as GraphQLResolveInfo,
      ),
    ).rejects.toThrowError(/duplicated source ids/);
  });

  test.todo("sourceIdsがBilibiliのbvidではない");

  test("Service側で失敗", async () => {
    mockRegister.mockResolvedValueOnce(err(""));

    const actual = await resolver(
      {},
      {
        input: {
          primaryTitle: "Primary Title",
          primaryThumbnailUrl: "https://example.com/thumbnail.jpg",
          tagIds: [buildGqlId("Tag", "1"), buildGqlId("Tag", "2")],
          semitagNames: ["1", "2"],
          sourceIds: ["1", "2"],
        },
      },
      { currentUser: { id: "1" } } as Context,
      {} as GraphQLResolveInfo,
    );

    expect(actual.__typename).toBe("MutationInternalServerError");
  });

  test("正常系", async () => {
    mockRegister.mockResolvedValueOnce(ok({ id: "1" }));

    const actual = await resolver(
      {},
      {
        input: {
          primaryTitle: "Primary Title",
          primaryThumbnailUrl: "https://example.com/thumbnail.jpg",
          tagIds: [buildGqlId("Tag", "1"), buildGqlId("Tag", "2")],
          semitagNames: ["1", "2"],
          sourceIds: ["1", "2"],
        },
      },
      { currentUser: { id: "1" } } as Context,
      {} as GraphQLResolveInfo,
    );

    expect(actual.__typename).toBe("RegisterBilibiliMADSucceededPayload");
    expect((actual as RegisterBilibiliMadSucceededPayload).video.id).toBe("1");
  });
});
