import { Driver, Integer } from "neo4j-driver";

export const calcVideoSimilarities =
  (driver: Driver) =>
  async (videoId: string, { limit }: { limit: number }): Promise<{ videoId: string; score: number }[]> => {
    const session = driver.session();

    try {
      const result = await session.run(
        `
        MATCH (v:Video {id: $video_id})-[:TAGGED_BY]->(t_vV:Tag)<-[:TAGGED_BY]-(V)
        WITH v,V,collect(t_vV) AS coll_t_vV

        MATCH (v)-[:TAGGED_BY]->(t_v:Tag)
        WITH v,V,coll_t_vV, collect(t_v) AS coll_t_v

        MATCH (V)-[:TAGGED_BY]->(t_V:Tag)
        WITH v,V,coll_t_vV, coll_t_v, collect(t_V) AS coll_t_V

        WITH v,V, size(coll_t_vV) * 1.0 / (size(coll_t_v) + size(coll_t_V) - size(coll_t_vV)) AS jaccard

        RETURN V.id AS id, jaccard
        ORDER BY jaccard DESC
        LIMIT $limit
      `,
        { video_id: videoId, limit: Integer.fromNumber(limit) }
      );
      return result.records.map((rec) => ({
        videoId: rec.get("id"),
        score: rec.get("jaccard"),
      }));
    } finally {
      await session.close();
    }
  };
