import { buildGqlId } from "../resolvers/id.js";
import { MkResolver, MkResolverWithInclude } from "../utils/MkResolver.js";
import {
  NicovideoRegistrationRequestAcceptEventDTO,
  NicovideoRegistrationRequestRejectEventDTO,
  NicovideoRegistrationRequestRequestEventDTO,
} from "./NicovideoRegistrationRequestEvent.dto.js";

export const mkNicovideoRegistrationRequestEventResolver: MkResolverWithInclude<
  "NicovideoRegistrationRequestEvent",
  "userService" | "NicovideoRegistrationRequestService" | "logger"
> = ({ logger, userService, NicovideoRegistrationRequestService }) => ({
  __resolveType: (v) => {
    if (v instanceof NicovideoRegistrationRequestRequestEventDTO) return "NicovideoRegistrationRequestRequestEvent";
    if (v instanceof NicovideoRegistrationRequestAcceptEventDTO) return "NicovideoRegistrationRequestAcceptEvent";
    if (v instanceof NicovideoRegistrationRequestRejectEventDTO) return "NicovideoRegistrationRequestRejectEvent";

    logger.error("Unknown type", { v });
    throw new Error("Unknown type");
  },
  id: ({ id }) => buildGqlId("NicovideoRegistrationRequestEvent", id),
  series: ({ id }) => id,
  createdAt: ({ createdAt }) => createdAt,
  user: ({ userId }) => userService.getById(userId),
  request: ({ requestId }) => NicovideoRegistrationRequestService.getByIdOrThrow(requestId),
});

export const mkNicovideoRegistrationRequestRequestEventResolver: MkResolver<
  "NicovideoRegistrationRequestRequestEvent",
  "userService" | "NicovideoRegistrationRequestService" | "logger"
> = mkNicovideoRegistrationRequestEventResolver;

export const mkNicovideoRegistrationRequestAcceptEventResolver: MkResolver<
  "NicovideoRegistrationRequestAcceptEvent",
  "userService" | "NicovideoRegistrationRequestService" | "logger"
> = mkNicovideoRegistrationRequestEventResolver;

export const mkNicovideoRegistrationRequestRejectEventResolver: MkResolver<
  "NicovideoRegistrationRequestRejectEvent",
  "userService" | "NicovideoRegistrationRequestService" | "logger"
> = mkNicovideoRegistrationRequestEventResolver;
