import { TagParent } from "@prisma/client";

import { ExplicitizeTagOtherErrorMessage, MutationResolvers, ResolversTypes } from "../resolvers/graphql.js";
import { parseGqlID3 } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { err, ok, Result } from "../utils/Result.js";
import { TagParentDTO } from "./dto.js";

export const explicitize = async (
  prisma: ResolverDeps["prisma"],
  { userId, relationId }: { userId: string; relationId: string },
): Promise<
  Result<
    | { type: "UNKNOWN"; error: unknown }
    | { type: "NOT_EXISTS"; id: string }
    | { type: "IS_EXPLICIT"; relation: TagParent },
    TagParent
  >
> => {
  try {
    const exists = await prisma.tagParent.findUnique({
      where: { id: relationId },
    });
    if (!exists) return err({ type: "NOT_EXISTS", id: relationId });
    if (exists.isExplicit) return err({ type: "IS_EXPLICIT", relation: exists });

    const updated = await prisma.tagParent.update({
      where: { id: exists.id },
      data: {
        isExplicit: true,
        events: { create: { type: "SET_PRIMARY", userId, payload: {} } },
      },
    });
    return ok(updated);
  } catch (e) {
    return err({ type: "UNKNOWN", error: e });
  }
};

export const resolverExplicitizeTagParent = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_parent, { input: { relationId: relationGqlId } }, { currentUser: ctxUser }, info) => {
    const relationId = parseGqlID3("TagParent", relationGqlId);
    if (relationId.status === "error") {
      return {
        __typename: "MutationInvalidTagParentIdError",
        relationId: relationGqlId,
      } satisfies ResolversTypes["MutationInvalidTagParentIdError"];
    }

    const result = await explicitize(prisma, {
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
        case "IS_EXPLICIT":
          return {
            __typename: "ExplicitizeTagAlreadyExplicitError",
            already: new TagParentDTO(result.error.relation),
          } satisfies ResolversTypes["ExplicitizeTagAlreadyExplicitError"];
        case "UNKNOWN":
          logger.error({ error: result.error.error, path: info.path }, "Something error happens");
          return {
            __typename: "ExplicitizeTagOtherErrorsFallback",
            message: ExplicitizeTagOtherErrorMessage.InternalServerError,
          } satisfies ResolversTypes["ExplicitizeTagOtherErrorsFallback"];
      }
    }

    return {
      __typename: "ExplicitizeTagSucceededPayload",
      relation: TagParentDTO.fromPrisma(result.data),
    } satisfies ResolversTypes["ExplicitizeTagSucceededPayload"];
  }) satisfies MutationResolvers["explicitizeTagParent"];
