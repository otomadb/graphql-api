import { UserRole } from "@prisma/client";

import {
  MutationResolvers,
  RegisterCategoryTagOtherErrorMessage,
  ResolversTypes,
  UserRole as GqlUserRole,
} from "../../graphql.js";
import { TagModel } from "../../Tag/model.js";
import { ResolverDeps } from "../../types.js";
import { register } from "./register.js";

export const registerCategoryTag = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_: unknown, { input }, { currentUser: user }, info) => {
    if (!user || user.role !== UserRole.ADMINISTRATOR)
      return {
        __typename: "MutationAuthenticationError",
        requiredRole: GqlUserRole.Administrator,
      } satisfies ResolversTypes["MutationAuthenticationError"];

    const result = await register(prisma, {
      userId: user.id,
      primaryName: input.primaryName,
    });

    if (result.status === "error") {
      switch (result.error.type) {
        case "UNKNOWN":
          logger.error({ error: result.error, path: info.path }, "Resolver unknown error");
          return {
            __typename: "RegisterCategoryTagOtherErrorsFallback",
            message: RegisterCategoryTagOtherErrorMessage.InternalServerError,
          } satisfies ResolversTypes["RegisterCategoryTagOtherErrorsFallback"];
      }
    }

    const tag = result.data;

    return {
      __typename: "RegisterCategoryTagSucceededPayload",
      tag: new TagModel(tag),
    } satisfies ResolversTypes["RegisterCategoryTagSucceededPayload"];
  }) satisfies MutationResolvers["registerCategoryTag"];
