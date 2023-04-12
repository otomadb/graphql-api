import { err, ok, Result } from "../../../utils/Result.js";
import { ResolverDeps } from "../../types.js";

export const addTagToMeiliSearch = async (
  { prisma, meilisearch }: Pick<ResolverDeps, "prisma" | "meilisearch">,
  tagId: string
): Promise<Result<{ type: "INTERNAL_ERROR"; error: unknown }, void>> => {
  try {
    const index = await meilisearch.getIndex<{ id: string; name: string; tag_id: string }>("tags");
    const names = await prisma.tagName.findMany({ where: { tagId } });
    await index.addDocuments(names.map(({ id, tagId, name }) => ({ id, tag_id: tagId, name })));
    return ok(undefined);
  } catch (e) {
    return err({ type: "INTERNAL_ERROR", error: e });
  }
};
