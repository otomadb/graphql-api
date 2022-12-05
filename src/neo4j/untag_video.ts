import { neo4jDriver } from "./driver.js";

export const untagVideo = async ({ tagId, videoId }: { tagId: string; videoId: string }): Promise<void> => {
  const session = neo4jDriver.session();

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
    // return result.records.map((rec) => ({ id: rec.get("id") }));
  } finally {
    await session.close();
  }
};
