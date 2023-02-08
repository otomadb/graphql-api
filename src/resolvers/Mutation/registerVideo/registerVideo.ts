import { UserRole } from "@prisma/client";
import { GraphQLError } from "graphql";
import { ulid } from "ulid";

import { isValidNicovideoSourceId } from "../../../utils/isValidNicovideoSourceId.js";
import { ensureContextUser } from "../../ensureContextUser.js";
import { MutationResolvers, RegisterVideoInputSourceType } from "../../graphql.js";
import { parseGqlIDs } from "../../id.js";
import { ResolverDeps } from "../../index.js";
import { VideoModel } from "../../Video/model.js";

export const registerVideoInNeo4j = async (
  neo4j: ResolverDeps["neo4j"],
  rels: { videoId: string; tagId: string }[]
) => {
  const session = neo4j.session();
  try {
    const tx = session.beginTransaction();
    for (const rel of rels) {
      const tagId = rel.videoId;
      const videoId = rel.tagId;
      tx.run(
        `
          MERGE (v:Video {id: $video_id})
          MERGE (t:Tag {id: $tag_id})
          MERGE r=(v)-[:TAGGED_BY]->(t)
          RETURN r
          `,
        { tag_id: tagId, video_id: videoId }
      );
    }
    await tx.commit();
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
) => {
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
    isResolved: false,
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
  ]);

  return video;
};

export const registerVideo = ({ prisma }: Pick<ResolverDeps, "prisma" | "neo4j">) =>
  ensureContextUser(
    prisma,
    UserRole.EDITOR,
    // registerVideoScaffold(deps)
    async (_parent, { input }, { userId }) => {
      // GraphQLのIDをデータベースのIDに変換
      const tagIds = parseGqlIDs("Tag", input.tags);

      // ニコニコ動画の動画IDチェック
      const nicovideoSourceIds = input.sources
        .filter((v) => v.type === RegisterVideoInputSourceType.Nicovideo)
        .map(({ sourceId }) => sourceId.toLocaleLowerCase());
      for (const id of nicovideoSourceIds) {
        if (!isValidNicovideoSourceId(id)) throw new GraphQLError(`"${id}" is invalid source id for niconico source`);
      }

      const video = await register(prisma, {
        authUserId: userId,
        primaryTitle: input.primaryTitle,
        extraTitles: input.extraTitles,
        primaryThumbnail: input.primaryThumbnail,
        tagIds,
        semitagNames: input.semitags,
        nicovideoSourceIds,
      });

      return {
        video: new VideoModel(video),
      };
    }
  ) satisfies MutationResolvers["registerVideo"];
