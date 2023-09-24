import { BilibiliMADSourceEventType } from "@prisma/client";

import { buildGqlId } from "../resolvers/id.js";
import { MkResolverWithInclude } from "../utils/MkResolver.js";

export const resolverBilibiliMADSourceCreateEvent: MkResolverWithInclude<
  "BilibiliMADSourceCreateEvent",
  "userService" | "BilibiliMADSourceService"
> = ({ userService, BilibiliMADSourceService }) => ({
  __isTypeOf: ({ type }) => type === BilibiliMADSourceEventType.CREATE,
  id: ({ id }) => buildGqlId("BilibiliMADSourceEvent", id),
  createdAt: ({ createdAt }) => createdAt,
  user: async ({ userId }) => userService.getById(userId),
  source: ({ sourceId }) => BilibiliMADSourceService.getBySourceIdOrThrow(sourceId),
  series: ({ id }) => id,
});
