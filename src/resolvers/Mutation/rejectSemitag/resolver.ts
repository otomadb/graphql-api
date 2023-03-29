import { UserRole } from "@prisma/client";

import { isErr } from "../../../utils/Result.js";
import {
  MutationResolvers,
  RejectSemitagOtherErrorsFallbackMessage,
  ResolversTypes,
  UserRole as GqlUserRole,
} from "../../graphql.js";
import { parseGqlID2 } from "../../id.js";
import { SemitagModel, SemitagRejectingModel } from "../../Semitag/model.js";
import { ResolverDeps } from "../../types.js";
import { reject } from "./prisma.js";

export const resolverRejectSemitag = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_, { semitagId: semitagGqlId }, { user }) => {
    if (!user || (user?.role !== UserRole.EDITOR && user?.role !== UserRole.ADMINISTRATOR))
      return {
        __typename: "MutationAuthenticationError",
        requiredRole: GqlUserRole.Editor,
      } satisfies ResolversTypes["RejectSemitagReturnUnion"];

    const semitagId = parseGqlID2("Semitag", semitagGqlId);
    if (isErr(semitagId))
      return {
        __typename: "MutationInvalidSemitagIdError",
        semitagId: semitagGqlId,
      } satisfies ResolversTypes["RejectSemitagReturnUnion"];

    const result = await reject(prisma, {
      userId: user.id,
      semitagId: semitagId.data,
    });
    if (isErr(result)) {
      switch (result.error.type) {
        case "SEMITAG_NOT_FOUND":
          return {
            __typename: "MutationSemitagNotFoundError",
            semitagId: semitagGqlId,
          } satisfies ResolversTypes["RejectSemitagReturnUnion"];
        case "SEMITAG_ALREADY_CHECKED":
          return {
            __typename: "MutationSemitagAlreadyCheckedError",
            semitag: SemitagModel.fromPrisma(result.error.semitag),
          } satisfies ResolversTypes["RejectSemitagReturnUnion"];
        case "INTERNAL_SERVER_ERROR":
          return {
            __typename: "RejectSemitagOtherErrorsFallback",
            message: RejectSemitagOtherErrorsFallbackMessage.InternalServerError,
          } satisfies ResolversTypes["RejectSemitagReturnUnion"];
      }
    }

    return {
      __typename: "RejectSemitagSucceededPayload",
      rejecting: new SemitagRejectingModel(result.data),
    } satisfies ResolversTypes["RejectSemitagReturnUnion"];
  }) satisfies MutationResolvers["rejectSemitag"];
