import { UserRole } from "@prisma/client";
import { GraphQLError } from "graphql";

import { ensureContextUser } from "../../ensureContextUser.js";
import { MutationResolvers } from "../../graphql.js";
import { parseGqlID } from "../../id.js";
import { ResolverDeps } from "../../index.js";
import { MylistRegistrationModel } from "../../MylistRegistration/model.js";

export const addMylistRegistrationInNeo4j = async (
  neo4j: ResolverDeps["neo4j"],
  { mylistId, videoId }: { videoId: string; mylistId: string }
) => {
  const session = neo4j.session();
  try {
    await session.run(
      `
        MERGE (l:Mylist {id: $mylist_id })
        MERGE (v:Video {id: $video_id })
        MERGE (l)-[r:CONTAINS_VIDEO]->(v)
        RETURN r
        `,
      { mylist_id: mylistId, video_id: videoId }
    );
  } finally {
    await session.close();
  }
};

export const likeVideo = ({ prisma, neo4j }: Pick<ResolverDeps, "prisma" | "neo4j">) =>
  ensureContextUser(prisma, UserRole.NORMAL, async (_parent, { input: { videoId: videoGqlId } }, { userId }) => {
    const videoId = parseGqlID("Video", videoGqlId);

    const likelist = await prisma.mylist
      .findFirstOrThrow({ where: { holder: { id: userId }, isLikeList: true } })
      .catch(() => {
        throw new GraphQLError(`like list for "${userId}" is not found`);
      });
    const registration = await prisma.mylistRegistration.create({
      data: { note: null, videoId, mylistId: likelist.id },
    });
    await addMylistRegistrationInNeo4j(neo4j, { videoId: registration.videoId, mylistId: registration.mylistId });

    return { registration: new MylistRegistrationModel(registration) };
  }) satisfies MutationResolvers["likeVideo"];
