import { err, ok, Result } from "../../../utils/Result.js";
import { ResolverDeps } from "../../types.js";

export const removeMylistRegistrationInNeo4j = async (
  { prisma, neo4j }: Pick<ResolverDeps, "prisma" | "neo4j">,
  registerationId: string,
): Promise<Result<unknown, true>> => {
  const session = neo4j.session();
  try {
    const tx = session.beginTransaction();

    const registration = await prisma.mylistRegistration.findUniqueOrThrow({ where: { id: registerationId } });
    tx.run(
      `
        MATCH (m:Mylist {uid: $mylist_id })
        MATCH (v:Video {uid: $video_id })
        MATCH (m)-[r:REGISTERED_TO]->(v)
        DELETE r
        `,
      { mylist_id: registration.mylistId, video_id: registration.videoId },
    );
    await tx.commit();
    return ok(true);
  } catch (e) {
    return err(e);
  } finally {
    await session.close();
  }
};
