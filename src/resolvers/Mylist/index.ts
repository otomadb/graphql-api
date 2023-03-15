import { MylistShareRange } from "@prisma/client";

import { MylistShareRange as GQLMylistShareRange } from "../graphql.js";
import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError, parseGqlID } from "../id.js";
import { MylistRegistrationModel } from "../MylistRegistration/model.js";
import { parseSortOrder } from "../parseSortOrder.js";
import { ResolverDeps } from "../types.js";
import { UserModel } from "../User/model.js";
import { resolveIncludeTags } from "./includesTags.js";
import { resolveRecommendedVideos } from "./recommendedVideos.js";

export const resolveMylist = ({ prisma, neo4j }: Pick<ResolverDeps, "prisma" | "neo4j">) =>
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
    holder: async ({ holderId }) =>
      prisma.user
        .findUniqueOrThrow({ where: { id: holderId } })
        .then((v) => new UserModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("User", holderId);
        }),

    registrations: async ({ id: mylistId }, { input }) => {
      const regs = await prisma.mylistRegistration.findMany({
        where: { mylistId },
        orderBy: {
          createdAt: parseSortOrder(input.order?.createdAt),
          updatedAt: parseSortOrder(input.order?.updatedAt),
        },
        take: input.limit,
        skip: input.skip,
      });
      return {
        nodes: regs.map((reg) => new MylistRegistrationModel(reg)),
      };
    },

    isIncludesVideo: async ({ id: mylistId }, { id: videoId }) =>
      prisma.mylistRegistration
        .findUnique({ where: { mylistId_videoId: { mylistId, videoId: parseGqlID("Video", videoId) } } })
        .then((r) => (r ? !r.isRemoved : false)),

    recommendedVideos: resolveRecommendedVideos({ neo4j }),
    includeTags: resolveIncludeTags({ prisma }),
  } satisfies Resolvers["Mylist"]);
