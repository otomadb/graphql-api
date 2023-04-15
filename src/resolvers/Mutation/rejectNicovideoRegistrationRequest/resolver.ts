import { GraphQLError } from "graphql";

import { isErr } from "../../../utils/Result.js";
import { MutationResolvers, ResolversTypes } from "../../graphql.js";
import { parseGqlID2 } from "../../id.js";
import { NicovideoRegistrationRequestModel } from "../../NicovideoRegistrationRequest/model.js";
import { NicovideoRegistrationRequestRejectingModel } from "../../NicovideoRegistrationRequestRejecting/model.js";
import { ResolverDeps } from "../../types.js";
import { reject } from "./reject.js";

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
            request: new NicovideoRegistrationRequestModel(result.error.request),
          } satisfies ResolversTypes["RejectNicovideoRegistrationRequestReturnUnion"];
        case "INTERNAL_SERVER_ERROR":
          logger.error({ error: result.error.error, path: info.path }, "Something error happens");
          throw new GraphQLError("Something wrong");
      }
    }

    const checking = result.data;
    return {
      __typename: "RejectNicovideoRegistrationRequestSucceededPayload",
      rejecting: NicovideoRegistrationRequestRejectingModel.fromPrisma(checking),
    } satisfies ResolversTypes["RejectNicovideoRegistrationRequestReturnUnion"];
  }) satisfies MutationResolvers["rejectNicovideoRegistrationRequest"];
