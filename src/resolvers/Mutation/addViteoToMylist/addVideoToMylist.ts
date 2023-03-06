import { isErr } from "../../../utils/Result.js";
import {
  AddVideoToMylistOtherErrorMessage,
  AddVideoToMylistOtherErrorsFallback,
  MutationAuthenticationError,
  MutationInvalidMylistIdError,
  MutationInvalidVideoIdError,
  MutationMylistNotFoundError,
  MutationResolvers,
  MutationVideoNotFoundError,
  MutationWrongMylistHolderError,
  UserRole as GraphQLUserRole,
} from "../../graphql.js";
import { buildGqlId, parseGqlID2 } from "../../id.js";
import { ResolverDeps } from "../../index.js";
import { MylistRegistrationModel } from "../../MylistRegistration/model.js";
import { add } from "./add.js";
import { addVideoToMylistInNeo4j } from "./neo4j.js";

export const addVideoToMylist = ({ prisma, neo4j, logger }: Pick<ResolverDeps, "prisma" | "neo4j" | "logger">) =>
  (async (_parent, { input: { mylistId: mylistGqlId, note, videoId: videoGqlId } }, { user: ctxUser }, info) => {
    if (!ctxUser?.id)
      return {
        __typename: "MutationAuthenticationError",
        requiredRole: GraphQLUserRole.User,
      } satisfies MutationAuthenticationError;

    const mylistId = parseGqlID2("Mylist", mylistGqlId);
    if (isErr(mylistId))
      return {
        __typename: "MutationInvalidMylistIdError",
        mylistId: mylistGqlId,
      } satisfies MutationInvalidMylistIdError;

    const videoId = parseGqlID2("Video", videoGqlId);
    if (isErr(videoId))
      return {
        __typename: "MutationInvalidVideoIdError",
        videoId: videoGqlId,
      } satisfies MutationInvalidVideoIdError;

    const result = await add(prisma, {
      userId: ctxUser.id,
      mylistId: mylistId.data,
      videoId: videoId.data,
      note: note ?? null,
    });
    if (isErr(result)) {
      switch (result.error.message) {
        case "MYLIST_NOT_FOUND":
          return {
            __typename: "MutationMylistNotFoundError",
            mylistId: buildGqlId("Mylist", result.error.mylistId),
          } satisfies MutationMylistNotFoundError;
        case "MYLIST_WRONG_HOLDER":
          return {
            __typename: "MutationWrongMylistHolderError",
            mylistId: buildGqlId("Mylist", result.error.mylistId),
          } satisfies MutationWrongMylistHolderError;
        case "VIDEO_NOT_FOUND":
          return {
            __typename: "MutationVideoNotFoundError",
            videoId: buildGqlId("Video", result.error.videoId),
          } satisfies MutationVideoNotFoundError;
        case "ALREADY_REGISTERED":
          return {
            __typename: "AddVideoToMylistAlreadyRegisteredError",
            registration: new MylistRegistrationModel(result.error.registration),
          };
        case "INTERNAL_SERVER_ERROR":
          logger.error({ error: result.error.error, path: info.path }, "Something error happens");
          return {
            __typename: "AddVideoToMylistOtherErrorsFallback",
            message: AddVideoToMylistOtherErrorMessage.InternalServerError,
          } satisfies AddVideoToMylistOtherErrorsFallback;
      }
    }

    const registration = result.data;
    const neo4jResult = await addVideoToMylistInNeo4j({ prisma, neo4j }, registration.id);
    if (isErr(neo4jResult)) {
      logger.error({ error: neo4jResult.error, path: info.path }, "Failed to update in neo4j");
    }

    return {
      __typename: "AddVideoToMylistSucceededPayload",
      registration: new MylistRegistrationModel(registration),
    };
  }) satisfies MutationResolvers["addVideoToMylist"];
