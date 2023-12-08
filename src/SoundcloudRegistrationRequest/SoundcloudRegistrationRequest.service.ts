import { Prisma, PrismaClient, SoundcloudRegistrationRequest, SoundcloudVideoSource } from "@prisma/client";
import { ulid } from "ulid";

import { err, ok, Result } from "../utils/Result.js";
import { SoundcloudRegistrationRequestDTO } from "./SoundcloudRegistrationRequest.dto.js";

export const mkSoundcloudRegistrationRequestService = ({ prisma }: { prisma: PrismaClient }) => {
  return {
    getByIdOrThrow(id: string) {
      return prisma.soundcloudRegistrationRequest
        .findUniqueOrThrow({ where: { id } })
        .then((v) => SoundcloudRegistrationRequestDTO.fromPrisma(v));
    },
    async findBySourceId(sourceId: string) {
      const a = await prisma.soundcloudRegistrationRequest.findUnique({ where: { sourceId } });
      if (a) return SoundcloudRegistrationRequestDTO.fromPrisma(a);
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
        | { message: "VIDEO_ALREADY_REGISTERED"; source: SoundcloudVideoSource }
        | { message: "INTERNAL_SERVER_ERROR"; error: unknown },
        SoundcloudRegistrationRequest
      >
    > {
      try {
        for (const { tagId: id } of taggings) {
          const tag = await prisma.tag.findUnique({ where: { id } });
          if (!tag) return err({ message: "TAG_NOT_FOUND", tagId: id });
        }

        const videoSource = await prisma.soundcloudVideoSource.findUnique({ where: { sourceId } });
        if (videoSource) {
          return err({ message: "VIDEO_ALREADY_REGISTERED", source: videoSource });
        }

        const request = await prisma.soundcloudRegistrationRequest.create({
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
    async mkAcceptTransaction(
      requestId: string | null,
      {
        videoId,
        userId,
      }: {
        videoId: string;
        userId: string;
      },
    ): Promise<
      Result<
        | { type: "REQUEST_NOT_FOUND"; requestId: string }
        | { type: "REQUEST_ALREADY_CHECKED"; requestId: string }
        | { type: "INTERNAL_SERVER_ERROR"; error: unknown },
        (
          | Prisma.Prisma__SoundcloudRegistrationRequestClient<unknown, never>
          | Prisma.Prisma__NotificationClient<unknown, never>
        )[]
      >
    > {
      if (!requestId) return ok([]);

      const request = await prisma.soundcloudRegistrationRequest.findUnique({ where: { id: requestId } });

      if (!request) return err({ type: "REQUEST_NOT_FOUND", requestId });
      if (request.isChecked) return err({ type: "REQUEST_ALREADY_CHECKED", requestId });

      const checkingId = ulid();
      return ok([
        prisma.soundcloudRegistrationRequest.update({
          where: { id: requestId },
          data: {
            isChecked: true,
            checking: {
              create: {
                id: checkingId,
                video: { connect: { id: videoId } },
                checkedBy: { connect: { id: userId } },
              },
            },
            events: { create: { userId, type: "ACCEPT" } },
          },
        }),
        prisma.notification.create({
          data: {
            notifyToId: request.requestedById,
            type: "ACCEPTING_SOUNDCLOUD_REGISTRATION_REQUEST",
            payload: { id: checkingId },
          },
        }),
      ]);
    },
  };
};

export type SoundcloudRegistrationRequestService = ReturnType<typeof mkSoundcloudRegistrationRequestService>;
