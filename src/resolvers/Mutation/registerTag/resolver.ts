import { isErr, ok } from "../../../utils/Result.js";
import { MutationResolvers, RegisterTagOtherErrorsFallbackMessage, ResolversTypes } from "../../graphql.js";
import { buildGqlId, parseGqlID3, parseGqlIDs3 } from "../../id.js";
import { TagModel } from "../../Tag/model.js";
import { ResolverDeps } from "../../types.js";
import { addTagToMeiliSearch } from "./meilisearch.js";
import { registerTagInNeo4j } from "./neo4j.js";
import { register } from "./prisma.js";

export const resolverRegisterTag = ({
  prisma,
  neo4j,
  logger,
  meilisearch,
}: Pick<ResolverDeps, "prisma" | "neo4j" | "logger" | "meilisearch">) =>
  (async (_: unknown, { input }, { currentUser: user }, info) => {
    const explicitParentId = input.explicitParent ? parseGqlID3("Tag", input.explicitParent) : ok(null);
    if (isErr(explicitParentId))
      return {
        __typename: "MutationInvalidTagIdError",
        tagId: explicitParentId.error.invalidId,
      } satisfies ResolversTypes["MutationInvalidTagIdError"];

    const implicitParentIds = parseGqlIDs3("Tag", input.implicitParents);
    if (isErr(implicitParentIds)) {
      switch (implicitParentIds.error.type) {
        case "DUPLICATED":
          return {
            __typename: "RegisterTagImplicitParentIdsDuplicatedError",
            tagId: implicitParentIds.error.duplicatedId,
          } satisfies ResolversTypes["RegisterTagImplicitParentIdsDuplicatedError"];
        case "INVALID_ID":
          return {
            __typename: "MutationInvalidTagIdError",
            tagId: implicitParentIds.error.invalidId,
          } satisfies ResolversTypes["MutationInvalidTagIdError"];
      }
    }

    const resolveSemitags = parseGqlIDs3("Semitag", input.resolveSemitags);
    if (isErr(resolveSemitags)) {
      switch (resolveSemitags.error.type) {
        case "DUPLICATED":
          return {
            __typename: "RegisterTagResolveSemitagIdsDuplicatedError",
            semitagId: resolveSemitags.error.duplicatedId,
          } satisfies ResolversTypes["RegisterTagResolveSemitagIdsDuplicatedError"];
        case "INVALID_ID":
          return {
            __typename: "MutationInvalidSemitagIdError",
            semitagId: resolveSemitags.error.invalidId,
          } satisfies ResolversTypes["MutationInvalidSemitagIdError"];
      }
    }

    if (explicitParentId.data && implicitParentIds.data.includes(explicitParentId.data)) {
      return {
        __typename: "RegisterTagTagIdCollidedBetweenExplicitAndImplicitError",
        tagId: buildGqlId("Tag", explicitParentId.data),
      } satisfies ResolversTypes["RegisterTagTagIdCollidedBetweenExplicitAndImplicitError"];
    }

    const result = await register(prisma, {
      userId: user.id,
      primaryName: input.primaryName,
      extraNames: input.extraNames,
      explicitParentId: explicitParentId.data,
      implicitParentIds: implicitParentIds.data,
      semitagIds: resolveSemitags.data,
    });

    if (isErr(result)) {
      switch (result.error.type) {
        case "TAG_NOT_FOUND":
          return {
            __typename: "MutationTagNotFoundError",
            tagId: result.error.id,
          } satisfies ResolversTypes["MutationTagNotFoundError"];
        case "SEMITAG_NOT_FOUND":
          return {
            __typename: "MutationSemitagNotFoundError",
            semitagId: result.error.id,
          } satisfies ResolversTypes["MutationSemitagNotFoundError"];
        case "SEMITAG_ALREADY_CHECKED":
          return {
            __typename: "RegisterTagResolveSemitagAlreadyCheckedError",
            semitagId: result.error.id,
          } satisfies ResolversTypes["RegisterTagResolveSemitagAlreadyCheckedError"];
        case "UNKNOWN":
          logger.error({ error: result.error, path: info.path }, "Resolver unknown error");
          return {
            __typename: "RegisterTagOtherErrorsFallback",
            message: RegisterTagOtherErrorsFallbackMessage.Unknown,
          } satisfies ResolversTypes["RegisterTagOtherErrorsFallback"];
      }
    }

    const tag = result.data;
    const neo4jResult = await registerTagInNeo4j({ prisma, neo4j }, tag.id);
    if (isErr(neo4jResult)) {
      logger.error({ error: neo4jResult.error, path: info.path }, "Failed to update in neo4j");
    }

    const meilisearchResult = await addTagToMeiliSearch({ prisma, meilisearch }, tag.id);
    if (isErr(meilisearchResult)) {
      logger.error({ error: meilisearchResult.error, path: info.path }, "Failed to add in meilisearch");
    }

    return {
      __typename: "RegisterTagSucceededPayload",
      tag: new TagModel(tag),
    } satisfies ResolversTypes["RegisterTagSucceededPayload"];
  }) satisfies MutationResolvers["registerTag"];
