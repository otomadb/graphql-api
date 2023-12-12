import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { MylistRegistration, MylistShareRange } from "@prisma/client";
import { GraphQLError } from "graphql";
import { Integer } from "neo4j-driver";
import z from "zod";

import { BilibiliMADSourceDTO } from "../BilibiliMADSource/BilibiliMADSource.dto.js";
import { NicovideoVideoSourceDTO } from "../NicovideoVideoSource/dto.js";
import { cursorOptions } from "../resolvers/connection.js";
import { Resolvers, VideoResolvers } from "../resolvers/graphql.js";
import { buildGqlId, parseGqlID } from "../resolvers/id.js";
import { MylistRegistrationModel } from "../resolvers/MylistRegistration/model.js";
import { parseOrderBy } from "../resolvers/parseSortOrder.js";
import { SemitagModel } from "../resolvers/Semitag/model.js";
import { ResolverDeps } from "../resolvers/types.js";
import { SoundcloudMADSourceDTO } from "../SoundcloudMADSource/SoundcloudMADSource.dto.js";
import { err, isErr, ok, Result } from "../utils/Result.js";
import { YoutubeVideoSourceDTO } from "../YoutubeVideoSource/dto.js";
import {
  VideoEventDTO,
  VideoSimilarityDTO,
  VideoTagConnectionDTO,
  VideoTagDTO,
  VideoThumbnailDTO,
  VideoTitleDTO,
} from "./dto.js";

export const resolveVideoIsLiked = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async ({ id: videoId }, _args, { currentUser }, info) => {
    const like = await findLike(prisma, { videoId, holderId: currentUser.id });
    if (isErr(like)) {
      switch (like.error.type) {
        case "UNKNOWN_ERROR":
          logger.error({ error: like.error.error, currentUser, path: info.path }, "Internal server error");
          throw new GraphQLError("Internal server error");
      }
    }
    if (!like.data) return false;
    return !like.data.isRemoved;
  }) satisfies VideoResolvers["isLiked"];

export const findLike = async (
  prisma: ResolverDeps["prisma"],
  { videoId, holderId }: { videoId: string; holderId: string },
): Promise<Result<{ type: "UNKNOWN_ERROR"; error: unknown }, MylistRegistration | null>> => {
  try {
    const likelist = await prisma.mylist.upsert({
      where: { holderId_slug: { holderId, slug: "likes" } },
      create: {
        holderId,
        slug: "likes",
        title: "likes",
        shareRange: MylistShareRange.PRIVATE,
      },
      update: {},
    });
    const registration = await prisma.mylistRegistration.findUnique({
      where: { mylistId_videoId: { mylistId: likelist.id, videoId } },
    });
    return ok(registration);
  } catch (error) {
    return err({ type: "UNKNOWN_ERROR", error });
  }
};

export const resolveVideoLike = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async ({ id: videoId }, _args, { currentUser }, info) => {
    const like = await findLike(prisma, { videoId, holderId: currentUser.id });
    if (isErr(like)) {
      switch (like.error.type) {
        case "UNKNOWN_ERROR":
          logger.error({ error: like.error.error, currentUser, path: info.path }, "Internal server error");
          throw new GraphQLError("Internal server error");
      }
    }
    return MylistRegistrationModel.fromPrismaNullable(like.data);
  }) satisfies VideoResolvers["like"];

export const resolveSimilarVideos = ({ neo4j, logger }: Pick<ResolverDeps, "logger" | "neo4j">) =>
  (async ({ id: videoId }, { input }, _context, info) => {
    const session = neo4j.session();

    try {
      const result = await session.run(
        `
        MATCH (v_from:Video {uid: $video_id})
        MATCH (v_from)<-[:TAGGED_TO]-(t:Tag)-[:TAGGED_TO]->(v_to)

        CALL {
            WITH t
            MATCH (t)-[:TAGGED_TO]->(vs_t:Video)
            RETURN 1.0 / (size(collect(vs_t)) - 1) AS t_importance
        }
        CALL {
            WITH v_to
            MATCH (v_to_ts:Tag)-[:TAGGED_TO]->(v_to)
            RETURN size(collect(v_to_ts)) AS v_to_ts_n
        }

        RETURN v_from.uid AS v_from, v_to.uid AS v_to, sum(t_importance / v_to_ts_n) AS score, collect(t.uid) AS ts
        ORDER BY score DESC
        LIMIT $limit
        `,
        { video_id: videoId, limit: Integer.fromNumber(input.limit) },
      );
      const items = result.records.map(
        (rec) =>
          new VideoSimilarityDTO({
            score: rec.get("score"),
            originId: rec.get("v_from"),
            toId: rec.get("v_to"),
          }),
      );
      return { items };
    } catch (error) {
      logger.error({ error, path: info.path }, "Failed to get similar video");
      throw new GraphQLError("Failed to get similar video");
    } finally {
      await session.close();
    }
  }) satisfies VideoResolvers["similarVideos"];

