import { buildGqlId } from "../resolvers/id.js";
import { MkResolver, MkResolverWithInclude } from "../utils/MkResolver.js";
import {
  YoutubeRegistrationRequestAcceptEventDTO,
  YoutubeRegistrationRequestRejectEventDTO,
  YoutubeRegistrationRequestRequestEventDTO,
} from "./YoutubeRegistrationRequestEvent.dto.js";

export const mkYoutubeRegistrationRequestEventResolver: MkResolverWithInclude<
  "YoutubeRegistrationRequestEvent",
  "userService" | "YoutubeRegistrationRequestService" | "logger"
> = ({ logger, userService, YoutubeRegistrationRequestService }) => ({
  __resolveType: (v) => {
    if (v instanceof YoutubeRegistrationRequestRequestEventDTO) return "YoutubeRegistrationRequestRequestEvent";
    if (v instanceof YoutubeRegistrationRequestAcceptEventDTO) return "YoutubeRegistrationRequestAcceptEvent";
    if (v instanceof YoutubeRegistrationRequestRejectEventDTO) return "YoutubeRegistrationRequestRejectEvent";

    logger.error("Unknown type", { v });
    throw new Error("Unknown type");
  },
  id: ({ id }) => buildGqlId("YoutubeRegistrationRequestEvent", id),
  series: ({ id }) => id,
  createdAt: ({ createdAt }) => createdAt,
  user: ({ userId }) => userService.getById(userId),
  request: ({ requestId }) => YoutubeRegistrationRequestService.getByIdOrThrow(requestId),
});

export const mkYoutubeRegistrationRequestRequestEventResolver: MkResolver<
  "YoutubeRegistrationRequestRequestEvent",
  "userService" | "YoutubeRegistrationRequestService" | "logger"
> = mkYoutubeRegistrationRequestEventResolver;

export const mkYoutubeRegistrationRequestAcceptEventResolver: MkResolver<
  "YoutubeRegistrationRequestAcceptEvent",
  "userService" | "YoutubeRegistrationRequestService" | "logger"
> = mkYoutubeRegistrationRequestEventResolver;

export const mkYoutubeRegistrationRequestRejectEventResolver: MkResolver<
  "YoutubeRegistrationRequestRejectEvent",
  "userService" | "YoutubeRegistrationRequestService" | "logger"
> = mkYoutubeRegistrationRequestEventResolver;
