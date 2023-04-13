import { MylistShareRange } from "@prisma/client";

import { Resolvers } from "../graphql.js";
import { buildGqlId, parseGqlID } from "../id.js";
import { MylistModel } from "../Mylist/model.js";
import { ResolverDeps } from "../types.js";
import { resolverUserHasRole } from "./hasRole/resolver.js";
import { resolverUserLikes } from "./likes/resolver.js";
import { resolverUserMylists } from "./mylists/resolver.js";
import { resolverUserNicovideoRegistrationRequests } from "./nicovideoRegistrationRequests/resolver.js";

export const resolveUser = ({
  prisma,
  logger,
  userRepository,
}: Pick<ResolverDeps, "prisma" | "logger" | "userRepository">) =>
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

    hasRole: resolverUserHasRole({ userRepository }),
  } satisfies Resolvers["User"]);
