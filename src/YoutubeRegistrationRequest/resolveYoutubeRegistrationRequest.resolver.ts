import { GraphQLError } from "graphql";

import { parseGqlID3 } from "../resolvers/id.js";
import { MkMutationResolver } from "../utils/MkResolver.js";
import { isErr } from "../utils/Result.js";
import { YoutubeVideoSourceDTO } from "../YoutubeVideoSource/dto.js";
import { YoutubeRegistrationRequestDTO } from "./YoutubeRegistrationRequest.dto.js";

export const mkResolveYoutubeRegistrationRequestResolver: MkMutationResolver<
  "resolveYoutubeRegistrationRequest",
  "prisma" | "logger" | "TimelineEventService"
> =
  ({ logger, prisma, TimelineEventService }) =>
  async (_, { input: { madId: unparsedMadID, requestId: unparsedRequestId } }, { currentUser: { id: ctxUserId } }) => {
    const parsedMadId = parseGqlID3("Video", unparsedMadID);
    if (isErr(parsedMadId)) {
      logger.error({ e: parsedMadId.error, madId: parsedMadId }, "Invalid madID");
      throw new GraphQLError("Invalid madID");
    }

    const parsedRequestId = parseGqlID3("YoutubeRegistrationRequest", unparsedRequestId);
    if (isErr(parsedRequestId)) {
      logger.error({ e: parsedRequestId.error, requestId: parsedRequestId }, "Invalid requestId");
      throw new GraphQLError("Invalid requestId");
    }

    const madId = parsedMadId.data;

    const req = await prisma.youtubeRegistrationRequest.findUnique({
      where: { id: parsedRequestId.data, isChecked: false },
    });
    if (!req) {
      logger.error({ requestId: parsedRequestId.data }, "request not found");
      throw new GraphQLError("Request not found");
    }

    const [requestChecking] = await prisma
      .$transaction([
        prisma.youtubeRegistrationRequestChecking.create({
          data: {
            checkedBy: { connect: { id: ctxUserId } },
            request: { connect: { id: req.id } },
            videoSource: {
              create: {
                events: { create: { type: "CREATE", userId: ctxUserId, payload: {} } },
                sourceId: req.sourceId,
                videoId: madId,
              },
            },
            notification: {
              create: {
                notifyToId: req.requestedById,
                type: "RESOLVING_YOUTUBE_REGISTRATION_REQUEST",
                payload: {},
              },
            },
            resolved: true,
          },
          include: { request: true, videoSource: true },
        }),
      ])
      .catch((e) => {
        logger.error({ e }, "Error on transaction");
        throw new GraphQLError("Internal server error");
      });

    await TimelineEventService.clearAll();

    if (!requestChecking.videoSource) {
      // TODO: ここに辿り着くはずは無いのだが，一応．
      logger.error({ requestChecking }, "requestChecking.videoSource must be defined but it's not.");
      throw new GraphQLError("Internal server error");
    }

    return {
      __typename: "ResolveYoutubeRegistrationRequestSuccess",
      request: YoutubeRegistrationRequestDTO.fromPrisma(requestChecking.request),
      source: YoutubeVideoSourceDTO.fromPrisma(requestChecking.videoSource),
    };
  };
