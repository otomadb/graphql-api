import { err, ok, Result } from "../../../utils/Result.js";
import { ResolverDeps } from "../../types.js";
import { updateWholeVideoTags } from "../resolveSemitag/neo4j.js";

export const registerTagInNeo4j = async (
  { prisma, neo4j }: Pick<ResolverDeps, "prisma" | "neo4j">,
  tagId: string
): Promise<Result<unknown, true>> => {
  const session = neo4j.session();
  try {
    const tx = session.beginTransaction();
    for (const { id } of await prisma.videoTag.findMany({ where: { tagId } })) {
      await updateWholeVideoTags({ prisma, tx }, id);
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
    return ok(true);
  } catch (e) {
    return err(e);
  } finally {
    await session.close();
  }
};
