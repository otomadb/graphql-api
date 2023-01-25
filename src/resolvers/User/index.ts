import { MylistShareRange } from "@prisma/client";
import { GraphQLError } from "graphql";

import { UserRole } from "../../db/entities/users.js";
import { MylistShareRange as GraphQLMylistShareRange, Resolvers } from "../../graphql.js";
import { buildGqlId, parseGqlID } from "../../utils/id.js";
import { ResolverDeps } from "../index.js";
import { MylistModel } from "../Mylist/model.js";
import { resolveUserLikes } from "./likes.js";

export const resolveUser = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    id: ({ id }): string => buildGqlId("Video", id),
    likes: resolveUserLikes({ prisma }),

    mylist: async ({ id: userId }, { id: gqlMylistId }, { user: authuser }) => {
      const mylist = await prisma.mylist.findFirst({ where: { id: parseGqlID("Mylist", gqlMylistId) } });

      if (!mylist) return null;
      if (mylist.shareRange === MylistShareRange.PRIVATE && authuser?.id !== userId) return null; // TODO: 現状ではnullを返すが何らかのエラー型のunionにしても良い気がする

      return new MylistModel(mylist);
    },

    mylists: async ({ id: userId }, { input }, { user: authuser }) => {
      if (input.range.includes(GraphQLMylistShareRange.Private) && userId !== authuser?.id)
        throw new GraphQLError(
          `Cannot list "${GraphQLMylistShareRange.Private}" mylists for "${buildGqlId("Video", userId)}"`
        );
      if (input.range.includes(GraphQLMylistShareRange.KnowLink) && userId !== authuser?.id)
        throw new GraphQLError(
          `Cannot list "${GraphQLMylistShareRange.KnowLink}" mylists for "${buildGqlId("Video", userId)}"`
        );

      const nodes = await prisma.mylist
        .findMany({
          where: {
            holder: { id: userId },
            shareRange: { in: input.range },
          },
          take: input.limit,
          skip: input.skip,
          orderBy: {
            // TODO: for Prisma
            createdAt: "asc",
            /*
            createdAt: input.order.createdAt || undefined,
            updatedAt: input.order.updatedAt || undefined,
            */
          },
        })
        .then((ms) => ms.map((m) => new MylistModel(m)));

      return { nodes };
    },

    isEditor: ({ role }) => role === UserRole.EDITOR || role === UserRole.ADMINISTRATOR,
    isAdministrator: ({ role }) => role === UserRole.ADMINISTRATOR,
  } satisfies Resolvers["User"]);
