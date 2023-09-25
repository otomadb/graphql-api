import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

import { mkNeo4jService, Neo4jService } from "../Neo4j/Neo4j.service.js";
import { ResolverDeps } from "../resolvers/types.js";
import { cleanPrisma } from "../test/cleanPrisma.js";
import { isOk, ReturnOk } from "../utils/Result.js";
import { BilibiliMADSourceService, mkBilibiliMADSourceService } from "./BilibiliMADSource.service.js";

vi.mock("../Neo4j/Neo4j.service.js", () => {
  return {
    mkNeo4jService: () => ({
      registerVideoTags: vi.fn(),
    }),
  };
});

describe("BilibiliMADSourceService", () => {
  let prisma: ResolverDeps["prisma"];

  let Neo4jService: Neo4jService;
  let service: BilibiliMADSourceService;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();

    Neo4jService = mkNeo4jService({} as Parameters<typeof mkNeo4jService>[0]);

    service = mkBilibiliMADSourceService({ prisma, Neo4jService });
  });

  beforeEach(async () => {
    await cleanPrisma(prisma);
    vi.clearAllMocks();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("getByIdOrThrow", () => {
    test("存在する", async () => {
      await prisma.bilibiliMADSource.create({
        data: {
          id: "1",
          sourceId: "BV1xx411c7mu",
          video: { create: { id: "1" } },
        },
      });

      const actual = await service.getByIdOrThrow("1");
      expect(actual.id).toBe("1");
    });

    test("存在しない", async () => {
      await expect(service.getByIdOrThrow("1")).rejects.toThrowError();
    });
  });

  describe("getBySourceIdOrThrow", () => {
    test("存在する", async () => {
      await prisma.bilibiliMADSource.create({
        data: {
          id: "1",
          sourceId: "BV1xx411c7mu",
          video: { create: { id: "1" } },
        },
      });

      const actual = await service.getBySourceIdOrThrow("BV1xx411c7mu");
      expect(actual.id).toBe("1");
    });

    test("存在しない", async () => {
      await expect(service.getByIdOrThrow("BV1xx411c7mu")).rejects.toThrowError();
    });
  });

  describe("register", () => {
    test("正常系", async () => {
      await prisma.user.create({ data: { id: "1" } });
      await prisma.tag.createMany({
        data: [
          { id: "1", isCategoryTag: false },
          { id: "2", isCategoryTag: false },
        ],
      });

      const actual = (await service.register(
        {
          primaryTitle: "Primary Title",
          primaryThumbnail: "https://example.com/thumbnail.jpg",
          tagIds: ["1", "2"],
          semitagNames: ["1", "2"],
          sourceIds: ["BV1xx411c7mu"],
        },
        "1",
      )) as ReturnOk<typeof service.register>;
      expect(isOk(actual)).toBe(true);

      expect(actual.data.id).toBeDefined();
      expect(actual.data.serial).toBeDefined();

      const video = await prisma.video.findUnique({ where: { id: actual.data.id } });
      expect(video).toBeDefined();

      const titles = await prisma.videoTitle.findMany({ where: { videoId: actual.data.id } });
      expect(titles).toHaveLength(1);

      const thumbnails = await prisma.videoThumbnail.findMany({ where: { videoId: actual.data.id } });
      expect(thumbnails).toHaveLength(1);

      const tags = await prisma.videoTag.findMany({ where: { videoId: actual.data.id } });
      expect(tags).toHaveLength(2);

      const semitags = await prisma.semitag.findMany({ where: { videoId: actual.data.id } });
      expect(semitags).toHaveLength(2);

      const sources = await prisma.bilibiliMADSource.findMany({ where: { videoId: actual.data.id } });
      expect(sources).toHaveLength(1);

      expect(Neo4jService.registerVideoTags).toBeCalledTimes(1);
    });
  });
});
