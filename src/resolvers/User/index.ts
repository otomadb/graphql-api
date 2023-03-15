import { MylistShareRange, UserRole } from "@prisma/client";

import { Resolvers } from "../graphql.js";
import { buildGqlId, parseGqlID } from "../id.js";
import { MylistModel } from "../Mylist/model.js";
import { ResolverDeps } from "../types.js";
import { resolverUserLikes } from "./likes/resolver.js";
import { resolverUserMylists } from "./mylists/resolver.js";

export const resolveUser = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  ({
    id: ({ id }): string => buildGqlId("User", id),
    likes: resolverUserLikes({ prisma }),

    mylist: async ({ id: userId }, { id: gqlMylistId }, { user: ctxUser }) => {
      const mylist = await prisma.mylist.findFirst({ where: { id: parseGqlID("Mylist", gqlMylistId) } });

      if (!mylist) return null;
      if (mylist.shareRange === MylistShareRange.PRIVATE && ctxUser?.id !== userId) return null; // TODO: 現状ではnullを返すが何らかのエラー型のunionにしても良い気がする

      return new MylistModel(mylist);
    },

    mylists: resolverUserMylists({ prisma, logger }),

    isEditor: ({ role }) => role === UserRole.EDITOR || role === UserRole.ADMINISTRATOR,
    isAdministrator: ({ role }) => role === UserRole.ADMINISTRATOR,
  } satisfies Resolvers["User"]);
