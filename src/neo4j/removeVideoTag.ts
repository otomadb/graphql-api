import { Driver as Neo4jDriver } from "neo4j-driver";

import { VideoTag } from "../db/entities/video_tags.js";

export const removeVideoTag =
  ({ neo4jDriver }: { neo4jDriver: Neo4jDriver }) =>
  async (rel: VideoTag) => {
    const tagId = rel.tag.id;
    const videoId = rel.video.id;

    const session = neo4jDriver.session();
    try {
      await session.run(
        `
        MATCH (v:Video {id: $video_id})
        MATCH (t:Tag {id: $tag_id})
        MATCH (v)-[:TAGGED_BY]->(t)
        DELETE r
        `,
        { tag_id: tagId, video_id: videoId }
      );
    } finally {
      await session.close();
    }
  };
