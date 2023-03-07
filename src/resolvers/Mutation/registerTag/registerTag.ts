import { UserRole } from "@prisma/client";

import { isErr } from "../../../utils/Result.js";
import { MutationResolvers, RegisterTagFailedMessage, ResolversTypes } from "../../graphql.js";
import { parseGqlID2, parseGqlIDs2 } from "../../id.js";
import { ResolverDeps } from "../../index.js";
import { TagModel } from "../../Tag/model.js";
import { registerTagInNeo4j } from "./neo4j.js";
import { register } from "./prisma";

export const resolverRegisterTag = ({ prisma, neo4j, logger }: Pick<ResolverDeps, "prisma" | "neo4j" | "logger">) =>
  (async (_: unknown, { input }, { user }, info) => {
    if (!user || (user.role !== UserRole.EDITOR && user.role !== UserRole.ADMINISTRATOR))
      return {
        __typename: "RegisterTagFailedPayload",
        message: RegisterTagFailedMessage.Forbidden,
      } satisfies ResolversTypes["RegisterTagFailedPayload"];

    const explicitParent = input.explicitParent ? parseGqlID2("Tag", input.explicitParent) : null;
    if (explicitParent && isErr(explicitParent))
      return {
        __typename: "RegisterTagFailedPayload",
        message: RegisterTagFailedMessage.InvalidTagId, // TODO: 詳細なエラーを返すようにする
      } satisfies ResolversTypes["RegisterTagFailedPayload"];

    const resolveSemitags = parseGqlIDs2("Semitag", input.resolveSemitags);
    if (resolveSemitags && isErr(resolveSemitags))
      return {
        __typename: "RegisterTagFailedPayload",
        message: RegisterTagFailedMessage.InvalidSemitagId, // TODO: 詳細なエラーを返すようにする
      } satisfies ResolversTypes["RegisterTagFailedPayload"];

    const result = await register(prisma, {
      userId: user.id,
      explicitParentId: explicitParent ? explicitParent.data : null,
      implicitParentIds: [],
      semitagIds: resolveSemitags.data,
      primaryName: input.primaryName,
      extraNames: input.extraNames,
      meaningless: input.meaningless,
    });

    if (isErr(result)) {
      switch (result.error.type) {
        case "COLLIDE_BETWEEN_EXPLICIT_PARENT_AND_IMPLICIT_PARENTS":
          return {
            __typename: "RegisterTagFailedPayload",
            message: RegisterTagFailedMessage.InvalidTagId,
          } satisfies ResolversTypes["RegisterTagFailedPayload"];
        case "DUPLICATE_IN_IMPLICIT_PARENTS":
          return {
            __typename: "RegisterTagFailedPayload",
            message: RegisterTagFailedMessage.InvalidTagId,
          } satisfies ResolversTypes["RegisterTagFailedPayload"];
        case "UNKNOWN":
          logger.error({ error: result.error, path: info.path }, "Resolver unknown error");
          return {
            __typename: "RegisterTagFailedPayload",
            message: RegisterTagFailedMessage.Unknown,
          } satisfies ResolversTypes["RegisterTagFailedPayload"];
        default:
          return {
            __typename: "RegisterTagFailedPayload",
            message: RegisterTagFailedMessage.Unknown,
          } satisfies ResolversTypes["RegisterTagFailedPayload"];
      }
    }

    const tag = result.data;
    const neo4jResult = await registerTagInNeo4j({ prisma, neo4j }, tag.id);
    if (isErr(neo4jResult)) {
      logger.error({ error: neo4jResult.error, path: info.path }, "Failed to update in neo4j");
    }

    return {
      __typename: "RegisterTagSucceededPayload",
      tag: new TagModel(tag),
    } satisfies ResolversTypes["RegisterTagSucceededPayload"];
  }) satisfies MutationResolvers["registerTag"];
