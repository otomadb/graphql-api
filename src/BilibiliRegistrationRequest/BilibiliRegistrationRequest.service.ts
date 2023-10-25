import { BilibiliMADSource, BilibiliRegistrationRequest, PrismaClient } from "@prisma/client";
import { ulid } from "ulid";

import { err, ok, Result } from "../utils/Result.js";
import { BilibiliRegistrationRequestDTO } from "./BilibiliRegistrationRequest.dto.js";

export const mkBilibiliRegistrationRequestService = ({ prisma }: { prisma: PrismaClient }) => {
  return {
    getByIdOrThrow(id: string) {
      return prisma.bilibiliRegistrationRequest
        .findUniqueOrThrow({ where: { id } })
        .then((v) => BilibiliRegistrationRequestDTO.fromPrisma(v));
    },
    async findBySourceId(sourceId: string) {
      const a = await prisma.bilibiliRegistrationRequest.findUnique({ where: { sourceId } });
      if (a) return BilibiliRegistrationRequestDTO.fromPrisma(a);
      return null;
    },
    async requestRegistration({
      title,
      thumbnailUrl,
      userId,
      sourceId,
      taggings,
      semitaggings,
    }: {
      title: string;
      sourceId: string;
      thumbnailUrl: string;
      userId: string;
      taggings: { tagId: string; note: string | null }[];
      semitaggings: { name: string; note: string | null }[];
    }): Promise<
      Result<
        | { message: "TAG_NOT_FOUND"; tagId: string }
        | { message: "VIDEO_ALREADY_REGISTERED"; source: BilibiliMADSource }
        | { message: "INTERNAL_SERVER_ERROR"; error: unknown },
        BilibiliRegistrationRequest
      >
    > {
      try {
        for (const { tagId: id } of taggings) {
          const tag = await prisma.tag.findUnique({ where: { id } });
          if (!tag) return err({ message: "TAG_NOT_FOUND", tagId: id });
        }

        const videoSource = await prisma.bilibiliMADSource.findUnique({ where: { sourceId } });
        if (videoSource) {
          return err({ message: "VIDEO_ALREADY_REGISTERED", source: videoSource });
        }

        const request = await prisma.bilibiliRegistrationRequest.create({
          data: {
            id: ulid(),
            title,
            thumbnailUrl,
            sourceId,
            requestedById: userId,
            isChecked: false,
            taggings: {
              createMany: {
                data: taggings.map(({ tagId, note }) => ({
                  id: ulid(),
                  tagId,
                  note,
                })),
              },
            },
            semitaggings: {
              createMany: {
                data: semitaggings.map(({ name, note }) => ({
                  id: ulid(),
                  name,
                  note,
                })),
              },
            },
            events: { create: { userId, type: "REQUEST" } },
          },
        });

        return ok(request);
      } catch (e) {
        return err({ message: "INTERNAL_SERVER_ERROR", error: e });
      }
    },
  };
};

export type BilibiliRegistrationRequestService = ReturnType<typeof mkBilibiliRegistrationRequestService>;
