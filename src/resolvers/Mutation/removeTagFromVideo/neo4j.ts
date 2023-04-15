import { err, ok, Result } from "../../../utils/Result.js";
import { ResolverDeps } from "../../types.js";
import { updateWholeVideoTags } from "../resolveSemitag/neo4j.js";

export const removeInNeo4j = async (
  { prisma, neo4j }: Pick<ResolverDeps, "neo4j" | "prisma">,
  videotagId: string
): Promise<Result<unknown, true>> => {
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
