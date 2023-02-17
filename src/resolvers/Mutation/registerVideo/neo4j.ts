import { ResolverDeps } from "../../index.js";

export const register = async (
  { prisma, neo4j, logger }: Pick<ResolverDeps, "prisma" | "logger" | "neo4j">,
  videoId: string
) => {
  const session = neo4j.session();
  try {
    const tx = session.beginTransaction();

    const videotags = await prisma.videoTag.findMany({ where: { videoId } });
    for (const { videoId, tagId } of videotags) {
      tx.run(
        `
        MERGE (v:Video {id: $video_id})
        MERGE (t:Tag {id: $tag_id})
        MERGE r=(v)-[:TAGGED_BY]->(t)
        RETURN r
        `,
        {
          tag_id: tagId,
          video_id: videoId,
        }
      );
    }

    /* TODO: SemitagをNeo4j内でどう扱うかは未定
    const semitags = await prisma.semitag.findMany({ where: { videoId } });
    for (const { videoId, id, name } of semitags) {
      tx.run(
        `
        MERGE (v:Video {id: $video_id})
        MERGE (s:Semitag {id: $semitag_id})
        SET s.name = $semitag_name
        MERGE r=(v)-[:SEMITAGGED_BY]->(s)
        RETURN r
        `,
        {
          video_id: videoId,
          semitag_id: id,
          semitag_name: name,
        }
      );
    }
    */

    await tx.commit();
  } catch (e) {
    logger.error({ videoId, error: e }, "Failed to register video in Neo4j");
  } finally {
    await session.close();
  }
};
