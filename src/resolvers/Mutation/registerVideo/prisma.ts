import {
  NicovideoRegistrationRequest,
  NicovideoVideoSourceEventType,
  Prisma,
  SemitagEventType,
  Video,
  VideoEventType,
  VideoTagEventType,
  VideoThumbnailEventType,
  VideoTitleEventType,
} from "@prisma/client";
import { ulid } from "ulid";

import { err, ok, Result } from "../../../utils/Result.js";
import { ResolverDeps } from "../../index.js";

export const getRequestCheck = async (
  prisma: ResolverDeps["prisma"],
  { requestId, videoId, userId }: { requestId: string | null; userId: string; videoId: string }
): Promise<
  Result<
    | { type: "REQUEST_NOT_FOUND"; requestId: string }
    | { type: "REQUEST_ALREADY_CHECKED"; requestId: string }
    | { type: "INTERNAL_SERVER_ERROR"; error: unknown },
    Prisma.Prisma__NicovideoRegistrationRequestClient<NicovideoRegistrationRequest, never>[]
  >
> => {
  if (!requestId) return ok([]);

  try {
    const request = await prisma.nicovideoRegistrationRequest.findUnique({ where: { id: requestId } });
    if (!request) return err({ type: "REQUEST_NOT_FOUND", requestId });
    if (request.isChecked) return err({ type: "REQUEST_ALREADY_CHECKED", requestId });

    return ok([
      prisma.nicovideoRegistrationRequest.update({
        where: { id: requestId },
        data: {
          isChecked: true,
          checking: {
            create: {
              id: ulid(),
              video: { connect: { id: videoId } },
              checkedBy: { connect: { id: userId } },
            },
          },
          events: { create: { userId, type: "ACCEPT" } },
        },
      }),
    ]);
  } catch (e) {
    return err({ type: "INTERNAL_SERVER_ERROR", error: e });
  }
};

export const register = async (
  prisma: ResolverDeps["prisma"],
  {
    authUserId,
    primaryTitle,
    extraTitles,
    primaryThumbnail,
    tagIds,
    semitagNames,
    nicovideoSourceIds: nicovideoVideoSourceIds,
    nicovideoRequestId,
  }: {
    authUserId: string;

    primaryTitle: string;
    extraTitles: string[];

    primaryThumbnail: string;

    tagIds: string[];
    semitagNames: string[];

    nicovideoSourceIds: string[];

    nicovideoRequestId: string | null;
  }
): Promise<
  Result<
    | { type: "NO_TAG" }
    | { type: "REQUEST_NOT_FOUND"; requestId: string }
    | { type: "REQUEST_ALREADY_CHECKED"; requestId: string }
    | { type: "INTERNAL_SERVER_ERROR"; error: unknown },
    Video
  >
> => {
  const videoId = ulid();
  const dataTitles = [
    { id: ulid(), title: primaryTitle, isPrimary: true },
    ...extraTitles.map((extraTitle) => ({
      id: ulid(),
      title: extraTitle,
      isPrimary: false,
    })),
  ];
  const dataThumbnails = [
    {
      id: ulid(),
      imageUrl: primaryThumbnail,
      isPrimary: true,
    },
  ];
  const dataTags = tagIds.map((tagId) => ({
    id: ulid(),
    tagId,
  }));
  const dataSemitags = semitagNames.map((name) => ({
    id: ulid(),
    name,
    isChecked: false,
  }));
  const dataNicovideoSources = nicovideoVideoSourceIds.map((sourceId) => ({
    id: ulid(),
    sourceId: sourceId.toLowerCase(),
  }));

  const checkRequest = await getRequestCheck(prisma, { requestId: nicovideoRequestId, videoId, userId: authUserId });
  if (checkRequest.status === "error") return checkRequest;

  const [video] = await prisma.$transaction([
    prisma.video.create({
      data: {
        id: videoId,
        titles: { createMany: { data: dataTitles } },
        thumbnails: { createMany: { data: dataThumbnails } },
        tags: { createMany: { data: dataTags } },
        semitags: { createMany: { data: dataSemitags } },
        nicovideoSources: { createMany: { data: dataNicovideoSources } },
      },
    }),
    prisma.videoEvent.createMany({
      data: [
        {
          userId: authUserId,
          videoId,
          type: VideoEventType.REGISTER,
          payload: {},
        },
      ],
    }),
    prisma.videoTitleEvent.createMany({
      data: [
        ...dataTitles.map(({ id }) => ({
          userId: authUserId,
          videoTitleId: id,
          type: VideoTitleEventType.CREATE,
          payload: {},
        })),
        {
          userId: authUserId,
          videoTitleId: dataTitles[0].id,
          type: VideoTitleEventType.SET_PRIMARY,
          payload: {},
        },
      ],
    }),
    prisma.videoThumbnailEvent.createMany({
      data: [
        ...dataThumbnails.map(({ id }) => ({
          userId: authUserId,
          videoThumbnailId: id,
          type: VideoThumbnailEventType.CREATE,
          payload: {},
        })),
        {
          userId: authUserId,
          videoThumbnailId: dataThumbnails[0].id,
          type: VideoThumbnailEventType.SET_PRIMARY,
          payload: {},
        },
      ],
    }),
    prisma.videoTagEvent.createMany({
      data: [
        ...dataTags.map(({ id }) => ({
          userId: authUserId,
          videoTagId: id,
          type: VideoTagEventType.ATTACH,
          payload: {},
        })),
      ],
    }),
    prisma.semitagEvent.createMany({
      data: [
        ...dataSemitags.map(({ id }) => ({
          userId: authUserId,
          semitagId: id,
          type: SemitagEventType.ATTACH,
          payload: {},
        })),
      ],
    }),
    prisma.nicovideoVideoSourceEvent.createMany({
      data: [
        ...dataNicovideoSources.map(({ id }) => ({
          userId: authUserId,
          sourceId: id,
          type: NicovideoVideoSourceEventType.CREATE,
          payload: {},
        })),
      ],
    }),
    ...checkRequest.data,
  ]);

  return ok(video);
};
