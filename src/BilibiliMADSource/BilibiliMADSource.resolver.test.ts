import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";

import { ResolverDeps } from "../resolvers/types.js";
import { cleanPrisma } from "../test/cleanPrisma.js";
import { BilibiliMADSourceDTO } from "./BilibiliMADSource.dto.js";
import mkresolver from "./BilibiliMADSource.resolver.js";

describe("resolverBilibiliMADSource", () => {
  let prisma: ResolverDeps["prisma"];

  let resolver: ReturnType<typeof mkresolver>;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();

    resolver = mkresolver({ prisma });
  });

  beforeEach(async () => {
    await cleanPrisma(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("sourceId", () => {
    expect(resolver.sourceId({ sourceId: "BV1xx411c7mu" } as BilibiliMADSourceDTO)).toBe("BV1xx411c7mu");
  });

  test("url", () => {
    expect(resolver.url({ sourceId: "BV1xx411c7mu" } as BilibiliMADSourceDTO)).toBe(
      "https://www.bilibili.com/video/BV1xx411c7mu",
    );
  });

  test("embedUrl", () => {
    expect(resolver.embedUrl({ sourceId: "BV1xx411c7mu" } as BilibiliMADSourceDTO)).toBe(
      "https://player.bilibili.com/player.html?bvid=BV1xx411c7mu",
    );
  });

  describe("video", () => {
    test("存在する", async () => {
      await prisma.video.create({ data: { id: "1" } });

      const actual = await resolver.video({ videoId: "1" } as BilibiliMADSourceDTO);
      expect(actual.id).toBe("1");
    });

    test("存在しない", async () => {
      await expect(resolver.video({ videoId: "1" } as BilibiliMADSourceDTO)).rejects.toThrowError();
    });
  });
});
