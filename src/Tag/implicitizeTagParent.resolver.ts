import { TagParent } from "@prisma/client";

import { ImplicitizeTagOtherErrorMessage, MutationResolvers, ResolversTypes } from "../resolvers/graphql.js";
import { parseGqlID3 } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { err, ok, Result } from "../utils/Result.js";
import { TagParentDTO } from "./dto.js";

export const implicitize = async (
  prisma: ResolverDeps["prisma"],
  { userId, relationId }: { userId: string; relationId: string },
): Promise<
  Result<
    | { type: "UNKNOWN"; error: unknown }
    | { type: "NOT_EXISTS"; id: string }
    | { type: "IS_IMPLICIT"; relation: TagParent },
    TagParent
  >
> => {
  try {
    const exists = await prisma.tagParent.findUnique({
      where: { id: relationId },
    });
    if (!exists) return err({ type: "NOT_EXISTS", id: relationId });
    if (!exists.isExplicit) return err({ type: "IS_IMPLICIT", relation: exists });

    const updated = await prisma.tagParent.update({
      where: { id: exists.id },
      data: {
        isExplicit: false,
        events: { create: { type: "UNSET_PRIMARY", userId, payload: {} } },
      },
    });
    return ok(updated);
  } catch (e) {
    return err({ type: "UNKNOWN", error: e });
  }
};

export const resolverImplicitizeTagParent = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_parent, { input: { relationId: relationGqlId } }, { currentUser: ctxUser }, info) => {
    const relationId = parseGqlID3("TagParent", relationGqlId);
    if (relationId.status === "error") {
      return {
        __typename: "MutationInvalidTagParentIdError",
        relationId: relationGqlId,
      } satisfies ResolversTypes["MutationInvalidTagParentIdError"];
    }

    const result = await implicitize(prisma, {
      userId: ctxUser.id,
      relationId: relationId.data,
    });
    if (result.status === "error") {
      switch (result.error.type) {
        case "NOT_EXISTS":
          return {
            __typename: "MutationTagParentNotFoundError",
            relationId: relationGqlId,
          } satisfies ResolversTypes["MutationTagParentNotFoundError"];
        case "IS_IMPLICIT":
          return {
            __typename: "ImplicitizeTagAlreadyImplicitError",
            relation: new TagParentDTO(result.error.relation),
          } satisfies ResolversTypes["ImplicitizeTagAlreadyImplicitError"];
        case "UNKNOWN":
          logger.error({ error: result.error.error, path: info.path }, "Something error happens");
          return {
            __typename: "ImplicitizeTagOtherErrorsFallback",
            message: ImplicitizeTagOtherErrorMessage.InternalServerError,
          } satisfies ResolversTypes["ImplicitizeTagOtherErrorsFallback"];
      }
    }

    return {
      __typename: "ImplicitizeTagSucceededPayload",
      relation: TagParentDTO.fromPrisma(result.data),
    } satisfies ResolversTypes["ImplicitizeTagSucceededPayload"];
  }) satisfies MutationResolvers["implicitizeTagParent"];
