import { PrismaClient } from "@prisma/client";

import { NicovideoRegistrationRequestDTO } from "./dto.js";

export const mkNicovideoRegistrationRequestService = ({ prisma }: { prisma: PrismaClient }) => {
  return {
    getByIdOrThrow(id: string) {
      return prisma.nicovideoRegistrationRequest
        .findUniqueOrThrow({ where: { id } })
        .then((v) => NicovideoRegistrationRequestDTO.fromPrisma(v));
    },
  };
};

export type NicovideoRegistrationRequestService = ReturnType<typeof mkNicovideoRegistrationRequestService>;
