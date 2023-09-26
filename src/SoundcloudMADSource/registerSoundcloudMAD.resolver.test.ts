import { GraphQLResolveInfo } from "graphql";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

import { RegisterSoundcloudMadSucceededPayload } from "../gql/graphql.js";
import { buildGqlId } from "../resolvers/id.js";
import { Context } from "../resolvers/types.js";
import { err, ok } from "../utils/Result.js";
import { mkRegisterSoundcloudMADResolver, RegisterSoundcloudMADResolver } from "./registerSoundcloudMAD.resolver.js";
import { mkSoundcloudMADSourceService } from "./SoundcloudMADSource.service.js";

const mockRegister = vi.fn();
vi.mock("./SoundcloudMADSource.service.js", () => {
  return {
    mkSoundcloudMADSourceService: () => ({
      register: mockRegister,
    }),
  };
});

describe("registerSoundcloudMAD", () => {
  let service: ReturnType<typeof mkSoundcloudMADSourceService>;
  let resolver: RegisterSoundcloudMADResolver;

  beforeAll(async () => {
    service = mkSoundcloudMADSourceService({} as Parameters<typeof mkSoundcloudMADSourceService>[0]);
    resolver = mkRegisterSoundcloudMADResolver({ SoundcloudMADSourceService: service });
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

  test.todo("sourceIdsがSoundcloudのbvidではない");

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

    expect(actual.__typename).toBe("RegisterSoundcloudMADSucceededPayload");
    expect((actual as RegisterSoundcloudMadSucceededPayload).mad.id).toBe("1");
  });
});
