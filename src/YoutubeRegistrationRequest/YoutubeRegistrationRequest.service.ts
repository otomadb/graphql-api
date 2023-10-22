import { PrismaClient } from "@prisma/client";

import { YoutubeRegistrationRequestDTO } from "./dto.js";

export const mkYoutubeRegistrationRequestService = ({ prisma }: { prisma: PrismaClient }) => {
  return {
    getByIdOrThrow(id: string) {
      return prisma.nicovideoRegistrationRequest
        .findUniqueOrThrow({ where: { id } })
        .then((v) => YoutubeRegistrationRequestDTO.fromPrisma(v));
    },
  };
};

export type YoutubeRegistrationRequestService = ReturnType<typeof mkYoutubeRegistrationRequestService>;
