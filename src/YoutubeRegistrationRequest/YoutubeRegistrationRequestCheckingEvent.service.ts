import { PrismaClient } from "@prisma/client";
import { Logger } from "pino";

import {
  YoutubeRegistrationRequestAcceptedEventDTO,
  YoutubeRegistrationRequestRejectedEventDTO,
  YoutubeRegistrationRequestResolvedEventDTO,
} from "./YoutubeRegistrationRequestCheckingEvent.dto.js";

export const mkYoutubeRegistrationRequestCheckingEventService = ({
  prisma,
}: {
  prisma: PrismaClient;
  logger: Logger;
}) => {
  return {
    createAcceptedEvent(checkingId: string): Promise<YoutubeRegistrationRequestAcceptedEventDTO> {
      return prisma.youtubeRegistrationRequestChecking.findUniqueOrThrow({ where: { id: checkingId } }).then(
        (req) =>
          new YoutubeRegistrationRequestAcceptedEventDTO({
            checkingId: req.id,
            createdAt: req.createdAt,
            firedBy: req.checkedById,
          }),
      );
    },
    createRejectedEvent(checkingId: string): Promise<YoutubeRegistrationRequestRejectedEventDTO> {
      return prisma.youtubeRegistrationRequestChecking.findUniqueOrThrow({ where: { id: checkingId } }).then(
        (req) =>
          new YoutubeRegistrationRequestRejectedEventDTO({
            checkingId: req.id,
            createdAt: req.createdAt,
            firedBy: req.checkedById,
          }),
      );
    },
    createResolvedEvent(checkingId: string): Promise<YoutubeRegistrationRequestResolvedEventDTO> {
      return prisma.youtubeRegistrationRequestChecking.findUniqueOrThrow({ where: { id: checkingId } }).then(
        (req) =>
          new YoutubeRegistrationRequestResolvedEventDTO({
            checkingId: req.id,
            createdAt: req.createdAt,
            firedBy: req.checkedById,
          }),
      );
    },
  };
};

export type YoutubeRegistrationRequestCheckingEventService = ReturnType<
  typeof mkYoutubeRegistrationRequestCheckingEventService
>;
