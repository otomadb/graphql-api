import { TransactionPromise } from "neo4j-driver-core";

import { err, ok, Result } from "../../../utils/Result.js";
import { ResolverDeps } from "../../index.js";

export const updateRegisterationInNeo4j = async (
  { prisma, tx }: Pick<ResolverDeps, "prisma"> & { tx: TransactionPromise },
  registerationId: string
) =>
  prisma.mylistRegistration.findUniqueOrThrow({ where: { id: registerationId } }).then(({ mylistId, videoId }) => {
    tx.run(
      `
      MERGE (l:Mylist {id: $mylist_id })
      MERGE (v:Video {id: $video_id })
      MERGE (l)-[r:CONTAINS_VIDEO]->(v)
      RETURN r
      `,
      { mylist_id: mylistId, video_id: videoId }
    );
  });

export const likeVideoInNeo4j = async (
  { prisma, neo4j }: Pick<ResolverDeps, "prisma" | "neo4j">,
  registerationId: string
): Promise<Result<unknown, true>> => {
  const session = neo4j.session();
  try {
    const tx = session.beginTransaction();
    await updateRegisterationInNeo4j({ prisma, tx }, registerationId);
    await tx.commit();
    return ok(true);
  } catch (e) {
    return err(e);
  } finally {
    await session.close();
  }
};
