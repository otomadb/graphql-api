import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { BilibiliRegistrationRequestEvent, PrismaClient } from "@prisma/client";
import { Logger } from "pino";

import { cursorOptions } from "../resolvers/connection.js";
import {
  BilibiliRegistrationRequestAcceptEventDTO,
  BilibiliRegistrationRequestRejectEventDTO,
  BilibiliRegistrationRequestRequestEventDTO,
} from "./BilibiliRegistrationRequestEvent.dto.js";
import { BilibiliRegistrationRequestEventConnectionDTO } from "./BilibiliRegistrationRequestEventConnection.dto.js";

export const mkBilibiliRegistrationRequestEventService = ({ prisma }: { prisma: PrismaClient; logger: Logger }) => {
  return {
    switchit(v: BilibiliRegistrationRequestEvent) {
      switch (v.type) {
        case "REQUEST":
          return new BilibiliRegistrationRequestRequestEventDTO(v);
        case "ACCEPT":
          return new BilibiliRegistrationRequestAcceptEventDTO(v);
        case "REJECT":
          return new BilibiliRegistrationRequestRejectEventDTO(v);
      }
    },
    getByIdOrThrow(id: string) {
      return prisma.bilibiliRegistrationRequestEvent.findUniqueOrThrow({ where: { id } }).then((v) => this.switchit(v));
    },
    findConnection(
      id: string,
      args:
        | Record<string, never>
        | { first: number; after?: string | undefined }
        | { last: number; before?: string | undefined },
      orderBy: { createdAt: "asc" | "desc" },
    ): Promise<BilibiliRegistrationRequestEventConnectionDTO> {
      return findManyCursorConnection(
        (args) =>
          prisma.bilibiliRegistrationRequestEvent.findMany({
            ...args,
            where: { requestId: id },
            orderBy,
          }),
        () => prisma.bilibiliRegistrationRequestEvent.count({ where: { requestId: id } }),
        args,
        { ...cursorOptions },
      ).then((c) => BilibiliRegistrationRequestEventConnectionDTO.fromPrisma(c));
    },
  };
};

export type BilibiliRegistrationRequestEventService = ReturnType<typeof mkBilibiliRegistrationRequestEventService>;
