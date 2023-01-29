import { MylistShareRange } from "@prisma/client";

import { buildGqlId, GraphQLNotExistsInDBError, parseGqlID } from "../../utils/id.js";
import { parsePrismaOrder } from "../../utils/parsePrismaOrder.js";
import { MylistShareRange as GQLMylistShareRange } from "../graphql.js";
import { Resolvers } from "../graphql.js";
import { ResolverDeps } from "../index.js";
import { MylistRegistrationModel } from "../MylistRegistration/model.js";
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
        where: { id: mylistId },
        orderBy: {
          createdAt: parsePrismaOrder(input.order?.createdAt),
          updatedAt: parsePrismaOrder(input.order?.updatedAt),
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
        .findFirst({
          where: {
            mylistId,
            videoId: parseGqlID("Video", videoId),
          },
        })
        .then((r) => !!r),

    recommendedVideos: resolveRecommendedVideos({ neo4j }),
    includeTags: resolveIncludeTags({ prisma }),
  } satisfies Resolvers["Mylist"]);
