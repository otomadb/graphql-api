import { Driver } from "neo4j-driver";

export const registerVideo =
  (driver: Driver) =>
  async (videoId: string, { tagIds }: { tagIds: string[] }): Promise<void> => {
    const session = driver.session();

    try {
      await session.run(
        `
      MERGE (v:Video {id: $video_id})
      FOREACH (tag_id in $tag_ids | MERGE (t:Tag {id: tag_id}) MERGE (v)-[:TAGGED_BY]->(t))
      RETURN v.id AS id
      `,
        {
          video_id: videoId,
          tag_ids: tagIds,
        }
      );
    } finally {
      await session.close();
    }
  };
