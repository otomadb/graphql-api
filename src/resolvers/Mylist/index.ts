import { MylistShareRange } from "@prisma/client";
import { GraphQLError } from "graphql";

import { isErr } from "../../utils/Result.js";
import { MylistShareRange as GQLMylistShareRange, Resolvers } from "../graphql.js";
import { buildGqlId, parseGqlID } from "../id.js";
import { MylistRegistrationModel } from "../MylistRegistration/model.js";
import { parseOrderBy } from "../parseSortOrder.js";
import { ResolverDeps } from "../types.js";
import { resolveIncludeTags } from "./includesTags.js";
import { resolveRecommendedVideos } from "./recommendedVideos.js";
import { resolverMylistRegistrations } from "./registrations/resolver.js";

export const resolveMylist = ({
  prisma,
  logger,
  neo4j,
  userService,
}: Pick<ResolverDeps, "prisma" | "neo4j" | "logger" | "userService">) =>
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

    isLikeList: ({ slug }) => slug === "likes",

    holder: async ({ holderId }) => userService.getById(holderId),
    registrations: resolverMylistRegistrations({ prisma, logger }),

    isIncludesVideo: async ({ id: mylistId }, { id: videoId }) =>
      prisma.mylistRegistration
        .findUnique({ where: { mylistId_videoId: { mylistId, videoId: parseGqlID("Video", videoId) } } })
        .then((r) => (r ? !r.isRemoved : false)),

    recommendedVideos: resolveRecommendedVideos({ neo4j }),
    includeTags: resolveIncludeTags({ prisma }),

    registrationsByOffset: async (
      { id: mylistId },
      { input: { offset, take, orderBy: unparsedOrderBy } },
      _ctx,
      info,
    ) => {
      const orderBy = parseOrderBy(unparsedOrderBy);
      if (isErr(orderBy)) {
        logger.error({ path: info.path, args: unparsedOrderBy }, "OrderBy args error");
        throw new GraphQLError("Wrong args");
      }

      const [count, nodes] = await prisma.$transaction([
        prisma.mylistRegistration.count({
          where: { mylistId, isRemoved: false },
        }),
        prisma.mylistRegistration.findMany({
          orderBy: orderBy.data,
          skip: offset,
          take,
          where: { mylistId, isRemoved: false },
        }),
      ]);
      return {
        hasMore: offset + take < count,
        totalCount: count,
        nodes: nodes.map((v) => MylistRegistrationModel.fromPrisma(v)),
      };
    },
  }) satisfies Resolvers["Mylist"];
