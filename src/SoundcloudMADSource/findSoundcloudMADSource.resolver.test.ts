import { GraphQLResolveInfo } from "graphql";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

import { Context } from "../resolvers/types.js";
import { mkFindSoundcloudMADSourceResolver } from "./findSoundcloudMADSource.resolver.js";
import { mkSoundcloudMADSourceService } from "./SoundcloudMADSource.service.js";

const mockedFindBy = vi.fn();
vi.mock("./SoundcloudMADSource.service.js", () => ({
  mkSoundcloudMADSourceService: () => ({
    findBySourceId: mockedFindBy,
  }),
}));

describe("mkFindSoundcloudMADSourceResolver", () => {
  let service: ReturnType<typeof mkSoundcloudMADSourceService>;
  let resolver: ReturnType<typeof mkFindSoundcloudMADSourceResolver>;

  beforeAll(async () => {
    service = mkSoundcloudMADSourceService({} as Parameters<typeof mkSoundcloudMADSourceService>[0]);
    resolver = mkFindSoundcloudMADSourceResolver({ SoundcloudMADSourceService: service });
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
