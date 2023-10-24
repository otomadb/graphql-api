import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { PrismaClient, YoutubeRegistrationRequestEvent } from "@prisma/client";
import { Logger } from "pino";

import { cursorOptions } from "../resolvers/connection.js";
import {
  YoutubeRegistrationRequestAcceptEventDTO,
  YoutubeRegistrationRequestRejectEventDTO,
  YoutubeRegistrationRequestRequestEventDTO,
} from "./YoutubeRegistrationRequestEvent.dto.js";
import { YoutubeRegistrationRequestEventConnectionDTO } from "./YoutubeRegistrationRequestEventConnection.dto.js";

export const mkYoutubeRegistrationRequestEventService = ({ prisma }: { prisma: PrismaClient; logger: Logger }) => {
  return {
    switchit(v: YoutubeRegistrationRequestEvent) {
      switch (v.type) {
        case "REQUEST":
          return new YoutubeRegistrationRequestRequestEventDTO(v);
        case "ACCEPT":
          return new YoutubeRegistrationRequestAcceptEventDTO(v);
        case "REJECT":
          return new YoutubeRegistrationRequestRejectEventDTO(v);
      }
    },
    getByIdOrThrow(id: string) {
      return prisma.youtubeRegistrationRequestEvent.findUniqueOrThrow({ where: { id } }).then((v) => this.switchit(v));
    },
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
  };
};

export type YoutubeRegistrationRequestEventService = ReturnType<typeof mkYoutubeRegistrationRequestEventService>;
