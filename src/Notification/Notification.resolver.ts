import { GraphQLError } from "graphql";
import z from "zod";

import { BilibiliRegistrationRequestAcceptingDTO } from "../BilibiliRegistrationRequest/BilibiliRegistrationRequestAccepting.dto.js";
import { BilibiliRegistrationRequestRejectingDTO } from "../BilibiliRegistrationRequest/BilibiliRegistrationRequestRejecting.dto.js";
import {
  NicovideoRegistrationRequestAcceptingDTO,
  NicovideoRegistrationRequestRejectingDTO,
} from "../NicovideoRegistrationRequest/dto.js";
import { buildGqlId } from "../resolvers/id.js";
import { SoundcloudRegistrationRequestAcceptingDTO } from "../SoundcloudRegistrationRequest/SoundcloudRegistrationRequestAccepting.dto.js";
import { SoundcloudRegistrationRequestRejectingDTO } from "../SoundcloudRegistrationRequest/SoundcloudRegistrationRequestRejecting.dto.js";
import { MkResolverWithInclude } from "../utils/MkResolver.js";
import { YoutubeRegistrationRequestAcceptingDTO } from "../YoutubeRegistrationRequest/YoutubeRegistrationRequestAccepting.dto.js";
import { YoutubeRegistrationRequestRejectingDTO } from "../YoutubeRegistrationRequest/YoutubeRegistrationRequestRejecting.dto.js";
import {
  BilibiliRegistrationRequestAcceptingNotificationDTO,
  NicovideoRegistrationRequestAcceptingNotificationDTO,
  NicovideoRegistrationRequestRejectingNotificationDTO,
  SoundcloudRegistrationRequestAcceptingNotificationDTO,
  SoundcloudRegistrationRequestRejectingNotificationDTO,
  YoutubeRegistrationRequestAcceptingNotificationDTO,
  YoutubeRegistrationRequestRejectingNotificationDTO,
} from "./Notification.dto.js";

export const mkBilibiliRegistrationRequestAcceptingNotificationResolver: MkResolverWithInclude<
  "BilibiliRegistrationRequestAcceptingNotification",
  "logger" | "prisma" | "userService"
> = ({ prisma, userService, logger }) => ({
  __isTypeOf: (v) => v instanceof BilibiliRegistrationRequestAcceptingNotificationDTO,
  id: ({ dbId }) => buildGqlId("Notification", dbId),
  notifyTo: ({ notifyToId: forId }) => userService.getById(forId),
  createdAt: ({ createdAt }) => createdAt,
  watched: ({ isWatched }) => isWatched,
  accepting: ({ dbId, payload }, _args, _ctx, info) => {
    const p = z.object({ id: z.string() }).safeParse(payload);
    if (!p.success) {
      logger.error(
        { error: p.error, path: info.path, notificationId: dbId, payload },
        "NotificationpPayload is not valid",
      );
      throw new GraphQLError("Something wrong happened");
    }
    return prisma.bilibiliRegistrationRequestChecking
      .findUniqueOrThrow({ where: { id: p.data.id } })
      .then((c) => BilibiliRegistrationRequestAcceptingDTO.fromPrisma(c))
      .catch((e) => {
        logger.error({ error: e, path: info.path, id: p.data.id }, "Accepting not found");
        throw new GraphQLError("Something wrong happened");
      });
  },
});

export const mkBilibiliRegistrationRequestRejectingNotificationResolver: MkResolverWithInclude<
  "BilibiliRegistrationRequestRejectingNotification",
  "logger" | "prisma" | "userService"
> = ({ prisma, logger, userService }) => ({
  __isTypeOf: (v) => v instanceof BilibiliRegistrationRequestAcceptingNotificationDTO,
  id: ({ dbId }) => buildGqlId("Notification", dbId),
  notifyTo: ({ notifyToId: forId }) => userService.getById(forId),
  createdAt: ({ createdAt }) => createdAt,
  watched: ({ isWatched }) => isWatched,
  rejecting: ({ dbId, payload }, _args, _ctx, info) => {
    const p = z.object({ id: z.string() }).safeParse(payload);
    if (!p.success) {
      logger.error(
        { error: p.error, path: info.path, notificationId: dbId, payload },
        "NotificationpPayload is not valid",
      );
      throw new GraphQLError("Something wrong happened");
    }
    return prisma.bilibiliRegistrationRequestChecking
      .findUniqueOrThrow({ where: { id: p.data.id } })
      .then((c) => BilibiliRegistrationRequestRejectingDTO.fromPrisma(c))
      .catch((e) => {
        logger.error({ error: e, path: info.path }, "Accepting not found");
        throw new GraphQLError("Something wrong happened");
      });
  },
});

