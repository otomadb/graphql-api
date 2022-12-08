import { Driver } from "neo4j-driver";

export const untagVideo =
  (driver: Driver) =>
  async ({ tagId, videoId }: { tagId: string; videoId: string }): Promise<void> => {
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
      // return result.records.map((rec) => ({ id: rec.get("id") }));
    } finally {
      await session.close();
    }
  };
