import { MutationResolvers, RegisterCategoryTagOtherErrorMessage, ResolversTypes } from "../../graphql.js";
import { TagModel } from "../../Tag/model.js";
import { ResolverDeps } from "../../types.js";
import { register } from "./register.js";

export const registerCategoryTag = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_: unknown, { input }, { currentUser: user }, info) => {
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
