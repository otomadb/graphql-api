import { UserRole } from "@prisma/client";

import {
  ImplicitizeTagOtherErrorMessage,
  MutationResolvers,
  ResolversTypes,
  UserRole as GraphQLUserRole,
} from "../../graphql.js";
import { parseGqlID3 } from "../../id.js";
import { TagParentModel } from "../../TagParent/model.js";
import { ResolverDeps } from "../../types.js";
import { implicitize } from "./prisma.js";

export const resolverImplicitizeTagParent = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
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
            relation: new TagParentModel(result.error.relation),
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
      relation: TagParentModel.fromPrisma(result.data),
    } satisfies ResolversTypes["ImplicitizeTagSucceededPayload"];
  }) satisfies MutationResolvers["implicitizeTagParent"];
