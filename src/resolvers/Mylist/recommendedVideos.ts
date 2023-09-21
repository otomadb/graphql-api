import { Integer } from "neo4j-driver";

import { MylistResolvers } from "../graphql.js";
import { MylistVideoRecommendationModel } from "../MylistVideoRecommendation/model.js";
import { ResolverDeps } from "../types.js";

export const resolveRecommendedVideos = ({ neo4j }: Pick<ResolverDeps, "neo4j">) =>
  (async ({ id: mylistId }, { input }) => {
    const session = neo4j.session();

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
        WITH m.id AS origin_id, v.id AS to_id, sum(1.0 / (1 - j_mM)) AS r

        RETURN origin_id, to_id, r
        ORDER BY r DESC, to_id
        LIMIT $limit
      `,
        { mylist_id: mylistId, limit: Integer.fromNumber(input.limit) },
      );
      const items = result.records.map(
        (rec) =>
          new MylistVideoRecommendationModel({
            originMylistId: rec.get("origin_id"),
            toVideoId: rec.get("to_id"),
            score: rec.get("r"),
          }),
      );

      return { items };
    } finally {
      await session.close();
    }
  }) satisfies MylistResolvers["recommendedVideos"];
