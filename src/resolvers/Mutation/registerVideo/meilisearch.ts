import { err, ok, Result } from "../../../utils/Result.js";
import { ResolverDeps } from "../../types.js";

export const addVideoToMeiliSearch = async (
  { prisma, meilisearch }: Pick<ResolverDeps, "prisma" | "meilisearch">,
  videoId: string
): Promise<Result<{ type: "INTERNAL_ERROR"; error: unknown }, void>> => {
  try {
    const index = await meilisearch.getIndex<{ id: string; title: string; video_id: string }>("videos");
    const titles = await prisma.videoTitle.findMany({ where: { videoId } });
    await index.addDocuments(titles.map(({ id, videoId, title }) => ({ id, video_id: videoId, title })));
    return ok(undefined);
  } catch (e) {
    return err({ type: "INTERNAL_ERROR", error: e });
  }
};
