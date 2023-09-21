import { BilibiliMADSourceEventType } from "@prisma/client";

import { buildGqlId } from "../resolvers/id.js";
import { MkResolverWithInclude } from "../utils/MkResolver.js";
import { BilibiliMADSourceDTO } from "./BilibiliMADSource.dto.js";

export const resolverBilibiliMADSourceCreateEvent: MkResolverWithInclude<
  "BilibiliMADSourceCreateEvent",
  "prisma" | "userService"
> = (deps) => ({
  __isTypeOf: ({ type }) => type === BilibiliMADSourceEventType.CREATE,
  id: ({ id }) => buildGqlId("BilibiliMADSourceEvent", id),
  createdAt: ({ createdAt }) => createdAt,
  user: async ({ userId }) => deps.userService.getById(userId),
  source: ({ sourceId }) => BilibiliMADSourceDTO.getById(deps.prisma, sourceId),
  series: ({ id }) => id,
});
