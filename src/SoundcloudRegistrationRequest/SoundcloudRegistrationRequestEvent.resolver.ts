import { buildGqlId } from "../resolvers/id.js";
import { MkResolver, MkResolverWithInclude } from "../utils/MkResolver.js";
import {
  SoundcloudRegistrationRequestAcceptEventDTO,
  SoundcloudRegistrationRequestRejectEventDTO,
  SoundcloudRegistrationRequestRequestEventDTO,
} from "./SoundcloudRegistrationRequestEvent.dto.js";

export const mkSoundcloudRegistrationRequestEventResolver: MkResolverWithInclude<
  "SoundcloudRegistrationRequestEvent",
  "userService" | "SoundcloudRegistrationRequestService" | "logger"
> = ({ logger, userService, SoundcloudRegistrationRequestService }) => ({
  __resolveType: (v) => {
    if (v instanceof SoundcloudRegistrationRequestRequestEventDTO) return "SoundcloudRegistrationRequestRequestEvent";
    if (v instanceof SoundcloudRegistrationRequestAcceptEventDTO) return "SoundcloudRegistrationRequestAcceptEvent";
    if (v instanceof SoundcloudRegistrationRequestRejectEventDTO) return "SoundcloudRegistrationRequestRejectEvent";

    logger.error("Unknown type", { v });
    throw new Error("Unknown type");
  },
  id: ({ id }) => buildGqlId("SoundcloudRegistrationRequestEvent", id),
  series: ({ id }) => id,
  createdAt: ({ createdAt }) => createdAt,
  user: ({ userId }) => userService.getById(userId),
  request: ({ requestId }) => SoundcloudRegistrationRequestService.getByIdOrThrow(requestId),
});

export const mkSoundcloudRegistrationRequestRequestEventResolver: MkResolver<
  "SoundcloudRegistrationRequestRequestEvent",
  "userService" | "SoundcloudRegistrationRequestService" | "logger"
> = mkSoundcloudRegistrationRequestEventResolver;

export const mkSoundcloudRegistrationRequestAcceptEventResolver: MkResolver<
  "SoundcloudRegistrationRequestAcceptEvent",
  "userService" | "SoundcloudRegistrationRequestService" | "logger"
> = mkSoundcloudRegistrationRequestEventResolver;

export const mkSoundcloudRegistrationRequestRejectEventResolver: MkResolver<
  "SoundcloudRegistrationRequestRejectEvent",
  "userService" | "SoundcloudRegistrationRequestService" | "logger"
> = mkSoundcloudRegistrationRequestEventResolver;