export const resolveTaggings = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async ({ id: videoId }, { orderBy: unparsedOrderBy, ...unparsedConnectionArgs }, { currentUser: ctxUser }, info) => {
    const connectionArgs = z
      .union([
        z.object({
          first: z.number(),
          after: z.string().optional(),
        }),
        z.object({
          last: z.number(),
          before: z.string().optional(),
        }),
        z.object({}), // 全てのVideoTagの取得を許容する
      ])
      .safeParse(unparsedConnectionArgs);
    if (!connectionArgs.success) {
      logger.error({ path: info.path, args: unparsedConnectionArgs }, "Wrong args");
      throw new GraphQLError("Wrong args");
    }

    const orderBy = parseOrderBy(unparsedOrderBy);
    if (isErr(orderBy)) {
      logger.error({ path: info.path, args: unparsedOrderBy }, "OrderBy args error");
      throw new GraphQLError("Wrong args");
    }

    return findManyCursorConnection(
      (args) =>
        prisma.videoTag.findMany({
          ...args,
          where: {
            videoId,
            isRemoved: false,
          },
          orderBy: orderBy.data,
        }),
      () =>
        prisma.videoTag.count({
          where: {
            videoId,
            isRemoved: false,
          },
        }),
      connectionArgs.data,
      { resolveInfo: info, ...cursorOptions },
    ).then((c) => VideoTagConnectionDTO.fromPrisma(c));
  }) satisfies VideoResolvers["taggings"];

export const resolveVideo = ({
  prisma,
  neo4j,
  logger,
  ImagesService,
  VideoService,
}: Pick<ResolverDeps, "prisma" | "neo4j" | "logger" | "ImagesService" | "VideoService">) =>
  ({
    id: ({ id }): string => buildGqlId("Video", id),

    title: async ({ id: videoId }) => {
      const title = await prisma.videoTitle.findFirst({ where: { videoId, isPrimary: true } });
      if (!title) throw new GraphQLError(`primary title for video ${videoId} is not found`);

      return title.title;
    },
    titles: async ({ id: videoId }) =>
      prisma.videoTitle.findMany({ where: { videoId } }).then((vs) => vs.map((t) => new VideoTitleDTO(t))),

    thumbnailUrl: async ({ id: videoId }, { size }) =>
      prisma.videoThumbnail
        .findFirstOrThrow({ where: { videoId, isPrimary: true } })
        .then((t) => ImagesService.proxyThis(t.imageUrl, size)),

    thumbnails: async ({ id: videoId }) =>
      prisma.videoThumbnail.findMany({ where: { videoId } }).then((vs) => vs.map((t) => new VideoThumbnailDTO(t))),

    taggings: resolveTaggings({ prisma, logger }),

    allTaggings: ({ id: videoId }) =>
      prisma.videoTag
        .findMany({ where: { videoId, isRemoved: false } })
        .then((vts) => vts.map((vt) => VideoTagDTO.fromPrisma(vt))),

    hasTag: async ({ id: videoId }, { id: tagGqlId }) =>
      prisma.videoTag
        .findUnique({ where: { videoId_tagId: { videoId, tagId: parseGqlID("Tag", tagGqlId) } } })
        .then((v) => !!v && !v.isRemoved),

    similarVideos: resolveSimilarVideos({ neo4j, logger }),

    nicovideoSources: async ({ id: videoId }) =>
      prisma.nicovideoVideoSource
        .findMany({ where: { videoId } })
        .then((ss) => ss.map((s) => new NicovideoVideoSourceDTO(s))),

    youtubeSources: async ({ id: videoId }) =>
      prisma.youtubeVideoSource
        .findMany({ where: { videoId } })
        .then((ss) => ss.map((s) => YoutubeVideoSourceDTO.fromPrisma(s))),

    soundcloudSources: async ({ id: videoId }) =>
      prisma.soundcloudVideoSource
        .findMany({ where: { videoId } })
        .then((ss) => ss.map((s) => SoundcloudMADSourceDTO.fromPrisma(s))),

    bilibiliSources: async ({ id: videoId }) =>
      prisma.bilibiliMADSource
        .findMany({ where: { videoId } })
        .then((ss) => ss.map((s) => BilibiliMADSourceDTO.fromPrisma(s))),

    semitags: ({ id: videoId }, { checked }) =>
      prisma.semitag
        .findMany({ where: { videoId, isChecked: checked?.valueOf() } })
        .then((semitags) => semitags.map((semitag) => SemitagModel.fromPrisma(semitag))),

    events: async ({ id: videoId }, { input }) => {
      const nodes = await prisma.videoEvent
        .findMany({
          where: { videoId },
          take: input.limit,
          skip: input.skip,
          orderBy: { id: "desc" },
        })
        .then((es) => es.map((e) => new VideoEventDTO(e)));
      return { nodes };
    },
    isLiked: async ({ id: videoId }, _args, { currentUser }) => {
      if (!currentUser) return null;
      const like = await VideoService.findLike({ videoId, holderId: currentUser.id });
      return !!like;
    },
    like: resolveVideoLike({ prisma, logger }),
  }) satisfies Resolvers["Video"];
