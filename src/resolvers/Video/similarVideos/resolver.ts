import { GraphQLError } from "graphql";
import { Integer } from "neo4j-driver";

import { VideoResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../types.js";
import { VideoSimilarityModel } from "../../VideoSimilarity/model.js";

export const resolveSimilarVideos = ({ neo4j, logger }: Pick<ResolverDeps, "logger" | "neo4j">) =>
  (async ({ id: videoId }, { input }, _context, info) => {
    const session = neo4j.session();

    try {
      const result = await session.run(
        `
        MATCH (v_from:Video {uid: $video_id})
        MATCH (v_from)<-[:TAGGED_TO]-(t:Tag)-[:TAGGED_TO]->(v_to)

        CALL {
            WITH t
            MATCH (t)-[:TAGGED_TO]->(vs_t:Video)
            RETURN 1.0 / (size(collect(vs_t)) - 1) AS t_importance
        }
        CALL {
            WITH v_to
            MATCH (v_to_ts:Tag)-[:TAGGED_TO]->(v_to)
            RETURN size(collect(v_to_ts)) AS v_to_ts_n
        }

        RETURN v_from.uid AS v_from, v_to.uid AS v_to, sum(t_importance / v_to_ts_n) AS score, collect(t.uid) AS ts
        ORDER BY score DESC
        LIMIT $limit
        `,
        { video_id: videoId, limit: Integer.fromNumber(input.limit) }
      );
      const items = result.records.map(
        (rec) =>
          new VideoSimilarityModel({
            score: rec.get("score"),
            originId: rec.get("v_from"),
            toId: rec.get("v_to"),
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
