import { MylistShareRange } from "@prisma/client";

import { MylistShareRange as GQLMylistShareRange, Resolvers } from "../graphql.js";
import { buildGqlId, parseGqlID } from "../id.js";
import { ResolverDeps } from "../types.js";
import { UserModel } from "../User/model.js";
import { resolveIncludeTags } from "./includesTags.js";
import { resolveRecommendedVideos } from "./recommendedVideos.js";
import { resolverMylistRegistrations } from "./registrations/resolver.js";

export const resolveMylist = ({
  prisma,
  neo4j,
  auth0Management,
  logger,
  cache,
}: Pick<ResolverDeps, "prisma" | "neo4j" | "logger" | "auth0Management" | "cache">) =>
  ({
    id: ({ id }) => buildGqlId("Mylist", id),
    range: ({ shareRange }) => {
      switch (shareRange) {
        case MylistShareRange.PUBLIC:
          return GQLMylistShareRange.Public;
        case MylistShareRange.KNOW_LINK:
          return GQLMylistShareRange.KnowLink;
        case MylistShareRange.PRIVATE:
          return GQLMylistShareRange.Private;
        default:
          throw new Error("Unknown Mylist Range");
      }
    },

    holder: async ({ holderId }) => UserModel.fromAuth0({ auth0Management, logger, cache }, holderId),
    registrations: resolverMylistRegistrations({ prisma, logger }),

    isIncludesVideo: async ({ id: mylistId }, { id: videoId }) =>
      prisma.mylistRegistration
        .findUnique({ where: { mylistId_videoId: { mylistId, videoId: parseGqlID("Video", videoId) } } })
        .then((r) => (r ? !r.isRemoved : false)),

    recommendedVideos: resolveRecommendedVideos({ neo4j }),
    includeTags: resolveIncludeTags({ prisma }),
  } satisfies Resolvers["Mylist"]);
