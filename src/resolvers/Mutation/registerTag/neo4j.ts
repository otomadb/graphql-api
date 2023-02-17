import { ResolverDeps } from "../../index.js";

export const register = async (
  { prisma, neo4j, logger }: Pick<ResolverDeps, "prisma" | "logger" | "neo4j">,
  tagId: string
) => {
  const session = neo4j.session();
  try {
    const tx = session.beginTransaction();
    const videotags = await prisma.videoTag.findMany({ where: { tagId } });
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

    const parents = await prisma.tagParent.findMany({ where: { childId: tagId } });
    for (const { parentId, childId, isExplicit } of parents) {
      tx.run(
        `
        MERGE (p:Tag {id: $parent_id})
        MERGE (c:Tag {id: $child_id})
        MERGE r=(p)-[:CHILD {explicit: $explicit}]->(c)
        RETURN r
        `,
        {
          parent_id: parentId,
          child_id: childId,
          explicit: isExplicit,
        }
      );
    }

    /* TODO: SemitagをNeo4j内でどう扱うかは未定
    const checkings = await prisma.semitagChecking.findMany({
      where: { videoTag: { tagId } },
      include: { semitag: true, videoTag: true },
    });
    for (const { videoTag } of checkings) {
      if (videoTag)
        tx.run(
          `
          MERGE (v:Video {id: $video_id})
          MERGE (t:Tag {id: $tag_id})
          MERGE r=(v)-[:TAGGED_BY]->(t)
          RETURN r
          `,
          {
            tag_id: videoTag.tagId,
            video_id: videoTag.videoId,
          }
        );
    }
    */

    await tx.commit();
  } catch (e) {
    logger.error({ tagId, error: e }, "Failed to register tag in Neo4j");
  } finally {
    await session.close();
  }
};
