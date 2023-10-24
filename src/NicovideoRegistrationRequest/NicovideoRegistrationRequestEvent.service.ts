import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { NicovideoRegistrationRequestEvent, PrismaClient } from "@prisma/client";
import { Logger } from "pino";

import { cursorOptions } from "../resolvers/connection.js";
import {
  NicovideoRegistrationRequestAcceptEventDTO,
  NicovideoRegistrationRequestRejectEventDTO,
  NicovideoRegistrationRequestRequestEventDTO,
} from "./NicovideoRegistrationRequestEvent.dto.js";
import { NicovideoRegistrationRequestEventConnectionDTO } from "./NicovideoRegistrationRequestEventConnection.dto.js";

export const mkNicovideoRegistrationRequestEventService = ({ prisma }: { prisma: PrismaClient; logger: Logger }) => {
  return {
    switchit(v: NicovideoRegistrationRequestEvent) {
      switch (v.type) {
        case "REQUEST":
          return new NicovideoRegistrationRequestRequestEventDTO(v);
        case "ACCEPT":
          return new NicovideoRegistrationRequestAcceptEventDTO(v);
        case "REJECT":
          return new NicovideoRegistrationRequestRejectEventDTO(v);
      }
    },
    getByIdOrThrow(id: string) {
      return prisma.nicovideoRegistrationRequestEvent
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
    ): Promise<NicovideoRegistrationRequestEventConnectionDTO> {
      return findManyCursorConnection(
        (args) =>
          prisma.nicovideoRegistrationRequestEvent.findMany({
            ...args,
            where: { requestId: id },
            orderBy,
          }),
        () => prisma.nicovideoRegistrationRequestEvent.count({ where: { requestId: id } }),
        args,
        { ...cursorOptions },
      ).then((c) => NicovideoRegistrationRequestEventConnectionDTO.fromPrisma(c));
    },
  };
};

export type NicovideoRegistrationRequestEventService = ReturnType<typeof mkNicovideoRegistrationRequestEventService>;
