import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { PrismaClient, SoundcloudRegistrationRequestEvent } from "@prisma/client";
import { Logger } from "pino";

import { cursorOptions } from "../resolvers/connection.js";
import {
  SoundcloudRegistrationRequestAcceptEventDTO,
  SoundcloudRegistrationRequestRejectEventDTO,
  SoundcloudRegistrationRequestRequestEventDTO,
} from "./SoundcloudRegistrationRequestEvent.dto.js";
import { SoundcloudRegistrationRequestEventConnectionDTO } from "./SoundcloudRegistrationRequestEventConnection.dto.js";

export const mkSoundcloudRegistrationRequestEventService = ({ prisma }: { prisma: PrismaClient; logger: Logger }) => {
  return {
    switchit(v: SoundcloudRegistrationRequestEvent) {
      switch (v.type) {
        case "REQUEST":
          return new SoundcloudRegistrationRequestRequestEventDTO(v);
        case "ACCEPT":
          return new SoundcloudRegistrationRequestAcceptEventDTO(v);
        case "REJECT":
          return new SoundcloudRegistrationRequestRejectEventDTO(v);
      }
    },
    getByIdOrThrow(id: string) {
      return prisma.soundcloudRegistrationRequestEvent
        .findUniqueOrThrow({ where: { id } })
        .then((v) => this.switchit(v));
    },
    findConnection(
      id: string,
      args:
        | Record<string, never>
        | { first: number; after?: string | undefined }
        | { last: number; before?: string | undefined },
      orderBy: { createdAt: "asc" | "desc" },
    ): Promise<SoundcloudRegistrationRequestEventConnectionDTO> {
      return findManyCursorConnection(
        (args) =>
          prisma.soundcloudRegistrationRequestEvent.findMany({
            ...args,
            where: { requestId: id },
            orderBy,
          }),
        () => prisma.soundcloudRegistrationRequestEvent.count({ where: { requestId: id } }),
        args,
        { ...cursorOptions },
      ).then((c) => SoundcloudRegistrationRequestEventConnectionDTO.fromPrisma(c));
    },
  };
};

export type SoundcloudRegistrationRequestEventService = ReturnType<typeof mkSoundcloudRegistrationRequestEventService>;
