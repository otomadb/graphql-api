import { Tag, UserRole, Video, VideoTag } from "@prisma/client";
import { GraphQLError } from "graphql";
import { Driver as Neo4jDriver } from "neo4j-driver";

import { Result } from "../../../utils/Result.js";
import { ensureContextUser } from "../../ensureContextUser.js";
import { MutationResolvers } from "../../graphql.js";
import { GraphQLNotExistsInDBError, parseGqlID } from "../../id.js";
import { ResolverDeps } from "../../index.js";
import { TagModel } from "../../Tag/model.js";
import { VideoModel } from "../../Video/model.js";
import { VideoRemoveTagEventPayload } from "../../VideoRemoveTagEvent/index.js";

export const removeInNeo4j = async (driver: Neo4jDriver, { videoId, tagId }: { videoId: string; tagId: string }) => {
  const session = driver.session();
  try {
    await session.run(
      `
      MATCH (v:Video {id: $video_id})
      MATCH (t:Tag {id: $tag_id})
      MATCH (v)-[r:TAGGED_BY]->(t)
      DELETE r
      `,
      { tag_id: tagId, video_id: videoId }
    );
  } finally {
    await session.close();
  }
};

export const remove = async (
  prisma: ResolverDeps["prisma"],
  { authUserId, videoId, tagId }: { authUserId: string; videoId: string; tagId: string }
): Promise<Result<"NO_VIDEO" | "NO_TAG" | "NO_TAGGING" | "REMOVED_TAGGING", VideoTag & { video: Video; tag: Tag }>> => {
  if ((await prisma.video.findUnique({ where: { id: videoId } })) === null)
    return { status: "error", error: "NO_VIDEO" };
  if ((await prisma.tag.findUnique({ where: { id: tagId } })) === null) return { status: "error", error: "NO_TAG" };

  const extTagging = await prisma.videoTag.findUnique({ where: { videoId_tagId: { tagId, videoId } } });
  if (extTagging === null) return { status: "error", error: "NO_TAGGING" };
  if (extTagging.isRemoved) return { status: "error", error: "REMOVED_TAGGING" };

  const [tagging] = await prisma.$transaction([
    prisma.videoTag.update({
      where: { videoId_tagId: { tagId, videoId } },
      data: { isRemoved: true },
      include: { tag: true, video: true },
    }),
    prisma.videoEvent.create({
      data: {
        userId: authUserId,
        videoId,
        type: "REMOVE_TAG",
        payload: { tagId } satisfies VideoRemoveTagEventPayload,
      },
    }),
  ]);
  return { status: "ok", data: tagging };
};

export const removeTagFromVideo = ({ prisma, neo4j }: Pick<ResolverDeps, "prisma" | "neo4j">) =>
  ensureContextUser(
    prisma,
    UserRole.NORMAL,
    async (_parent, { input: { tagId: tagGqlId, videoId: videoGqlId } }, { userId: authUserId }) => {
      const videoId = parseGqlID("Video", videoGqlId);
      const tagId = parseGqlID("Tag", tagGqlId);

      const result = await remove(prisma, { videoId, tagId, authUserId });
      if (result.status === "error") {
        switch (result.error) {
          case "NO_VIDEO":
            throw new GraphQLNotExistsInDBError("Video", videoId);
          case "NO_TAG":
            throw new GraphQLNotExistsInDBError("Video", videoId);
          case "NO_TAGGING":
            throw new GraphQLError("Tagging does not exist");
          case "REMOVED_TAGGING":
            throw new GraphQLError("Tagging is removed already");
        }
      }

      const tagging = result.data;
      await removeInNeo4j(neo4j, { videoId: tagging.video.id, tagId: tagging.tag.id });

      return { video: new VideoModel(tagging.video), tag: new TagModel(tagging.tag) };
    }
  ) satisfies MutationResolvers["removeTagFromVideo"];
