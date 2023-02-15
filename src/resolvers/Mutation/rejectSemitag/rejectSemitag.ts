import { SemitagEventType, UserRole } from "@prisma/client";

import { Result } from "../../../utils/Result.js";
import { MutationResolvers, RejectSemitagFailedMessage } from "../../graphql.js";
import { parseGqlID2 } from "../../id.js";
import { ResolverDeps } from "../../index.js";
import { SemitagRejectingModel } from "../../Semitag/model.js";

export const reject = async (
  prisma: ResolverDeps["prisma"],
  { userId, semitagId }: { userId: string; semitagId: string }
): Promise<Result<"SEMITAG_NOT_FOUND" | "SEMITAG_ALREADY_CHECKED", { note: null }>> => {
  const check = await prisma.semitag.findUnique({ where: { id: semitagId } });
  if (!check) return { status: "error", error: "SEMITAG_NOT_FOUND" };
  if (check.isChecked) return { status: "error", error: "SEMITAG_ALREADY_CHECKED" };

  await prisma.semitag.update({
    where: { id: check.id },
    data: {
      isChecked: true,
      events: { create: { userId, type: SemitagEventType.RESOLVE, payload: {} } },
      checking: {
        create: {
          videoTagId: null,
        },
      },
    },
  });
  return {
    status: "ok",
    data: { note: null },
  };
};

export const rejectSemitag = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_, { input: { id: semitagGqlId } }, { user }) => {
    if (!user || (user?.role !== UserRole.EDITOR && user?.role !== UserRole.ADMINISTRATOR))
      return {
        __typename: "RejectSemitagFailedPayload",
        message: RejectSemitagFailedMessage.Forbidden,
      };

    const semitagId = parseGqlID2("Semitag", semitagGqlId);
    if (semitagId.status === "error")
      return {
        __typename: "RejectSemitagFailedPayload",
        message: RejectSemitagFailedMessage.InvalidSemitagId,
      };

    const result = await reject(prisma, {
      userId: user.id,
      semitagId: semitagId.data,
    });
    if (result.status === "error") {
      switch (result.error) {
        case "SEMITAG_NOT_FOUND":
          return {
            __typename: "RejectSemitagFailedPayload",
            message: RejectSemitagFailedMessage.SemitagNotFound,
          };
        case "SEMITAG_ALREADY_CHECKED":
          return {
            __typename: "RejectSemitagFailedPayload",
            message: RejectSemitagFailedMessage.SemitagAlreadyChecked,
          };
        default:
          return {
            __typename: "RejectSemitagFailedPayload",
            message: RejectSemitagFailedMessage.Unknown,
          };
      }
    }

    return {
      __typename: "RejectSemitagSucceededPayload",
      rejecting: new SemitagRejectingModel(result.data),
    };
  }) satisfies MutationResolvers["rejectSemitag"];
