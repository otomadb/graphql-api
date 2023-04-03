import { UserRole } from "@prisma/client";

import {
  ExplicitizeTagOtherErrorMessage,
  MutationResolvers,
  ResolversTypes,
  UserRole as GraphQLUserRole,
} from "../../graphql.js";
import { parseGqlID3 } from "../../id.js";
import { TagParentModel } from "../../TagParent/model.js";
import { ResolverDeps } from "../../types.js";
import { explicitize } from "./prisma.js";

export const resolverExplicitizeTagParent = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_parent, { input: { relationId: relationGqlId } }, { currentUser: ctxUser }, info) => {
    if (!ctxUser || (ctxUser.role !== UserRole.EDITOR && ctxUser.role !== UserRole.ADMINISTRATOR))
      return {
        __typename: "MutationAuthenticationError",
        requiredRole: GraphQLUserRole.User,
      } as const;

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
            already: new TagParentModel(result.error.relation),
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
      relation: TagParentModel.fromPrisma(result.data),
    } satisfies ResolversTypes["ExplicitizeTagSucceededPayload"];
  }) satisfies MutationResolvers["explicitizeTagParent"];
