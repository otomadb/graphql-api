import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { PrismaClient } from "@prisma/client";
import { Logger } from "pino";

import { cursorOptions } from "../resolvers/connection.js";
import { YoutubeRegistrationRequestRequestEventDTO } from "./YoutubeRegistrationRequestEvent.dto.js";
import { YoutubeRegistrationRequestEventConnectionDTO } from "./YoutubeRegistrationRequestEventConnection.dto.js";

export const mkYoutubeRegistrationRequestEventService = ({ prisma }: { prisma: PrismaClient; logger: Logger }) => {
  return {
    findConnection(
      id: string,
      args:
        | Record<string, never>
        | { first: number; after?: string | undefined }
        | { last: number; before?: string | undefined },
      orderBy: { createdAt: "asc" | "desc" },
    ): Promise<YoutubeRegistrationRequestEventConnectionDTO> {
      return findManyCursorConnection(
        (args) =>
          prisma.youtubeRegistrationRequestEvent.findMany({
            ...args,
            where: { requestId: id },
            orderBy,
          }),
        () => prisma.youtubeRegistrationRequestEvent.count({ where: { requestId: id } }),
        args,
        { ...cursorOptions },
      ).then((c) => YoutubeRegistrationRequestEventConnectionDTO.fromPrisma(c));
    },
    createRequestRequestEvent(requestId: string): Promise<YoutubeRegistrationRequestRequestEventDTO> {
      return prisma.youtubeRegistrationRequest.findUniqueOrThrow({ where: { id: requestId } }).then(
        (req) =>
          new YoutubeRegistrationRequestRequestEventDTO({
            requestId: req.id,
            createdAt: req.createdAt,
            firedBy: req.requestedById,
          }),
      );
    },
  };
};

export type YoutubeRegistrationRequestEventService = ReturnType<typeof mkYoutubeRegistrationRequestEventService>;