export const mkNicovideoRegistrationRequestRejectingNotificationResolver: MkResolverWithInclude<
  "NicovideoRegistrationRequestRejectingNotification",
  "logger" | "prisma" | "userService"
> = ({ prisma, logger, userService }) => ({
  __isTypeOf: (v) => v instanceof NicovideoRegistrationRequestRejectingNotificationDTO,
  id: ({ dbId }) => buildGqlId("Notification", dbId),
  notifyTo: ({ notifyToId: forId }) => userService.getById(forId),
  createdAt: ({ createdAt }) => createdAt,
  watched: ({ isWatched }) => isWatched,
  rejecting: ({ dbId, payload }, _args, _ctx, info) => {
    const p = z.object({ id: z.string() }).safeParse(payload);
    if (!p.success) {
      logger.error(
        { error: p.error, path: info.path, notificationId: dbId, payload },
        "NotificationpPayload is not valid",
      );
      throw new GraphQLError("Something wrong happened");
    }
    return prisma.nicovideoRegistrationRequestChecking
      .findUniqueOrThrow({ where: { id: p.data.id } })
      .then((c) => NicovideoRegistrationRequestRejectingDTO.fromPrisma(c))
      .catch((e) => {
        logger.error({ error: e, path: info.path }, "Accepting not found");
        throw new GraphQLError("Something wrong happened");
      });
  },
});

export const mkNicovideoRegistrationRequestAcceptingNotificationResolver: MkResolverWithInclude<
  "NicovideoRegistrationRequestAcceptingNotification",
  "logger" | "prisma" | "userService"
> = ({ prisma, logger, userService }) => ({
  __isTypeOf: (v) => v instanceof NicovideoRegistrationRequestAcceptingNotificationDTO,
  id: ({ dbId }) => buildGqlId("Notification", dbId),
  notifyTo: ({ notifyToId: forId }) => userService.getById(forId),
  createdAt: ({ createdAt }) => createdAt,
  watched: ({ isWatched }) => isWatched,
  accepting: ({ dbId, payload }, _args, _ctx, info) => {
    const p = z.object({ id: z.string() }).safeParse(payload);
    if (!p.success) {
      logger.error(
        { error: p.error, path: info.path, notificationId: dbId, payload },
        "NotificationpPayload is not valid",
      );
      throw new GraphQLError("Something wrong happened");
    }
    return prisma.nicovideoRegistrationRequestChecking
      .findUniqueOrThrow({ where: { id: p.data.id } })
      .then((c) => NicovideoRegistrationRequestAcceptingDTO.fromPrisma(c))
      .catch((e) => {
        logger.error({ error: e, path: info.path, id: p.data.id }, "Accepting not found");
        throw new GraphQLError("Something wrong happened");
      });
  },
});

export const mkSoundcloudRegistrationRequestAcceptingNotificationResolver: MkResolverWithInclude<
  "SoundcloudRegistrationRequestAcceptingNotification",
  "logger" | "prisma" | "userService"
> = ({ prisma, userService, logger }) => ({
  __isTypeOf: (v) => v instanceof SoundcloudRegistrationRequestAcceptingNotificationDTO,
  id: ({ dbId }) => buildGqlId("Notification", dbId),
  notifyTo: ({ notifyToId: forId }) => userService.getById(forId),
  createdAt: ({ createdAt }) => createdAt,
  watched: ({ isWatched }) => isWatched,

  accepting: ({ dbId, payload }, _args, _ctx, info) => {
    const p = z.object({ id: z.string() }).safeParse(payload);
    if (!p.success) {
      logger.error(
        { error: p.error, path: info.path, notificationId: dbId, payload },
        "NotificationpPayload is not valid",
      );
      throw new GraphQLError("Something wrong happened");
    }
    return prisma.soundcloudRegistrationRequestChecking
      .findUniqueOrThrow({ where: { id: p.data.id } })
      .then((c) => SoundcloudRegistrationRequestAcceptingDTO.fromPrisma(c))
      .catch((e) => {
        logger.error({ error: e, path: info.path, id: p.data.id }, "Accepting not found");
        throw new GraphQLError("Something wrong happened");
      });
  },
});

