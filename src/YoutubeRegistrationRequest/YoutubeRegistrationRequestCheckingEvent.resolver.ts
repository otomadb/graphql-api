import { GraphQLError } from "graphql";

import { MkResolver, MkResolverWithInclude } from "../utils/MkResolver.js";
import { YoutubeRegistrationRequestCheckingDTO } from "./YoutubeRegistrationRequestChecking.dto.js";
import {
  YoutubeRegistrationRequestAcceptedEventDTO,
  YoutubeRegistrationRequestRejectedEventDTO,
  YoutubeRegistrationRequestResolvedEventDTO,
} from "./YoutubeRegistrationRequestCheckingEvent.dto.js";

export const mkYoutubeRegistrationRequestCheckingEventResolver: MkResolverWithInclude<
  "YoutubeRegistrationRequestCheckingEvent",
  "userService" | "prisma" | "logger"
> = ({ logger, userService, prisma }) => ({
  __resolveType: (v) => {
    if (v instanceof YoutubeRegistrationRequestAcceptedEventDTO) return "YoutubeRegistrationRequestAcceptedEvent";
    if (v instanceof YoutubeRegistrationRequestRejectedEventDTO) return "YoutubeRegistrationRequestRejectedEvent";
    if (v instanceof YoutubeRegistrationRequestResolvedEventDTO) return "YoutubeRegistrationRequestResolvedEvent";
    logger.error("Unknown type", { v });
    throw new Error("Unknown type");
  },
  id: ({ id }) => id.toString(),
  series: ({ series }) => series.toString(),
  createdAt: ({ createdAt }) => createdAt,
  user: ({ userId }) => userService.getById(userId),
  checking: ({ checkingId }) =>
    prisma.youtubeRegistrationRequestChecking
      .findUniqueOrThrow({ where: { id: checkingId } })
      .then((c) => YoutubeRegistrationRequestCheckingDTO.fromPrisma(c))
      .catch((e) => {
        logger.error({ error: e }, "Something wrong");
        throw new GraphQLError("Internal error");
      }),
});

export const mkYoutubeRegistrationRequestAcceptedEventResolver: MkResolver<
  "YoutubeRegistrationRequestAcceptedEvent",
  "userService" | "prisma" | "logger"
> = mkYoutubeRegistrationRequestCheckingEventResolver;

export const mkYoutubeRegistrationRequestRejectedEventResolver: MkResolver<
  "YoutubeRegistrationRequestRejectedEvent",
  "userService" | "prisma" | "logger"
> = mkYoutubeRegistrationRequestCheckingEventResolver;

export const mkYoutubeRegistrationRequestResolvedEventResolver: MkResolver<
  "YoutubeRegistrationRequestResolvedEvent",
  "userService" | "prisma" | "logger"
> = mkYoutubeRegistrationRequestCheckingEventResolver;
