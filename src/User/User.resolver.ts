import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { Mylist, MylistShareRange } from "@prisma/client";
import { GraphQLError } from "graphql";
import z from "zod";

import { NicovideoRegistrationRequestConnectionDTO } from "../NicovideoRegistrationRequest/dto.js";
import { cursorOptions } from "../resolvers/connection.js";
import { MylistShareRange as GqlMylistShareRange, Resolvers, UserResolvers, UserRole } from "../resolvers/graphql.js";
import { buildGqlId, parseGqlID } from "../resolvers/id.js";
import { MylistModel } from "../resolvers/Mylist/model.js";
import { MylistConnectionModel } from "../resolvers/MylistConnection/model.js";
import { parseOrderBy } from "../resolvers/parseSortOrder.js";
import { ResolverDeps } from "../resolvers/types.js";
import { err, isErr, ok, Result } from "../utils/Result.js";

export const resolverUserHasRole = ({ userService }: Pick<ResolverDeps, "userService">) =>
  (async ({ id: userId }, { role }) => {
    switch (role) {
      case UserRole.Admin:
        return userService.hasRole(userId, "ADMIN");
      case UserRole.Editor:
        return userService.hasRole(userId, "EDITOR");
    }
  }) satisfies UserResolvers["hasRole"];

export const get = async (
  prisma: ResolverDeps["prisma"],
  { holderId, currentUserId }: { holderId: string; currentUserId: string | null }
): Promise<
  Result<
    | { type: "INTERNAL_SERVER_ERROR"; error: unknown; holderId: string; currentUserId: string | null }
    | { type: "PRIVATE_MYLIST_NOT_AUTH"; mylistId: string }
    | { type: "PRIVATE_MYLIST_WRONG_HOLDER"; mylistId: string; currentUserId: string },
    Mylist
  >
> => {
  try {
    const mylist = await prisma.mylist.upsert({
      where: { holderId_slug: { holderId, slug: "likes" } },
      create: {
        holderId,
        slug: "likes",
        title: "likes",
        shareRange: MylistShareRange.PRIVATE,
      },
      update: {},
    });

    switch (mylist.shareRange) {
      case MylistShareRange.PUBLIC:
        return ok(mylist);
      case MylistShareRange.KNOW_LINK:
      case MylistShareRange.PRIVATE:
        if (!currentUserId) return err({ type: "PRIVATE_MYLIST_NOT_AUTH", mylistId: mylist.id });
        if (mylist.holderId !== currentUserId)
          return err({ type: "PRIVATE_MYLIST_WRONG_HOLDER", mylistId: mylist.id, currentUserId });
        return ok(mylist);
    }
  } catch (error) {
    return err({ type: "INTERNAL_SERVER_ERROR", error, currentUserId, holderId });
  }
};

export const resolverUserLikes = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async ({ id: userId }, _args, { currentUser }, info) => {
    const result = await get(prisma, { holderId: userId, currentUserId: currentUser?.id || null });

    if (isErr(result))
      switch (result.error.type) {
        case "INTERNAL_SERVER_ERROR":
          logger.error(
            {
              path: info.path,
              error: result.error.error,
              holderId: result.error.holderId,
              currentUserId: result.error.currentUserId,
            },
            "Internal server error"
          );
          throw new GraphQLError("Internal server error");
        case "PRIVATE_MYLIST_NOT_AUTH":
          logger.warn({ path: info.path, mylistId: result.error.mylistId }, "Not authenticated");
          return null;
        case "PRIVATE_MYLIST_WRONG_HOLDER":
          logger.warn(
            { path: info.path, mylistId: result.error.mylistId, currentUserId: result.error.currentUserId },
            "Wrong holder"
          );
          return null;
      }

    return MylistModel.fromPrisma(result.data);
  }) satisfies UserResolvers["likes"];

export const resolverUserMylists = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (
    { id: userId },
    { orderBy: unparsedOrderBy, range, ...unparsedConnectionArgs },
    { currentUser: ctxUser },
    info
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
        z.object({}), // 全てのMylistの取得を許容する
      ])
      .safeParse(unparsedConnectionArgs);
    if (!connectionArgs.success) {
      logger.error({ path: info.path, args: unparsedConnectionArgs }, "Wrong args");
      throw new GraphQLError("Wrong args");
    }

    const shareRange: MylistShareRange[] = [
      ...(range.includes(GqlMylistShareRange.Public) ? [MylistShareRange.PUBLIC] : []),
      ...(range.includes(GqlMylistShareRange.KnowLink) ? [MylistShareRange.KNOW_LINK] : []),
      ...(range.includes(GqlMylistShareRange.Private) ? [MylistShareRange.PRIVATE] : []),
    ];

    const orderBy = parseOrderBy(unparsedOrderBy);
    if (isErr(orderBy)) {
      logger.error({ path: info.path, args: unparsedOrderBy }, "OrderBy args error");
      throw new GraphQLError("Wrong args");
    }

    return findManyCursorConnection(
      (args) =>
        prisma.mylist.findMany({
          ...args,
          where: { holderId: userId, shareRange: { in: shareRange } },
          orderBy: orderBy.data,
        }),
      () =>
        prisma.mylist.count({
          where: { holderId: userId, shareRange: { in: shareRange } },
        }),
      connectionArgs.data,
      { resolveInfo: info, ...cursorOptions }
    ).then((c) => MylistConnectionModel.fromPrisma(c));
  }) satisfies UserResolvers["mylists"];

export const resolverUserNicovideoRegistrationRequests = ({
  prisma,
  logger,
}: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async ({ id: userId }, { orderBy: unparsedOrderBy, ...unparsedConnectionArgs }, { currentUser: ctxUser }, info) => {
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
        prisma.nicovideoRegistrationRequest.findMany({
          ...args,
          where: { requestedById: userId },
          orderBy: orderBy.data,
        }),
      () =>
        prisma.nicovideoRegistrationRequest.count({
          where: { requestedById: userId },
        }),
      connectionArgs.data,
      { resolveInfo: info, ...cursorOptions }
    ).then((c) => NicovideoRegistrationRequestConnectionDTO.fromPrisma(c));
  }) satisfies UserResolvers["nicovideoRegistrationRequests"];

export const resolveUser = ({ prisma, logger, userService }: Pick<ResolverDeps, "prisma" | "logger" | "userService">) =>
  ({
    id: ({ id }): string => buildGqlId("User", id),
    likes: resolverUserLikes({ prisma, logger }),
    nicovideoRegistrationRequests: resolverUserNicovideoRegistrationRequests({ prisma, logger }),

    mylist: async ({ id: userId }, { id: gqlMylistId }, { currentUser: ctxUser }) => {
      const mylist = await prisma.mylist.findFirst({ where: { id: parseGqlID("Mylist", gqlMylistId) } });

      if (!mylist) return null;
      if (mylist.shareRange === MylistShareRange.PRIVATE && ctxUser?.id !== userId) return null; // TODO: 現状ではnullを返すが何らかのエラー型のunionにしても良い気がする

      return new MylistModel(mylist);
    },

    mylists: resolverUserMylists({ prisma, logger }),

    isEditor: () => false,
    isAdministrator: () => false,

    hasRole: resolverUserHasRole({ userService }),
  } satisfies Resolvers["User"]);