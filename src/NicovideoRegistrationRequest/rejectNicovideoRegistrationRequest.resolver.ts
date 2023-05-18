import { NicovideoRegistrationRequest, NicovideoRegistrationRequestChecking } from "@prisma/client";
import { GraphQLError } from "graphql";
import { ulid } from "ulid";

import { MutationResolvers, ResolversTypes } from "../resolvers/graphql.js";
import { parseGqlID2 } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { err, isErr, ok, Result } from "../utils/Result.js";
import { NicovideoRegistrationRequestDTO, NicovideoRegistrationRequestRejectingDTO } from "./dto.js";

export const reject = async (
  prisma: ResolverDeps["prisma"],
  {
    userId,
    requestId,
    note,
  }: {
    userId: string;
    requestId: string;
    note: string;
  }
): Promise<
  Result<
    | { message: "REQUEST_NOT_FOUND"; requestId: string }
    | { message: "REQUEST_ALREADY_CHECKED"; request: NicovideoRegistrationRequest }
    | { message: "INTERNAL_SERVER_ERROR"; error: unknown },
    NicovideoRegistrationRequestChecking
  >
> => {
  try {
    const request = await prisma.nicovideoRegistrationRequest.findUnique({ where: { id: requestId } });
    if (!request) {
      return err({ message: "REQUEST_NOT_FOUND", requestId });
    } else if (request.isChecked) {
      return err({ message: "REQUEST_ALREADY_CHECKED", request });
    }

    const checkingId = ulid();
    const [checking] = await prisma.$transaction([
      prisma.nicovideoRegistrationRequestChecking.create({
        data: {
          id: checkingId,
          requestId,
          videoId: null,
          checkedById: userId,
          note,
        },
      }),
      prisma.nicovideoRegistrationRequest.update({
        where: { id: requestId },
        data: {
          isChecked: true,
          events: { create: { userId, type: "REJECT" } },
        },
      }),
      prisma.notification.create({
        data: {
          notifyToId: request.requestedById,
          type: "REJECTING_NICOVIDEO_REGISTRATION_REQUEST",
          payload: { id: checkingId },
        },
      }),
    ]);

    return ok(checking);
  } catch (e) {
    return err({ message: "INTERNAL_SERVER_ERROR", error: e });
  }
};

export const resolverRejectRequestNicovideoRegistration = ({
  prisma,
  logger,
}: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_, { input: { requestId: requestGqlId, note } }, { currentUser: user }, info) => {
    const requestId = parseGqlID2("NicovideoRegistrationRequest", requestGqlId);
    if (isErr(requestId)) {
      return {
        __typename: "MutationNicovideoRegistrationRequestNotFoundError",
        requestId: requestGqlId,
      } satisfies ResolversTypes["RejectNicovideoRegistrationRequestReturnUnion"];
    }

    const result = await reject(prisma, { userId: user.id, requestId: requestId.data, note });
    if (isErr(result)) {
      switch (result.error.message) {
        case "REQUEST_NOT_FOUND":
          return {
            __typename: "MutationNicovideoRegistrationRequestNotFoundError",
            requestId: result.error.requestId,
          } satisfies ResolversTypes["RejectNicovideoRegistrationRequestReturnUnion"];
        case "REQUEST_ALREADY_CHECKED":
          return {
            __typename: "RejectNicovideoRegistrationRequestRequestAlreadyCheckedError",
            request: new NicovideoRegistrationRequestDTO(result.error.request),
          } satisfies ResolversTypes["RejectNicovideoRegistrationRequestReturnUnion"];
        case "INTERNAL_SERVER_ERROR":
          logger.error({ error: result.error.error, path: info.path }, "Something error happens");
          throw new GraphQLError("Internal server error");
      }
    }

    const checking = result.data;
    return {
      __typename: "RejectNicovideoRegistrationRequestSucceededPayload",
      rejecting: NicovideoRegistrationRequestRejectingDTO.fromPrisma(checking),
    } satisfies ResolversTypes["RejectNicovideoRegistrationRequestReturnUnion"];
  }) satisfies MutationResolvers["rejectNicovideoRegistrationRequest"];
