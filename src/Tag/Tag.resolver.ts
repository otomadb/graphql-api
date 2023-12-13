import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { GraphQLError } from "graphql";
import { z } from "zod";

import { AbstractGroupDTO } from "../AbstractGroup/AbstractGroup.dto.js";
import { AbstractGroupingDTO } from "../AbstractGroup/AbstractGrouping.dto.js";
import { cursorOptions } from "../resolvers/connection.js";
import { Resolvers, TagResolvers } from "../resolvers/graphql.js";
import { buildGqlId, parseGqlID } from "../resolvers/id.js";
import { parseOrderBy } from "../resolvers/parseSortOrder.js";
import { ResolverDeps } from "../resolvers/types.js";
import { isErr } from "../utils/Result.js";
import { VideoTagConnectionDTO } from "../Video/dto.js";
import { TagDTO, TagEventDTO, TagNameDTO, TagParentConnectionDTO } from "./dto.js";

export const resolveTaggedVideos = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async ({ id: tagId }, { orderBy: unparsedOrderBy, ...unparsedConnectionArgs }, { currentUser: ctxUser }, info) => {
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
          where: { tagId },
          orderBy: orderBy.data,
        }),
      () => prisma.videoTag.count({ where: { tagId } }),
      connectionArgs.data,
      { resolveInfo: info, ...cursorOptions },
    ).then((c) => VideoTagConnectionDTO.fromPrisma(c));
  }) satisfies TagResolvers["taggedVideos"];

export const resolveTag = ({ prisma, logger, TagsService }: Pick<ResolverDeps, "prisma" | "logger" | "TagsService">) =>
  ({
    id: ({ id }): string => buildGqlId("Tag", id),

    names: async ({ id: tagId }, { primary }) =>
      prisma.tagName
        .findMany({ where: { tag: { id: tagId }, isPrimary: primary?.valueOf() } })
        .then((v) => v.map((n) => new TagNameDTO(n))),

    name: async ({ id: tagId }) => {
      const name = await prisma.tagName.findFirst({
        where: {
          tagId,
          isPrimary: true,
        },
      });
      if (!name) throw new GraphQLError(`primary name for tag ${tagId} is not found`);
      return name.name;
    },

    explicitParent: async ({ id: tagId }) => {
      const rel = await prisma.tagParent.findFirst({
        where: { child: { id: tagId }, isExplicit: true },
        include: { parent: true },
      });
      if (!rel) return null;
      return new TagDTO(rel.parent);
    },

    parents: async (
      { id: tagId },
      { orderBy: unparsedOrderBy, categoryTag, ...unparsedConnectionArgs },
      _ctx,
      info,
    ) => {
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
          z.object({}), // 全取得を許容
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
          prisma.tagParent.findMany({
            ...args,
            where: {
              childId: tagId,
              parent: { disabled: categoryTag?.valueOf() },
              disabled: false,
            },
            orderBy: orderBy.data,
          }),
        () =>
          prisma.tagParent.count({
            where: {
              childId: tagId,
              parent: { disabled: categoryTag?.valueOf() },
              disabled: false,
            },
          }),
        connectionArgs.data,
        { resolveInfo: info, ...cursorOptions },
      ).then((c) => TagParentConnectionDTO.fromPrisma(c));
    },

    children: async ({ id: tagId, disabled }, { orderBy: unparsedOrderBy, ...unparsedConnectionArgs }, _ctx, info) => {
      const connectionArgs = z
        .union(
          disabled
            ? [
                z.object({ first: z.number(), after: z.string().optional() }),
                z.object({ last: z.number(), before: z.string().optional() }),
              ]
            : [
                z.object({ first: z.number(), after: z.string().optional() }),
                z.object({ last: z.number(), before: z.string().optional() }),
                z.object({}), // カテゴリータグでない場合は全取得を許容
              ],
        )
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
          prisma.tagParent.findMany({
            ...args,
            where: { parentId: tagId, disabled: false },
            orderBy: orderBy.data,
          }),
        () =>
          prisma.tagParent.count({
            where: { parentId: tagId, disabled: false },
          }),
        connectionArgs.data,
        { resolveInfo: info, ...cursorOptions },
      ).then((c) => TagParentConnectionDTO.fromPrisma(c));
    },

    totalTaggedVideos: ({ id: tagId }) => TagsService.totalTaggedVideos(tagId),

    taggedVideos: resolveTaggedVideos({ prisma, logger }),

    taggedVideosByOffset: async ({ id: tagId }, { input: { offset, take, orderBy: unparsedOrderBy } }, _ctx, info) => {
      const orderBy = parseOrderBy(unparsedOrderBy);
      if (isErr(orderBy)) {
        logger.error({ path: info.path, args: unparsedOrderBy }, "OrderBy args error");
        throw new GraphQLError("Wrong args");
      }

      const { hasMore, nodes, totalCount } = await TagsService.taggedVideosByOffset(tagId, {
        offset,
        take,
        orderBy: orderBy.data,
      });
      return { hasMore, nodes, totalCount };
    },

    canTagTo: async ({ id: tagId }, { videoId: videoGqlId }) =>
      prisma.videoTag
        .findUnique({ where: { videoId_tagId: { tagId, videoId: parseGqlID("Video", videoGqlId) } } })
        .then((v) => !v || v.isRemoved),

    events: async ({ id: tagId }, { input }) => {
      const nodes = await prisma.tagEvent
        .findMany({
          where: { tagId },
          take: input.limit,
          skip: input.skip,
          orderBy: { id: "desc" },
        })
        .then((es) => es.map((e) => new TagEventDTO(e)));
      return { nodes };
    },

    belongTo: async ({ id: tagId }) => {
      const groupings = await prisma.abstractGrouping.findMany({ where: { tagId }, include: { group: true } });
      return groupings.length === 1 ? AbstractGroupDTO.fromPrisma(groupings[0].group) : null;
    },

    allBelongTo: async ({ id: tagId }) =>
      prisma.abstractGrouping
        .findMany({ where: { tagId } })
        .then((t) => t.map((tt) => AbstractGroupingDTO.fromPrisma(tt))),
  }) satisfies Resolvers["Tag"];
