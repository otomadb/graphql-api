import { buildGqlId } from "../resolvers/id.js";
import { MkResolver, MkResolverWithInclude } from "../utils/MkResolver.js";
import {
  BilibiliRegistrationRequestAcceptEventDTO,
  BilibiliRegistrationRequestRejectEventDTO,
  BilibiliRegistrationRequestRequestEventDTO,
} from "./BilibiliRegistrationRequestEvent.dto.js";

export const mkBilibiliRegistrationRequestEventResolver: MkResolverWithInclude<
  "BilibiliRegistrationRequestEvent",
  "userService" | "BilibiliRegistrationRequestService" | "logger"
> = ({ logger, userService, BilibiliRegistrationRequestService }) => ({
  __resolveType: (v) => {
    if (v instanceof BilibiliRegistrationRequestRequestEventDTO) return "BilibiliRegistrationRequestRequestEvent";
    if (v instanceof BilibiliRegistrationRequestAcceptEventDTO) return "BilibiliRegistrationRequestAcceptEvent";
    if (v instanceof BilibiliRegistrationRequestRejectEventDTO) return "BilibiliRegistrationRequestRejectEvent";

    logger.error("Unknown type", { v });
    throw new Error("Unknown type");
  },
  id: ({ id }) => buildGqlId("BilibiliRegistrationRequestEvent", id),
  series: ({ id }) => id,
  createdAt: ({ createdAt }) => createdAt,
  user: ({ userId }) => userService.getById(userId),
  request: ({ requestId }) => BilibiliRegistrationRequestService.getByIdOrThrow(requestId),
});

export const mkBilibiliRegistrationRequestRequestEventResolver: MkResolver<
  "BilibiliRegistrationRequestRequestEvent",
  "userService" | "BilibiliRegistrationRequestService" | "logger"
> = mkBilibiliRegistrationRequestEventResolver;

export const mkBilibiliRegistrationRequestAcceptEventResolver: MkResolver<
  "BilibiliRegistrationRequestAcceptEvent",
  "userService" | "BilibiliRegistrationRequestService" | "logger"
> = mkBilibiliRegistrationRequestEventResolver;

export const mkBilibiliRegistrationRequestRejectEventResolver: MkResolver<
  "BilibiliRegistrationRequestRejectEvent",
  "userService" | "BilibiliRegistrationRequestService" | "logger"
> = mkBilibiliRegistrationRequestEventResolver;
