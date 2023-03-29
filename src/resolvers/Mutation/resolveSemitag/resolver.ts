import { UserRole } from "@prisma/client";

import { isErr } from "../../../utils/Result.js";
import {
  MutationResolvers,
  ResolversTypes,
  ResolveSemitagOtherErrorsFallbackMessage,
  UserRole as GqlUserRole,
} from "../../graphql.js";
import { parseGqlID3 } from "../../id.js";
import { SemitagModel, SemitagResolvingModel } from "../../Semitag/model.js";
import { ResolverDeps } from "../../types.js";
import { VideoTagModel } from "../../VideoTag/model.js";
import { resolve as resolveSemitagInNeo4j } from "./neo4j.js";
import { resolve } from "./prisma.js";

export const resolverResolveSemitag = ({ prisma, logger, neo4j }: Pick<ResolverDeps, "prisma" | "neo4j" | "logger">) =>
  (async (_, { semitagId: semitagGqlId, tagId: tagGqlId }, { user }, info) => {
    if (!user || (user?.role !== UserRole.EDITOR && user?.role !== UserRole.ADMINISTRATOR))
      return {
        __typename: "MutationAuthenticationError",
        requiredRole: GqlUserRole.Editor,
      } satisfies ResolversTypes["ResolveSemitagReturnUnion"];

    const semitagId = parseGqlID3("Semitag", semitagGqlId);
    if (isErr(semitagId))
      return {
        __typename: "MutationInvalidSemitagIdError",
        semitagId: semitagId.error.invalidId,
      } satisfies ResolversTypes["ResolveSemitagReturnUnion"];

    const tagId = parseGqlID3("Tag", tagGqlId);
    if (isErr(tagId))
      return {
        __typename: "MutationInvalidTagIdError",
        tagId: tagId.error.invalidId,
      } satisfies ResolversTypes["ResolveSemitagReturnUnion"];

    const result = await resolve(prisma, {
      userId: user.id,
      semitagId: semitagId.data,
      tagId: tagId.data,
    });
    if (isErr(result)) {
      switch (result.error.type) {
        case "INTERNAL_SERVER_ERROR":
          return {
            __typename: "ResolveSemitagOtherErrorsFallback",
            message: ResolveSemitagOtherErrorsFallbackMessage.InternalServerError,
          } satisfies ResolversTypes["ResolveSemitagReturnUnion"];
        case "SEMITAG_NOT_FOUND":
          return {
            __typename: "MutationSemitagNotFoundError",
            semitagId: result.error.semitagId,
          } satisfies ResolversTypes["ResolveSemitagReturnUnion"];
        case "SEMITAG_ALREADY_CHECKED":
          return {
            __typename: "MutationSemitagAlreadyCheckedError",
            semitag: SemitagModel.fromPrisma(result.error.semitag),
          } satisfies ResolversTypes["ResolveSemitagReturnUnion"];
        case "TAG_NOT_FOUND":
          return {
            __typename: "MutationTagNotFoundError",
            tagId: result.error.tagId,
          } satisfies ResolversTypes["ResolveSemitagReturnUnion"];
        case "VIDEO_ALREADY_TAGGED":
          return {
            __typename: "ResolveSemitagVideoAlreadyTaggedPayload",
            tagging: VideoTagModel.fromPrisma(result.error.tagging),
          } satisfies ResolversTypes["ResolveSemitagReturnUnion"];
      }
    }

    const data = result.data;

    const neo4jResult = await resolveSemitagInNeo4j({ prisma, neo4j }, data.videoTagId);
    if (isErr(neo4jResult)) {
      logger.error({ error: neo4jResult.error, path: info.path }, "Failed to update in neo4j");
    }

    return {
      __typename: "ResolveSemitagSucceededPayload",
      resolving: new SemitagResolvingModel(data),
    } satisfies ResolversTypes["ResolveSemitagReturnUnion"];
  }) satisfies MutationResolvers["resovleSemitag"];
