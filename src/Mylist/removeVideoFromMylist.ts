import { GraphQLError } from "graphql";

import { parseGqlID3 } from "../resolvers/id.js";
import { MylistModel } from "../resolvers/Mylist/model.js";
import { ResolverDeps } from "../resolvers/types.js";
import { MkMutationResolver } from "../utils/MkResolver.js";
import { err, ok, Result } from "../utils/Result.js";
import { isErr } from "../utils/Result.js";
import { VideoDTO } from "../Video/dto.js";

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

export const mkRemoveVideoFromMylistResolver: MkMutationResolver<
  "removeVideoFromMylist",
  "prisma" | "neo4j" | "logger"
> =
  ({ prisma, neo4j, logger }) =>
  async (_, { input: { mylistId: mylistGqlId, videoId: videoGqlId } }, { currentUser: ctxUser }) => {
    const parsedMylistId = parseGqlID3("Mylist", mylistGqlId);
    if (isErr(parsedMylistId)) {
      logger.error({ error: parsedMylistId.error }, "Invalid Mylist ID");
      throw new GraphQLError("Invalid Mylist ID");
    }

    const parsedVideoId = parseGqlID3("Video", videoGqlId);
    if (isErr(parsedVideoId)) {
      logger.error({ error: parsedVideoId.error }, "Invalid Video ID");
      throw new GraphQLError("Invalid Video ID");
    }

    const videoId = parsedVideoId.data;
    const mylist = await prisma.mylist
      .findUniqueOrThrow({ where: { id: parsedMylistId.data }, select: { id: true, holderId: true } })
      .catch((e) => {
        logger.error({ error: e }, "Mylist not found");
        throw new GraphQLError("Mylist not found");
      });
    if (mylist.holderId !== ctxUser.id) {
      logger.error({}, "Not mylist holder");
      throw new GraphQLError("This mylist holder is not you");
    }

    const registration = await prisma.mylistRegistration.update({
      where: {
        mylistId_videoId: { mylistId: mylist.id, videoId },
      },
      data: { isRemoved: true },
      include: { video: true, mylist: true },
    });

    await removeMylistRegistrationInNeo4j({ prisma, neo4j }, registration.id);

    return {
      __typename: "RemoveVideoFromMylistSucceededPayload",
      video: new VideoDTO(registration.video),
      mylist: new MylistModel(registration.mylist),
    };
  };
