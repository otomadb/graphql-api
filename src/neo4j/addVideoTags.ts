import { Driver as Neo4jDriver } from "neo4j-driver";

import { VideoTag } from "../db/entities/video_tags.js";

export const addVideoTags =
  ({ neo4jDriver }: { neo4jDriver: Neo4jDriver }) =>
  async (rels: VideoTag[]) => {
    const session = neo4jDriver.session();
    try {
      const tx = session.beginTransaction();
      for (const rel of rels) {
        const tagId = rel.tag.id;
        const videoId = rel.video.id;
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
