import { Driver as Neo4jDriver } from "neo4j-driver";

import { LoggerService } from "../Common/Logger.service.js";
import { err, ok, Result } from "../utils/Result.js";

export const mkNeo4jService = ({
  driver: neo4j,
  LoggerService: logger,
}: {
  driver: Neo4jDriver;
  LoggerService: LoggerService;
}) => {
  return {
    async registerVideoTags(tags: { videoId: string; tagId: string }[]): Promise<Result<"", true>> {
      const session = neo4j.session();
      try {
        const tx = session.beginTransaction();

        const query = `MERGE (t:Tag {uid: $tagId}) MERGE (v:Video {uid: $videoId}) MERGE (t)-[r:TAGGED_TO]->(v) RETURN r`;
        tags.map(({ tagId, videoId }) => tx.run(query, { tagId, videoId }));

        await tx.commit();
        return ok(true);
      } catch (e) {
        logger.error("Registration neo4j something broken", e);
        return err("");
      } finally {
        await session.close();
      }
    },
  };
};

export type Neo4jService = ReturnType<typeof mkNeo4jService>;
