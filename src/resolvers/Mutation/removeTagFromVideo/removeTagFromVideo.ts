import { UserRole } from "@prisma/client";
import { Driver as Neo4jDriver } from "neo4j-driver";

import { ensureContextUser } from "../../ensureContextUser.js";
import { MutationResolvers } from "../../graphql.js";
import { parseGqlID } from "../../id.js";
import { ResolverDeps } from "../../index.js";
import { TagModel } from "../../Tag/model.js";
import { VideoModel } from "../../Video/model.js";

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

export const removeTagFromVideo = ({ prisma, neo4j }: Pick<ResolverDeps, "prisma" | "neo4j">) =>
  ensureContextUser(UserRole.NORMAL, async (_parent, { input: { tagId: tagGqlId, videoId: videoGqlId } }) => {
    const videoId = parseGqlID("Video", videoGqlId);
    const tagId = parseGqlID("Tag", tagGqlId);

    const tagging = await prisma.videoTag.delete({
      where: { videoId_tagId: { tagId, videoId } },
      include: { tag: true, video: true },
    });

    await removeInNeo4j(neo4j, {
      videoId: tagging.video.id,
      tagId: tagging.tag.id,
    });

    return {
      video: new VideoModel(tagging.video),
      tag: new TagModel(tagging.tag),
    };
  }) satisfies MutationResolvers["removeTagFromVideo"];
