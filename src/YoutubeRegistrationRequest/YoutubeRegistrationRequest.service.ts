import { PrismaClient, YoutubeRegistrationRequest, YoutubeVideoSource } from "@prisma/client";
import { ulid } from "ulid";

import { err, ok, Result } from "../utils/Result.js";
import { YoutubeRegistrationRequestDTO } from "./dto.js";

export const mkYoutubeRegistrationRequestService = ({ prisma }: { prisma: PrismaClient }) => {
  return {
    getByIdOrThrow(id: string) {
      return prisma.nicovideoRegistrationRequest
        .findUniqueOrThrow({ where: { id } })
        .then((v) => YoutubeRegistrationRequestDTO.fromPrisma(v));
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
        | { message: "VIDEO_ALREADY_REGISTERED"; source: YoutubeVideoSource }
        | { message: "INTERNAL_SERVER_ERROR"; error: unknown },
        YoutubeRegistrationRequest
      >
    > {
      try {
        for (const { tagId: id } of taggings) {
          const tag = await prisma.tag.findUnique({ where: { id } });
          if (!tag) return err({ message: "TAG_NOT_FOUND", tagId: id });
        }

        const videoSource = await prisma.youtubeVideoSource.findUnique({ where: { sourceId } });
        if (videoSource) {
          return err({ message: "VIDEO_ALREADY_REGISTERED", source: videoSource });
        }

        const request = await prisma.youtubeRegistrationRequest.create({
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

export type YoutubeRegistrationRequestService = ReturnType<typeof mkYoutubeRegistrationRequestService>;
