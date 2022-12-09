import { Driver, Integer } from "neo4j-driver";

export const calcRecommendedVideosByMylist =
  (driver: Driver) =>
  async (mylistId: string, { limit }: { limit: number }): Promise<{ videoId: string; score: number }[]> => {
    const session = driver.session();

    try {
      const result = await session.run(
        `
        MATCH (m:Mylist {id: $mylist_id})
        MATCH (M:Mylist) WHERE M <> m

        MATCH (m)-[:CONTAINS_VIDEO]->(v_m:Video)
        WITH m,M, COLLECT(v_m) AS coll_v_m

        MATCH (M)-[:CONTAINS_VIDEO]->(v_M:Video) WHERE NOT v_M in coll_v_m
        WITH m,M,coll_v_m, collect(v_M) AS coll_v_M

        MATCH (m)-[:CONTAINS_VIDEO]->(v_mM:Video)<-[:CONTAINS_VIDEO]-(M)
        WITH m,M,coll_v_m,coll_v_M, collect(v_mM) AS coll_v_mM

        WITH
            m,M,coll_v_M,
            (1.0 * size(coll_v_mM) / (size(coll_v_m) + size(coll_v_M))) AS j_mM
            ORDER BY j_mM DESC

        MATCH (v:Video) WHERE v IN coll_v_M
        WITH v.id AS v_id, sum(1.0 / (1 - j_mM)) AS r

        RETURN v_id, r ORDER BY r DESC, v_id LIMIT $limit
      `,
        { mylist_id: mylistId, limit: Integer.fromNumber(limit) }
      );
      return result.records.map((rec) => ({
        videoId: rec.get("v_id"),
        score: rec.get("r"),
      }));
    } finally {
      await session.close();
    }
  };
