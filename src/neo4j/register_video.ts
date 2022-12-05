import { neo4jDriver } from "./driver.js";

export const registerVideo = async (videoId: string, { tagIds }: { tagIds: string[] }): Promise<{ id: number }[]> => {
  const session = neo4jDriver.session();

  try {
    console.dir(tagIds);

    const result = await session.run(
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
    return result.records.map((rec) => ({ id: rec.get("id") }));
  } finally {
    await session.close();
  }
};
