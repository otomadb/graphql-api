import { GraphQLError } from "graphql";
import { Integer } from "neo4j-driver";

import { VideoResolvers } from "../graphql.js";
import { ResolverDeps } from "../types.js";
import { VideoSimilarityModel } from "../VideoSimilarity/model.js";

export const resolveSimilarVideos = ({ neo4j, logger }: Pick<ResolverDeps, "logger" | "neo4j">) =>
  (async ({ id: videoId }, { input }, _context, info) => {
    const session = neo4j.session();

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

        RETURN v.id AS origin_id, V.id AS to_id, jaccard
        ORDER BY jaccard DESC
        LIMIT $limit
        `,
        { video_id: videoId, limit: Integer.fromNumber(input.limit) }
      );
      const items = result.records.map(
        (rec) =>
          new VideoSimilarityModel({
            score: rec.get("jaccard"),
            originId: rec.get("origin_id"),
            toId: rec.get("to_id"),
          })
      );
      return { items };
    } catch (error) {
      logger.error({ error, path: info.path }, "Failed to get similar video");
      throw new GraphQLError("Failed to get similar video");
    } finally {
      await session.close();
    }
  }) satisfies VideoResolvers["similarVideos"];
