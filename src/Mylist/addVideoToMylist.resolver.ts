import { GraphQLError } from "graphql";

import { parseGqlID3 } from "../resolvers/id.js";
import { likeVideoInNeo4j } from "../resolvers/Mutation/likeVideo/neo4j.js";
import { MylistRegistrationModel } from "../resolvers/MylistRegistration/model.js";
import { MkMutationResolver } from "../utils/MkResolver.js";
import { isErr } from "../utils/Result.js";

export const addVideoToMylistInNeo4j = likeVideoInNeo4j;

export const mkAddVideoToMylistResolver: MkMutationResolver<"addVideoToMylist", "prisma" | "neo4j" | "logger"> =
  ({ prisma, neo4j, logger }) =>
  async (_parent, { input: { mylistId: mylistGqlId, note, videoId: videoGqlId } }, { currentUser: ctxUser }) => {
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

    const result = await prisma.mylistRegistration
      .upsert({
        where: { mylistId_videoId: { mylistId: mylist.id, videoId } },
        create: { mylistId: mylist.id, videoId, note },
        update: { isRemoved: false, note },
      })
      .catch((e) => {
        logger.error({ error: e }, "Failed to upsert");
        throw new GraphQLError("Internal server error");
      });

    const registration = result;

    await addVideoToMylistInNeo4j({ prisma, neo4j }, registration.id);

    return {
      __typename: "AddVideoToMylistSucceededPayload",
      registration: new MylistRegistrationModel(registration),
    };
  };
