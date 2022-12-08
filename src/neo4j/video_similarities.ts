import { Driver, Integer } from "neo4j-driver";

export const calcVideoSimilarities =
  (driver: Driver) =>
  async (videoId: string, { limit }: { limit: number }): Promise<{ videoId: string; score: number }[]> => {
    const session = driver.session();

    try {
      const result = await session.run(
        `
      MATCH (bv:Video {id: $id})-[:TAGGED_BY]->(t:Tag)<-[:TAGGED_BY]-(ov:Video)

      WITH bv, ov, COUNT(t) AS i

      MATCH (bv)-[:TAGGED_BY]->(bvt)
      WITH bv, ov, i, COLLECT(bvt) AS s1c

      MATCH (ov)-[:TAGGED_BY]->(ovt) WHERE NOT ovt in s1c
      WITH bv, ov, i, s1c, COLLECT(ovt) AS s2c

      RETURN ov.id AS id, ((i * 1.0) / (size(s1c) + size(s2c))) AS jaccard
      ORDER BY jaccard DESC, id
      LIMIT $limit
      `,
        { id: videoId, limit: Integer.fromNumber(limit) }
      );
      return result.records.map((rec) => ({
        videoId: rec.get("id"),
        score: rec.get("jaccard"),
      }));
    } finally {
      await session.close();
    }
  };
