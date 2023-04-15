import { TransactionPromise } from "neo4j-driver-core";

import { err, ok, Result } from "../../../utils/Result.js";
import { ResolverDeps } from "../../types.js";

// VideoTagのVideoのタグ全てについて更新を掛けている
export const updateWholeVideoTags = async (
  { prisma, tx }: Pick<ResolverDeps, "prisma"> & { tx: TransactionPromise },
  videotagId: string
) =>
  prisma.videoTag
    .findUniqueOrThrow({ where: { id: videotagId }, select: { video: { include: { tags: true } } } })
    .then(({ video }) =>
      video.tags.map(({ videoId, tagId }) =>
        tx.run(
          `
          MERGE (t:Tag {uid: $tag_id})
          MERGE (v:Video {uid: $video_id})
          MERGE (t)-[r:TAGGED_TO]->(v)
          RETURN r
          `,
          { tag_id: tagId, video_id: videoId }
        )
      )
    );

export const resolve = async (
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
