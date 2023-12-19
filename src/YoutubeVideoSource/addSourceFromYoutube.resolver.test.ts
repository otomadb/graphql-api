import { PrismaClient } from "@prisma/client";
import { pino } from "pino";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";

import { buildGqlId } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { cleanPrisma } from "../test/cleanPrisma.js";
import { VideoDTO } from "../Video/dto.js";
import { mkAddSourceFromYoutubeResolver } from "./addSourceFromYoutube.resolver.js";
import { YoutubeVideoSourceDTO } from "./dto.js";

describe("Mutation.addSourceFromYoutube", () => {
  let prisma: ResolverDeps["prisma"];
  let resolver: ReturnType<typeof mkAddSourceFromYoutubeResolver>;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();

    resolver = mkAddSourceFromYoutubeResolver(pino(), { prisma });
  });

  beforeEach(async () => {
    await cleanPrisma(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("madIdが不正な形式の場合", async () => {
    await expect(() =>
      resolver(
        {},
        {
          input: {
            madId: "invalid",
            title: { title: "title", locale: "ja" },
            thumbnailUrl: "https://example.com",
            sourceId: "source:1",
            isOriginal: true,
          },
        },
        {} as Parameters<typeof resolver>[2],
        {} as Parameters<typeof resolver>[3],
      ),
    ).rejects.toThrowError();
  });

  test("成功例", async () => {
    prisma.$transaction([
      prisma.video.create({
        data: {
          id: "video_1",
          serial: 1,
        },
      }),
    ]);

    const actual = await resolver(
      {},
      {
        input: {
          madId: buildGqlId("Video", "video_1"),
          title: { title: "title", locale: "ja" },
          thumbnailUrl: "https://example.com",
          sourceId: "source:1",
          isOriginal: true,
        },
      },
      {} as Parameters<typeof resolver>[2],
      {} as Parameters<typeof resolver>[3],
    );

    const source = actual.source as YoutubeVideoSourceDTO;
    expect(source.videoId).toBe("video_1");

    const video = actual.video as VideoDTO;
    expect(video.id).toBe("video_1");
  });
});
