import { err, ok } from "../../../utils/Result.js";
import { ResolverDeps } from "../../index.js";
import { updateWholeVideoTags } from "../resolveSemitag/neo4j.js";

export const addTagToVideoInNeo4j = async (
  { prisma, neo4j }: Pick<ResolverDeps, "prisma" | "neo4j">,
  videotagId: string
) => {
  const session = neo4j.session();
  try {
    const tx = session.beginTransaction();
    await updateWholeVideoTags({ prisma, tx }, videotagId);
    await tx.commit();
    return ok(true);
  } catch (e) {
    return err(e);
  } finally {
    await session.close();
  }
};
