import { UserRole } from "@prisma/client";

import {
  MutationResolvers,
  RejectNicovideoRegistrationRequestOtherErrorMessage,
  UserRole as GraphQLUserRole,
} from "../../graphql.js";
import { ResolverDeps } from "../../index.js";
import { NicovideoRegistrationRequestModel } from "../../NicovideoRegistrationRequest/model.js";
import { NicovideoRegistrationRequestRejectingModel } from "../../NicovideoRegistrationRequestRejecting/model.js";
import { reject } from "./reject.js";

export const resolverRejectRequestNicovideoRegistration = ({
  prisma,
  logger,
}: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_, { input: { requestId, note } }, { user }, info) => {
    if (!user || (user.role !== UserRole.EDITOR && user.role !== UserRole.ADMINISTRATOR))
      return {
        __typename: "MutationAuthenticationError",
        requiredRole: GraphQLUserRole.Editor,
      } as const;

    const result = await reject(prisma, { userId: user.id, requestId, note });
    if (result.status === "error") {
      switch (result.error.message) {
        case "REQUEST_NOT_FOUND":
          return {
            __typename: "RejectNicovideoRegistrationRequestRequestNotFoundError",
            requestId: result.error.requestId,
          } as const;
        case "REQUEST_ALREADY_CHECKED":
          return {
            __typename: "RejectNicovideoRegistrationRequestRequestAlreadyCheckedError",
            request: new NicovideoRegistrationRequestModel(result.error.request),
          } as const;
        case "INTERNAL_SERVER_ERROR":
          logger.error({ error: result.error.error, path: info.path }, "Something error happens");
          return {
            __typename: "RejectNicovideoRegistrationRequestOtherErrorsFallback",
            message: RejectNicovideoRegistrationRequestOtherErrorMessage.InternalServerError,
          } as const;
      }
    }

    const checking = result.data;
    return {
      __typename: "RejectNicovideoRegistrationRequestSucceededPayload",
      rejecting: new NicovideoRegistrationRequestRejectingModel(checking),
    } as const;
  }) satisfies MutationResolvers["rejectNicovideoRegistrationRequest"];
