import { PrismaClient } from "@prisma/client";
import { GraphQLResolveInfo } from "graphql";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";

import { Context, ResolverDeps } from "../resolvers/types.js";
import { cleanPrisma } from "../test/cleanPrisma.js";
import { BilibiliMADSourceDTO } from "./BilibiliMADSource.dto.js";
import { resolverBilibiliMADSource } from "./BilibiliMADSource.resolver.js";

describe("resolverBilibiliMADSource", () => {
  let prisma: ResolverDeps["prisma"];

  let resolver: ReturnType<typeof resolverBilibiliMADSource>;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();

    resolver = resolverBilibiliMADSource({ prisma });
  });

  beforeEach(async () => {
    await cleanPrisma(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("sourceId", () => {
    expect(
      resolver.sourceId(
        { sourceId: "BV1xx411c7mu" } as BilibiliMADSourceDTO,
        {},
        {} as Context,
        {} as GraphQLResolveInfo,
      ),
    ).toBe("BV1xx411c7mu");
  });

  test("url", () => {
    expect(
      resolver.url({ sourceId: "BV1xx411c7mu" } as BilibiliMADSourceDTO, {}, {} as Context, {} as GraphQLResolveInfo),
    ).toBe("https://www.bilibili.com/video/BV1xx411c7mu");
  });

  test("embedUrl", () => {
    expect(
      resolver.embedUrl(
        { sourceId: "BV1xx411c7mu" } as BilibiliMADSourceDTO,
        {},
        {} as Context,
        {} as GraphQLResolveInfo,
      ),
    ).toBe("https://player.bilibili.com/player.html?bvid=BV1xx411c7mu");
  });

  describe("video", () => {
    test("存在する", async () => {
      await prisma.video.create({ data: { id: "1" } });

      const actual = await resolver.video(
        { videoId: "1" } as BilibiliMADSourceDTO,
        {},
        {} as Context,
        {} as GraphQLResolveInfo,
      );
      expect(actual.id).toBe("1");
    });

    test("存在しない", async () => {
      await expect(
        resolver.video({ videoId: "1" } as BilibiliMADSourceDTO, {}, {} as Context, {} as GraphQLResolveInfo),
      ).rejects.toThrowError();
    });
  });
});
