import { UserRole } from "@prisma/client";
import { Driver as Neo4jDriver } from "neo4j-driver";
import { ulid } from "ulid";

import { ensureContextUser } from "../../ensureContextUser.js";
import { MutationResolvers } from "../../graphql.js";
import { parseGqlID } from "../../id.js";
import { ResolverDeps } from "../../index.js";
import { TagModel } from "../../Tag/model.js";
import { VideoModel } from "../../Video/model.js";
import { VideoAddTagEventPayload } from "../../VideoAddTagEvent/index.js";

export const addTagToVideoInNeo4j = async (
  neo4jDriver: Neo4jDriver,
  { videoId, tagId }: { videoId: string; tagId: string }
) => {
  const session = neo4jDriver.session();
  try {
    await session.run(
      `
      MERGE (v:Video {id: $video_id})
      MERGE (t:Tag {id: $tag_id})
      MERGE r=(v)-[:TAGGED_BY]->(t)
      RETURN r
    `,
      { tag_id: tagId, video_id: videoId }
    );
  } finally {
    await session.close();
  }
};

export const add = async (
  prisma: ResolverDeps["prisma"],
  { authUserId, videoId, tagId }: { authUserId: string; videoId: string; tagId: string }
) => {
  const taggingId = ulid();

  const [tagging] = await prisma.$transaction([
    prisma.videoTag.upsert({
      where: { videoId_tagId: { videoId, tagId } },
      create: { id: taggingId, videoId, tagId, isRemoved: false },
      update: { isRemoved: false },
      include: { video: true, tag: true },
    }),
    prisma.videoEvent.create({
      data: {
        userId: authUserId,
        videoId,
        type: "ADD_TAG",
        payload: { tagId } satisfies VideoAddTagEventPayload,
      },
    }),
  ]);

  return tagging;
};

export const addTagToVideo = ({ neo4j, prisma }: Pick<ResolverDeps, "prisma" | "neo4j">) =>
  ensureContextUser(
    prisma,
    UserRole.NORMAL,
    async (_parent, { input: { tagId: tagGqlId, videoId: videoGqlId } }, { userId: authUserId }) => {
      const videoId = parseGqlID("Video", videoGqlId);
      const tagId = parseGqlID("Tag", tagGqlId);

      const tagging = await add(prisma, { authUserId, videoId, tagId });

      await addTagToVideoInNeo4j(neo4j, {
        tagId: tagging.tagId,
        videoId: tagging.videoId,
      });

      return {
        video: new VideoModel(tagging.video),
        tag: new TagModel(tagging.tag),
      };
    }
  ) satisfies MutationResolvers["addTagToVideo"];
