import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { CategoryTagType } from "@prisma/client";
import { GraphQLError } from "graphql";
import { z } from "zod";

import { AbstractGroupingDTO } from "../AbstractGroup/AbstractGrouping.dto.js";
import { cursorOptions } from "../resolvers/connection.js";
import { Resolvers, TagResolvers, TagType as GqlTagType } from "../resolvers/graphql.js";
import { buildGqlId, parseGqlID } from "../resolvers/id.js";
import { parseOrderBy } from "../resolvers/parseSortOrder.js";
import { ResolverDeps } from "../resolvers/types.js";
import { isErr } from "../utils/Result.js";
import { VideoTagConnectionDTO } from "../Video/dto.js";
import { TagDTO, TagEventDTO, TagNameDTO, TagParentConnectionDTO } from "./dto.js";

export const resolverChildren = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (
    { id: tagId, isCategoryTag },
    { orderBy: unparsedOrderBy, ...unparsedConnectionArgs },
    { currentUser: ctxUser },
    info,
  ) => {
    const connectionArgs = z
      .union(
        isCategoryTag
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
          where: { parentId: tagId },
          orderBy: orderBy.data,
        }),
      () =>
        prisma.tagParent.count({
          where: { parentId: tagId },
        }),
      connectionArgs.data,
      { resolveInfo: info, ...cursorOptions },
    ).then((c) => TagParentConnectionDTO.fromPrisma(c));
  }) satisfies TagResolvers["children"];

export const resolverParents = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (
    { id: tagId },
    { orderBy: unparsedOrderBy, categoryTag, ...unparsedConnectionArgs },
    { currentUser: ctxUser },
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
            parent: { isCategoryTag: categoryTag?.valueOf() },
          },
          orderBy: orderBy.data,
        }),
      () =>
        prisma.tagParent.count({
          where: {
            childId: tagId,
            parent: { isCategoryTag: categoryTag?.valueOf() },
          },
        }),
      connectionArgs.data,
      { resolveInfo: info, ...cursorOptions },
    ).then((c) => TagParentConnectionDTO.fromPrisma(c));
  }) satisfies TagResolvers["parents"];

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

export const resolveTagType = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async ({ id: tagId, isCategoryTag }) => {
    if (isCategoryTag) return GqlTagType.Category;

    const typings = await prisma.tagParent
      .findMany({
        where: { childId: tagId, parent: { isCategoryTag: true } },
        select: { parent: { select: { categoryType: { select: { type: true } } } } },
      })
      .then((t) =>
        t.map(({ parent: { categoryType } }) => categoryType?.type).filter((t): t is CategoryTagType => !!t),
      );

    if (1 < typings.length) return GqlTagType.Subtle;
    if (0 === typings.length) return GqlTagType.Unknown;
    switch (typings[0]) {
      case CategoryTagType.MUSIC:
        return GqlTagType.Music;
      case CategoryTagType.COPYRIGHT:
        return GqlTagType.Copyright;
      case CategoryTagType.CHARACTER:
        return GqlTagType.Character;
      case CategoryTagType.PHRASE:
        return GqlTagType.Phrase;
      case CategoryTagType.SERIES:
        return GqlTagType.Series;
      case CategoryTagType.TACTICS:
        return GqlTagType.Tactics;
      case CategoryTagType.STYLE:
        return GqlTagType.Style;
      case CategoryTagType.EVENT:
        return GqlTagType.Event;
      default:
        return GqlTagType.Unknown;
    }
  }) satisfies TagResolvers["type"];

export const resolveTag = ({ prisma, logger, TagsService }: Pick<ResolverDeps, "prisma" | "logger" | "TagsService">) =>
  ({
    id: ({ id }): string => buildGqlId("Tag", id),
    type: resolveTagType({ prisma }),
    meaningless: ({ isCategoryTag: categoryTag }) => categoryTag,

    names: async ({ id: tagId }, { primary }) =>
      prisma.tagName
        .findMany({ where: { tag: { id: tagId }, isPrimary: primary?.valueOf() } })
        .then((v) => v.map((n) => new TagNameDTO(n))),
    name: async ({ id: tagId }) => {
      const name = await prisma.tagName.findFirst({ where: { tagId } });
      if (!name) throw new GraphQLError(`primary name for tag ${tagId} is not found`);
      return name.name;
    },

    parents: resolverParents({ prisma, logger }),

    explicitParent: async ({ id: tagId }) => {
      const rel = await prisma.tagParent.findFirst({
        where: { child: { id: tagId }, isExplicit: true },
        include: { parent: true },
      });
      if (!rel) return null;
      return new TagDTO(rel.parent);
    },
    children: resolverChildren({ prisma, logger }),

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
      const groupings = await prisma.abstractGrouping.findMany({ where: { tagId } });
      return groupings.length === 1 ? groupings[0].groupKeyword : null;
    },

    allBelongTo: async ({ id: tagId }) =>
      prisma.abstractGrouping
        .findMany({ where: { tagId } })
        .then((t) => t.map((tt) => AbstractGroupingDTO.fromPrisma(tt))),
  }) satisfies Resolvers["Tag"];