export const mkSoundcloudRegistrationRequestRejectingNotificationResolver: MkResolverWithInclude<
  "SoundcloudRegistrationRequestRejectingNotification",
  "logger" | "prisma" | "userService"
> = ({ prisma, logger, userService }) => ({
  __isTypeOf: (v) => v instanceof SoundcloudRegistrationRequestRejectingNotificationDTO,
  id: ({ dbId }) => buildGqlId("Notification", dbId),
  notifyTo: ({ notifyToId: forId }) => userService.getById(forId),
  createdAt: ({ createdAt }) => createdAt,
  watched: ({ isWatched }) => isWatched,

  rejecting: ({ dbId, payload }, _args, _ctx, info) => {
    const p = z.object({ id: z.string() }).safeParse(payload);
    if (!p.success) {
      logger.error(
        { error: p.error, path: info.path, notificationId: dbId, payload },
        "NotificationpPayload is not valid",
      );
      throw new GraphQLError("Something wrong happened");
    }
    return prisma.soundcloudRegistrationRequestChecking
      .findUniqueOrThrow({ where: { id: p.data.id } })
      .then((c) => SoundcloudRegistrationRequestRejectingDTO.fromPrisma(c))
      .catch((e) => {
        logger.error({ error: e, path: info.path }, "Accepting not found");
        throw new GraphQLError("Something wrong happened");
      });
  },
});

export const mkYoutubeRegistrationRequestAcceptingNotificationResolver: MkResolverWithInclude<
  "YoutubeRegistrationRequestAcceptingNotification",
  "logger" | "prisma" | "userService"
> = ({ prisma, userService, logger }) => ({
  __isTypeOf: (v) => v instanceof YoutubeRegistrationRequestAcceptingNotificationDTO,
  id: ({ dbId }) => buildGqlId("Notification", dbId),
  notifyTo: ({ notifyToId: forId }) => userService.getById(forId),
  createdAt: ({ createdAt }) => createdAt,
  watched: ({ isWatched }) => isWatched,

  accepting: ({ dbId, payload }, _args, _ctx, info) => {
    const p = z.object({ id: z.string() }).safeParse(payload);
    if (!p.success) {
      logger.error(
        { error: p.error, path: info.path, notificationId: dbId, payload },
        "NotificationpPayload is not valid",
      );
      throw new GraphQLError("Something wrong happened");
    }
    return prisma.youtubeRegistrationRequestChecking
      .findUniqueOrThrow({ where: { id: p.data.id } })
      .then((c) => YoutubeRegistrationRequestAcceptingDTO.fromPrisma(c))
      .catch((e) => {
        logger.error({ error: e, path: info.path, id: p.data.id }, "Accepting not found");
        throw new GraphQLError("Something wrong happened");
      });
  },
});

export const mkYoutubeRegistrationRequestRejectingNotificationResolver: MkResolverWithInclude<
  "YoutubeRegistrationRequestRejectingNotification",
  "logger" | "prisma" | "userService"
> = ({ prisma, logger, userService }) => ({
  __isTypeOf: (v) => v instanceof YoutubeRegistrationRequestRejectingNotificationDTO,
  id: ({ dbId }) => buildGqlId("Notification", dbId),
  notifyTo: ({ notifyToId: forId }) => userService.getById(forId),
  createdAt: ({ createdAt }) => createdAt,
  watched: ({ isWatched }) => isWatched,

  rejecting: ({ dbId, payload }, _args, _ctx, info) => {
    const p = z.object({ id: z.string() }).safeParse(payload);
    if (!p.success) {
      logger.error(
        { error: p.error, path: info.path, notificationId: dbId, payload },
        "NotificationpPayload is not valid",
      );
      throw new GraphQLError("Something wrong happened");
    }
    return prisma.youtubeRegistrationRequestChecking
      .findUniqueOrThrow({ where: { id: p.data.id } })
      .then((c) => YoutubeRegistrationRequestRejectingDTO.fromPrisma(c))
      .catch((e) => {
        logger.error({ error: e, path: info.path }, "Accepting not found");
        throw new GraphQLError("Something wrong happened");
      });
  },
});
