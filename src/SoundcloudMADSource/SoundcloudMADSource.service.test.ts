import { PrismaClient } from "@prisma/client";
import { pino } from "pino";
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

import { mkSoundcloudService, SoundcloudService } from "../Common/Soundcloud.service.js";
import { Neo4jService } from "../Neo4j/Neo4j.service.js";
import { ResolverDeps } from "../resolvers/types.js";
import { SoundcloudRegistrationRequestService } from "../SoundcloudRegistrationRequest/SoundcloudRegistrationRequest.service.js";
import { cleanPrisma } from "../test/cleanPrisma.js";
import { TimelineEventService } from "../Timeline/TimelineEvent.service.js";
import { err, isErr, isOk, ok, ReturnErr, ReturnOk } from "../utils/Result.js";
import { mkSoundcloudMADSourceService, SoundcloudMADSourceService } from "./SoundcloudMADSource.service.js";

const registerNeo4jVideoTags = vi.fn();
const clearAllTimeline = vi.fn();
const mockMkAcceptTransaction = vi.fn();

describe("SoundcloudMADSourceService", () => {
  let prisma: ResolverDeps["prisma"];

  let SC: SoundcloudService;
  let service: SoundcloudMADSourceService;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();

    SC = mkSoundcloudService({} as Parameters<typeof mkSoundcloudService>[0]);

    service = mkSoundcloudMADSourceService({
      logger: pino(),
      prisma,
      Neo4jService: {
        registerVideoTags: registerNeo4jVideoTags,
      } as unknown as Neo4jService,
      TimelineEventService: {
        clearAll: clearAllTimeline,
      } as unknown as TimelineEventService,
      SoundcloudService: SC,
      SoundcloudRegistrationRequestService: {
        mkAcceptTransaction: mockMkAcceptTransaction,
      } as unknown as SoundcloudRegistrationRequestService,
    });
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
      await prisma.soundcloudVideoSource.create({
        data: {
          id: "1",
          sourceId: "1469143378",
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
      await prisma.soundcloudVideoSource.create({
        data: {
          id: "1",
          sourceId: "1469143378",
          video: { create: { id: "1" } },
        },
      });

      const actual = await service.getBySourceIdOrThrow("1469143378");
      expect(actual.id).toBe("1");
    });

    test("存在しない", async () => {
      await expect(service.getByIdOrThrow("BV1xx411c7mu")).rejects.toThrowError();
    });
  });

  describe("register", () => {
    describe("リクエストは存在しない", () => {
      test("正常系", async () => {
        mockMkAcceptTransaction.mockReturnValueOnce(
          ok([]) satisfies ReturnOk<SoundcloudRegistrationRequestService["mkAcceptTransaction"]>,
        );

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
            sourceIds: ["1469143378"],
            requestId: null,
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

        const sources = await prisma.soundcloudVideoSource.findMany({ where: { videoId: actual.data.id } });
        expect(sources).toHaveLength(1);

        expect(clearAllTimeline).toBeCalled();
        expect(registerNeo4jVideoTags).toBeCalled();
      });
    });

    describe("リクエストを解決する", () => {
      test("リクエストが存在しない", async () => {
        mockMkAcceptTransaction.mockReturnValueOnce(
          err({ type: "REQUEST_NOT_FOUND", requestId: "req:1" }) satisfies ReturnErr<
            SoundcloudRegistrationRequestService["mkAcceptTransaction"]
          >,
        );

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
            sourceIds: ["1469143378"],
            requestId: null,
          },
          "1",
        )) as ReturnOk<typeof service.register>;

        expect(isErr(actual)).toBe(true);
        expect((actual as unknown as ReturnErr<typeof service.register>).error).toEqual({
          type: "REQUEST_NOT_FOUND",
          requestId: "req:1",
        } satisfies ReturnErr<typeof service.register>["error"]);
      });

      test("リクエストはチェック済み", async () => {
        mockMkAcceptTransaction.mockReturnValueOnce(
          err({ type: "REQUEST_ALREADY_CHECKED", requestId: "req:1" }) satisfies ReturnErr<
            SoundcloudRegistrationRequestService["mkAcceptTransaction"]
          >,
        );

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
            sourceIds: ["1469143378"],
            requestId: null,
          },
          "1",
        )) as ReturnOk<typeof service.register>;

        expect(isErr(actual)).toBe(true);
        expect((actual as unknown as ReturnErr<typeof service.register>).error).toEqual({
          type: "REQUEST_ALREADY_CHECKED",
          requestId: "req:1",
        } satisfies ReturnErr<typeof service.register>["error"]);
      });

      test("正常系", async () => {
        mockMkAcceptTransaction.mockReturnValueOnce(
          ok([]) satisfies ReturnOk<SoundcloudRegistrationRequestService["mkAcceptTransaction"]>,
        );

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
            sourceIds: ["1469143378"],
            requestId: null,
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

        const sources = await prisma.soundcloudVideoSource.findMany({ where: { videoId: actual.data.id } });
        expect(sources).toHaveLength(1);

        // TODO: requestのtest

        expect(clearAllTimeline).toBeCalled();
        expect(registerNeo4jVideoTags).toBeCalled();
      });
    });
  });
});
