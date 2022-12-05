import { neo4jDriver } from "./driver.js";

export const tagVideo = async ({ tagId, videoId }: { tagId: string; videoId: string }): Promise<void> => {
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
    // return result.records.map((rec) => ({ id: rec.get("id") }));
  } finally {
    await session.close();
  }
};
