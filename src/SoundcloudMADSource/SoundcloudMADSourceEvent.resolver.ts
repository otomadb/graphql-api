import { buildGqlId } from "../resolvers/id.js";
import { MkResolverWithInclude } from "../utils/MkResolver.js";

export const resolveSoundcloudMADSourceCreateEvent: MkResolverWithInclude<
  "SoundcloudMADSourceCreateEvent",
  "userService" | "SoundcloudMADSourceService"
> = ({ userService, SoundcloudMADSourceService }) => ({
  __isTypeOf: ({ type }) => type === "CREATE",
  id: ({ id }) => buildGqlId("SoundcloudMADSourceEvent", id),
  createdAt: ({ createdAt }) => createdAt,
  user: async ({ userId }) => userService.getById(userId),
  source: ({ sourceId }) => SoundcloudMADSourceService.getBySourceIdOrThrow(sourceId),
  series: ({ id }) => id,
});
