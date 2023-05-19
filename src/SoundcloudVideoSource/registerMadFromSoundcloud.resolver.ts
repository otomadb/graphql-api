import {
  SemitagEventType,
  SoundcloudVideoSourceEventType,
  Video,
  VideoEventType,
  VideoTagEventType,
  VideoThumbnailEventType,
  VideoTitleEventType,
} from "@prisma/client";
import { GraphQLError } from "graphql";
import { ulid } from "ulid";

import { MutationResolvers, ResolversTypes } from "../resolvers/graphql.js";
import { parseGqlIDs3 } from "../resolvers/id.js";
import { updateWholeVideoTags } from "../resolvers/Mutation/resolveSemitag/neo4j.js";
import { ResolverDeps } from "../resolvers/types.js";
import { checkDuplicate } from "../utils/checkDuplicate.js";
import { err, isErr, ok, Result } from "../utils/Result.js";
import { VideoDTO } from "../Video/dto.js";

export const registerVideoInNeo4j = async (
  { prisma, neo4j }: Pick<ResolverDeps, "prisma" | "logger" | "neo4j">,
  videoId: string
): Promise<Result<unknown, true>> => {
  const session = neo4j.session();
  try {
    const tx = session.beginTransaction();

    const videotags = await prisma.videoTag.findMany({ where: { videoId } });
    for (const { id } of videotags) {
      await updateWholeVideoTags({ prisma, tx }, id);
    }

    /* TODO: SemitagをNeo4j内でどう扱うかは未定
    const semitags = await prisma.semitag.findMany({ where: { videoId } });
    for (const { videoId, id, name } of semitags) {
      tx.run(
        `
        MERGE (v:Video {id: $video_id})
        MERGE (s:Semitag {id: $semitag_id})
        SET s.name = $semitag_name
        MERGE r=(v)-[:SEMITAGGED_BY]->(s)
        RETURN r
        `,
        {
          video_id: videoId,
          semitag_id: id,
          semitag_name: name,
        }
      );
    }
    */

    await tx.commit();
    return ok(true);
  } catch (e) {
    return err(e);
  } finally {
    await session.close();
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
    sourceIds,
  }: {
    authUserId: string;
    primaryTitle: string;
    extraTitles: string[];
    primaryThumbnail: string;
    tagIds: string[];
    semitagNames: string[];
    sourceIds: string[];
  }
): Promise<Result<{ type: "NO_TAG"; tagId: string } | { type: "INTERNAL_SERVER_ERROR"; error: unknown }, Video>> => {
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
  const dataSoundcloudSources = sourceIds.map((sourceId) => ({
    id: ulid(),
    sourceId,
  }));

  const [video] = await prisma.$transaction([
    prisma.video.create({
      data: {
        id: videoId,
        titles: { createMany: { data: dataTitles } },
        thumbnails: { createMany: { data: dataThumbnails } },
        tags: { createMany: { data: dataTags } },
        semitags: { createMany: { data: dataSemitags } },
        soundcloudSources: { createMany: { data: dataSoundcloudSources } },
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
    prisma.soundcloudVideoSourceEvent.createMany({
      data: [
        ...dataSoundcloudSources.map(({ id }) => ({
          userId: authUserId,
          sourceId: id,
          type: SoundcloudVideoSourceEventType.CREATE,
          payload: {},
        })),
      ],
    }),
  ]);

  return ok(video);
};

export const resolverRegisterMadFromSoundcloud = ({
  prisma,
  logger,
  neo4j,
}: Pick<ResolverDeps, "prisma" | "neo4j" | "logger">) =>
  (async (_parent, { input }, { currentUser: user }, info) => {
    // TagのIDの妥当性及び重複チェック
    const tagIds = parseGqlIDs3("Tag", input.tagIds);
    if (isErr(tagIds)) {
      switch (tagIds.error.type) {
        case "INVALID_ID":
          return {
            __typename: "MutationInvalidTagIdError",
            tagId: tagIds.error.type,
          } satisfies ResolversTypes["RegisterMadFromSoundcloudPayload"];
        case "DUPLICATED":
          return {
            __typename: "RegisterMadFromSoundcloudTagIdsDuplicatedError",
            tagId: tagIds.error.duplicatedId,
          } satisfies ResolversTypes["RegisterMadFromSoundcloudPayload"];
      }
    }
    // Semitagのnameの重複チェック
    const semitagNames = checkDuplicate(input.semitagNames);
    if (isErr(semitagNames)) {
      return {
        __typename: "RegisterMadFromSoundcloudSemitagNamesDuplicatedError",
        name: semitagNames.error,
      } satisfies ResolversTypes["RegisterMadFromSoundcloudPayload"];
    }

    /*
    // Soundcloudの動画IDチェック
    for (const id of input.sourceIds) {
      if (!isValidSoundcloudSourceId(id))
        return {
          __typename: "RegisterMadFromSoundcloudInvalidSoundcloudSourceIdError",
          sourceID: id,
        } satisfies ResolversTypes["RegisterMadFromSoundcloudPayload"];
    }
    */

    const result = await register(prisma, {
      authUserId: user.id,
      primaryTitle: input.primaryTitle,
      extraTitles: input.extraTitles,
      primaryThumbnail: input.primaryThumbnailUrl,
      tagIds: tagIds.data,
      semitagNames: semitagNames.data,
      sourceIds: input.sourceIds,
    });

    if (isErr(result)) {
      switch (result.error.type) {
        case "NO_TAG":
          return {
            __typename: "MutationTagNotFoundError",
            tagId: result.error.tagId,
          } satisfies ResolversTypes["RegisterMadFromSoundcloudPayload"];
        case "INTERNAL_SERVER_ERROR":
          logger.error({ error: result.error, path: info.path }, "Internal Server Error");
          throw new GraphQLError("Internal Server Error");
      }
    }

    const video = result.data;
    await registerVideoInNeo4j({ prisma, logger, neo4j }, video.id);

    return {
      __typename: "RegisterMadFromSoundcloudSucceededPayload",
      mad: new VideoDTO(video),
    } satisfies ResolversTypes["RegisterMadFromSoundcloudPayload"];
  }) satisfies MutationResolvers["registerMadFromSoundcloud"];
