import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";

import { ResolverDeps } from "../resolvers/types.js";
import { cleanPrisma } from "../test/cleanPrisma.js";
import { mkBilibiliMADSourceService } from "./BilibiliMADSource.service.js";

describe("BilibiliMADSourceService", () => {
  let prisma: ResolverDeps["prisma"];

  let service: ReturnType<typeof mkBilibiliMADSourceService>;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();

    service = mkBilibiliMADSourceService({ prisma });
  });

  beforeEach(async () => {
    await cleanPrisma(prisma);
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
});
