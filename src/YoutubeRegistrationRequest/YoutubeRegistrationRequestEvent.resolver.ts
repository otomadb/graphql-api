import { MkResolver, MkResolverWithInclude } from "../utils/MkResolver.js";
import { YoutubeRegistrationRequestRequestEventDTO } from "./YoutubeRegistrationRequestEvent.dto.js";

export const mkYoutubeRegistrationRequestEventResolver: MkResolverWithInclude<
  "YoutubeRegistrationRequestEvent",
  "userService" | "YoutubeRegistrationRequestService" | "logger"
> = ({ logger, userService, YoutubeRegistrationRequestService }) => ({
  __resolveType: (v) => {
    if (v instanceof YoutubeRegistrationRequestRequestEventDTO) return "YoutubeRegistrationRequestRequestEvent";
    // if (v instanceof YoutubeRegistrationRequestAcceptedEventDTO) return "YoutubeRegistrationRequestRequestEvent";
    // if (v instanceof YoutubeRegistrationRequestRejectedEventDTO) return "YoutubeRegistrationRequestRejectedEvent";

    logger.error("Unknown type", { v });
    throw new Error("Unknown type");
  },
  id: ({ id }) => id.toString(),
  series: ({ series }) => series.toString(),
  createdAt: ({ createdAt }) => createdAt,
  user: ({ userId }) => userService.getById(userId),
  request: ({ requestId }) => YoutubeRegistrationRequestService.getByIdOrThrow(requestId),
});

export const mkYoutubeRegistrationRequestRequestEventResolver: MkResolver<
  "YoutubeRegistrationRequestRequestEvent",
  "userService" | "YoutubeRegistrationRequestService" | "logger"
> = mkYoutubeRegistrationRequestEventResolver;
