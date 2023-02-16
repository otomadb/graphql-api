import {
  NicovideoVideoSourceEventType,
  SemitagEventType,
  UserRole,
  Video,
  VideoEventType,
  VideoTagEventType,
  VideoThumbnailEventType,
  VideoTitleEventType,
} from "@prisma/client";
import { ulid } from "ulid";

import { isValidNicovideoSourceId } from "../../../utils/isValidNicovideoSourceId.js";
import { Result } from "../../../utils/Result.js";
import { MutationResolvers, RegisterVideoFailedMessage, RegisterVideoInputSourceType } from "../../graphql.js";
import { parseGqlIDs2 } from "../../id.js";
import { ResolverDeps } from "../../index.js";
import { VideoModel } from "../../Video/model.js";
import { register as registerInNeo4j } from "./neo4j.js";

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
  }: {
    authUserId: string;

    primaryTitle: string;
    extraTitles: string[];

    primaryThumbnail: string;

    tagIds: string[];
    semitagNames: string[];

    nicovideoSourceIds: string[];
  }
): Promise<Result<{ type: "NO_TAG" }, Video>> => {
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
  ]);

  return {
    status: "ok",
    data: video,
  };
};

export const registerVideo = ({ prisma, logger, neo4j }: Pick<ResolverDeps, "prisma" | "neo4j" | "logger">) =>
  // registerVideoScaffold(deps)
  (async (_parent, { input }, { user }) => {
    if (!user || (user.role !== UserRole.EDITOR && user.role !== UserRole.ADMINISTRATOR))
      return {
        __typename: "RegisterVideoFailedPayload",
        message: RegisterVideoFailedMessage.Forbidden,
      };

    const tagIds = parseGqlIDs2("Tag", input.tags);
    if (tagIds.status === "error") {
      return {
        __typename: "RegisterVideoFailedPayload",
        message: RegisterVideoFailedMessage.InvalidTagId,
      };
    }

    // ニコニコ動画の動画IDチェック
    const nicovideoSourceIds = input.sources
      .filter((v) => v.type === RegisterVideoInputSourceType.Nicovideo)
      .map(({ sourceId }) => sourceId.toLocaleLowerCase());
    for (const id of nicovideoSourceIds) {
      if (!isValidNicovideoSourceId(id))
        return {
          __typename: "RegisterVideoFailedPayload",
          message: RegisterVideoFailedMessage.InvalidNicovideoSourceId,
        };
    }

    const result = await register(prisma, {
      authUserId: user.id,
      primaryTitle: input.primaryTitle,
      extraTitles: input.extraTitles,
      primaryThumbnail: input.primaryThumbnail,
      tagIds: tagIds.data,
      semitagNames: input.semitags,
      nicovideoSourceIds,
    });

    if (result.status === "error") {
      switch (result.error.type) {
        default:
          return {
            __typename: "RegisterVideoFailedPayload",
            message: RegisterVideoFailedMessage.Unknown,
          };
      }
    }

    const video = result.data;
    await registerInNeo4j({ prisma, logger, neo4j }, video.id);

    return {
      __typename: "RegisterVideoSucceededPayload",
      video: new VideoModel(video),
    };
  }) satisfies MutationResolvers["registerVideo"];
