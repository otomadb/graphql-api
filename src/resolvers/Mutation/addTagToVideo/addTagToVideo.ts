import { UserRole } from "@prisma/client";
import { Driver as Neo4jDriver } from "neo4j-driver";

import { checkAuth } from "../../../auth/checkAuth.js";
import { MutationResolvers } from "../../graphql.js";
import { parseGqlID } from "../../../utils/id.js";
import { ResolverDeps } from "../../index.js";
import { TagModel } from "../../Tag/model.js";
import { VideoModel } from "../../Video/model.js";

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

export const addTagToVideo = ({ neo4j, prisma }: Pick<ResolverDeps, "prisma" | "neo4j">) =>
  checkAuth(UserRole.NORMAL, async (_parent, { input: { tagId: tagGqlId, videoId: videoGqlId } }, { user }) => {
    const videoId = parseGqlID("Video", videoGqlId);
    const tagId = parseGqlID("Tag", tagGqlId);

    const tagging = await prisma.videoTag.create({
      data: { videoId, tagId },
      include: { video: true, tag: true },
    });

    await addTagToVideoInNeo4j(neo4j, {
      tagId: tagging.tag.id,
      videoId: tagging.video.id,
    });

    return {
      video: new VideoModel(tagging.video),
      tag: new TagModel(tagging.tag),
    };
  }) satisfies MutationResolvers["addTagToVideo"];
