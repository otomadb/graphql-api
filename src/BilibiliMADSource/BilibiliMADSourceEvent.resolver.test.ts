import { PrismaClient } from "@prisma/client";
import { GraphQLResolveInfo } from "graphql";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";

import { Context, ResolverDeps } from "../resolvers/types.js";
import { cleanPrisma } from "../test/cleanPrisma.js";
import { BilibiliMADSourceEventDTO } from "./BilibiliMADSourceEvent.dto.js";
import { resolverBilibiliMADSourceCreateEvent } from "./BilibiliMADSourceEvent.resolver.js";

describe("resolverBilibiliMADSourceCreateEvent", () => {
  let prisma: ResolverDeps["prisma"];

  let resolver: ReturnType<typeof resolverBilibiliMADSourceCreateEvent>;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();

    resolver = resolverBilibiliMADSourceCreateEvent({
      prisma,
      userService: {} as any, // TODO: mock
    });
  });

  beforeEach(async () => {
    await cleanPrisma(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("source", () => {
    test("存在する", async () => {
      await prisma.bilibiliMADSource.create({
        data: {
          id: "1",
          sourceId: "BV1xx411c7mu",
          video: { create: { id: "1" } },
        },
      });

      const actual = await resolver.source(
        { sourceId: "BV1xx411c7mu" } as BilibiliMADSourceEventDTO,
        {},
        {} as Context,
        {} as GraphQLResolveInfo,
      );
      expect(actual.id).toBe("1");
    });

    test("存在しない", async () => {
      await expect(
        resolver.source(
          { sourceId: "BV1xx411c7mu" } as BilibiliMADSourceEventDTO,
          {},
          {} as Context,
          {} as GraphQLResolveInfo,
        ),
      ).rejects.toThrowError();
    });
  });
});
