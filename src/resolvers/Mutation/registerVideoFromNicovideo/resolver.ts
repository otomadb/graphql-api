import { UserRole } from "@prisma/client";

import { checkDuplicate } from "../../../utils/checkDuplicate.js";
import { isValidNicovideoSourceId } from "../../../utils/isValidNicovideoSourceId.js";
import { isErr } from "../../../utils/Result.js";
import {
  MutationResolvers,
  RegisterVideoFromNicovideoFailedMessage,
  RegisterVideoFromNicovideoPayload,
  UserRole as GraphQLUserRole,
} from "../../graphql.js";
import { parseGqlID3, parseGqlIDs3 } from "../../id.js";
import { ResolverDeps } from "../../types.js";
import { VideoModel } from "../../Video/model.js";
import { registerVideoInNeo4j as registerInNeo4j } from "./neo4j.js";
import { register } from "./prisma.js";

export const resolverRegisterVideoFromNicovideo = ({
  prisma,
  logger,
  neo4j,
}: Pick<ResolverDeps, "prisma" | "neo4j" | "logger">) =>
  (async (_parent, { input }, { user }) => {
    if (!user || (user.role !== UserRole.EDITOR && user.role !== UserRole.ADMINISTRATOR))
      return {
        __typename: "MutationAuthenticationError",
        requiredRole: GraphQLUserRole.User,
      } satisfies RegisterVideoFromNicovideoPayload;

    // TagのIDの妥当性及び重複チェック
    const tagIds = parseGqlIDs3("Tag", input.tagIds);
    if (isErr(tagIds)) {
      switch (tagIds.error.type) {
        case "INVALID_ID":
          return {
            __typename: "MutationInvalidTagIdError",
            tagId: tagIds.error.type,
          } satisfies RegisterVideoFromNicovideoPayload;
        case "DUPLICATED":
          return {
            __typename: "RegisterVideoFromNicovideoTagIdsDuplicatedError",
            tagId: tagIds.error.duplicatedId,
          } satisfies RegisterVideoFromNicovideoPayload;
      }
    }
    // Semitagのnameの重複チェック
    const semitagNames = checkDuplicate(input.semitagNames);
    if (isErr(semitagNames)) {
      return {
        __typename: "RegisterVideoFromNicovideoSemitagNamesDuplicatedError",
        name: semitagNames.error,
      } satisfies RegisterVideoFromNicovideoPayload;
    }

    // リクエストIDのチェック
    const nicovideoRequestId = input.requestId ? parseGqlID3("NicovideoRegistrationRequest", input.requestId) : null;
    if (nicovideoRequestId && isErr(nicovideoRequestId)) {
      return {
        __typename: "MutationInvalidNicovideoRegistrationRequestIdError",
        requestId: nicovideoRequestId.error.invalidId,
      } satisfies RegisterVideoFromNicovideoPayload;
    }

    // ニコニコ動画の動画IDチェック
    for (const id of input.sourceIds) {
      if (!isValidNicovideoSourceId(id))
        return {
          __typename: "RegisterVideoFromNicovideoInvalidNicovideoSourceIdError",
          sourceID: id,
        } satisfies RegisterVideoFromNicovideoPayload;
    }

    const result = await register(prisma, {
      authUserId: user.id,
      primaryTitle: input.primaryTitle,
      extraTitles: input.extraTitles,
      primaryThumbnail: input.primaryThumbnailUrl,
      tagIds: tagIds.data,
      semitagNames: semitagNames.data,
      sourceIds: input.sourceIds,
      requestId: nicovideoRequestId?.data ?? null,
    });

    if (isErr(result)) {
      switch (result.error.type) {
        case "NO_TAG":
          return {
            __typename: "MutationTagNotFoundError",
            tagId: result.error.tagId,
          } satisfies RegisterVideoFromNicovideoPayload;
        case "REQUEST_NOT_FOUND":
          return {
            __typename: "MutationNicovideoRegistrationRequestNotFoundError",
            requestId: result.error.requestId,
          } satisfies RegisterVideoFromNicovideoPayload;
        case "REQUEST_ALREADY_CHECKED":
          return {
            __typename: "MutationNicovideoRegistrationRequestAlreadyCheckedError",
            requestId: result.error.requestId,
          } satisfies RegisterVideoFromNicovideoPayload;
        case "INTERNAL_SERVER_ERROR":
          return {
            __typename: "RegisterVideoFromNicovideoOtherErrorsFallback",
            message: RegisterVideoFromNicovideoFailedMessage.InternalServerError,
          } satisfies RegisterVideoFromNicovideoPayload;
      }
    }

    const video = result.data;
    await registerInNeo4j({ prisma, logger, neo4j }, video.id);

    return {
      __typename: "RegisterVideoFromNicovideoSucceededPayload",
      video: new VideoModel(video),
    };
  }) satisfies MutationResolvers["registerVideoFromNicovideo"];
