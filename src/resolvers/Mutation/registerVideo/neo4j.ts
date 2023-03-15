import { err, ok, Result } from "../../../utils/Result.js";
import { ResolverDeps } from "../../types.js";
import { updateWholeVideoTags } from "../resolveSemitag/neo4j.js";

export const registerVideoInNeo4j = async (
  { prisma, neo4j }: Pick<ResolverDeps, "prisma" | "logger" | "neo4j">,
  videoId: string
): Promise<Result<unknown, true>> => {
  const session = neo4j.session();
  try {
    const tx = session.beginTransaction();

    const videotags = await prisma.videoTag.findMany({ where: { videoId } });
    for (const { id } of videotags) {
      await updateWholeVideoTags({ prisma, tx }, id);
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
    return ok(true);
  } catch (e) {
    return err(e);
  } finally {
    await session.close();
  }
};
