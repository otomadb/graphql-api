import { isErr } from "../../../utils/Result.js";
import { MutationResolvers, RegisterTagParentRelationOtherErrorMessage, ResolversTypes } from "../../graphql.js";
import { parseGqlID3 } from "../../id.js";
import { TagParentModel } from "../../TagParent/model.js";
import { ResolverDeps } from "../../types.js";
import { register } from "./prisma.js";

export const resolverRegisterTagParentRelation = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_: unknown, { input }, { currentUser: user }, info) => {
    const parentId = parseGqlID3("Tag", input.parentId);
    if (isErr(parentId))
      return {
        __typename: "MutationInvalidTagIdError",
        tagId: input.parentId,
      } satisfies ResolversTypes["MutationInvalidTagIdError"];

    const childId = parseGqlID3("Tag", input.childId);
    if (isErr(childId))
      return {
        __typename: "MutationInvalidTagIdError",
        tagId: input.childId,
      } satisfies ResolversTypes["MutationInvalidTagIdError"];

    const result = await register(prisma, {
      userId: user.id,
      parentId: parentId.data,
      childId: childId.data,
      isExplicit: input.explicit,
    });

    if (isErr(result)) {
      switch (result.error.type) {
        case "PARENT_TAG_NOT_FOUND":
        case "CHILD_TAG_NOT_FOUND":
          return {
            __typename: "MutationTagNotFoundError",
            tagId: result.error.tagId,
          } satisfies ResolversTypes["MutationTagNotFoundError"];
        case "ALREADY_REGISTERED":
          return {
            __typename: "RegisterTagParentRelationRelationAlreadyRegisteredError",
            relation: new TagParentModel(result.error.relation),
          } satisfies ResolversTypes["RegisterTagParentRelationRelationAlreadyRegisteredError"];
        case "EXPLICIT_RELATION":
          return {
            __typename: "RegisterTagParentRelationChildTagAlreadyHadExplicitParentError",
            relation: new TagParentModel(result.error.relation),
          } satisfies ResolversTypes["RegisterTagParentRelationChildTagAlreadyHadExplicitParentError"];
        case "UNKNOWN":
          logger.error({ error: result.error, path: info.path }, "Resolver unknown error");
          return {
            __typename: "RegisterTagParentRelationOtherErrorsFallback",
            message: RegisterTagParentRelationOtherErrorMessage.InternalServerError,
          } satisfies ResolversTypes["RegisterTagParentRelationOtherErrorsFallback"];
      }
    }

    return {
      __typename: "RegisterTagParentRelationSucceededPayload",
      relation: new TagParentModel(result.data),
    } satisfies ResolversTypes["RegisterTagParentRelationSucceededPayload"];
  }) satisfies MutationResolvers["registerTagParentRelation"];
