import { UserRole } from "@prisma/client";

import { isValidNicovideoSourceId } from "../../../utils/isValidNicovideoSourceId.js";
import { isErr } from "../../../utils/Result.js";
import {
  MutationInvalidNicovideoRegistrationRequestIdError,
  MutationNicovideoRegistrationRequestAlreadyCheckedError,
  MutationNicovideoRegistrationRequestNotFoundError,
  MutationResolvers,
  RegisterVideoFailedMessage,
  RegisterVideoInputSourceType,
} from "../../graphql.js";
import { parseGqlID3, parseGqlIDs2 } from "../../id.js";
import { ResolverDeps } from "../../types.js";
import { VideoModel } from "../../Video/model.js";
import { addVideoToMeiliSearch } from "./meilisearch.js";
import { registerVideoInNeo4j as registerInNeo4j } from "./neo4j.js";
import { register } from "./prisma.js";

export const resolverRegisterVideo = ({
  prisma,
  logger,
  neo4j,
  meilisearch,
}: Pick<ResolverDeps, "prisma" | "neo4j" | "logger" | "meilisearch">) =>
  // registerVideoScaffold(deps)
  (async (_parent, { input }, { user }, info) => {
    if (!user || (user.role !== UserRole.EDITOR && user.role !== UserRole.ADMINISTRATOR))
      return {
        __typename: "RegisterVideoFailedPayload",
        message: RegisterVideoFailedMessage.Forbidden,
      };

    const tagIds = parseGqlIDs2("Tag", input.tags);
    if (isErr(tagIds)) {
      return {
        __typename: "RegisterVideoFailedPayload",
        message: RegisterVideoFailedMessage.InvalidTagId,
      };
    }

    const nicovideoRequestId = input.nicovideoRequestId
      ? parseGqlID3("NicovideoRegistrationRequest", input.nicovideoRequestId)
      : null;
    if (nicovideoRequestId && isErr(nicovideoRequestId)) {
      return {
        __typename: "MutationInvalidNicovideoRegistrationRequestIdError",
        requestId: nicovideoRequestId.error.invalidId,
      } satisfies MutationInvalidNicovideoRegistrationRequestIdError;
    }

    // ニコニコ動画の動画IDチェック
    const nicovideoSourceIds = input.sources
      .filter((v) => v.type === RegisterVideoInputSourceType.Nicovideo)
      .map(({ sourceId }) => sourceId.toLocaleLowerCase());
    for (const id of nicovideoSourceIds) {
      if (!isValidNicovideoSourceId(id))
        return {
          __typename: "RegisterVideoFailedPayload",
          message: RegisterVideoFailedMessage.InvalidNicovideoSourceId,
        };
    }

    const result = await register(prisma, {
      authUserId: user.id,
      primaryTitle: input.primaryTitle,
      extraTitles: input.extraTitles,
      primaryThumbnail: input.primaryThumbnail,
      tagIds: tagIds.data,
      semitagNames: input.semitags,
      nicovideoSourceIds,
      nicovideoRequestId: nicovideoRequestId?.data ?? null,
    });

    if (isErr(result)) {
      switch (result.error.type) {
        case "REQUEST_NOT_FOUND":
          return {
            __typename: "MutationNicovideoRegistrationRequestNotFoundError",
            requestId: result.error.requestId,
          } satisfies MutationNicovideoRegistrationRequestNotFoundError;
        case "REQUEST_ALREADY_CHECKED":
          return {
            __typename: "MutationNicovideoRegistrationRequestAlreadyCheckedError",
            requestId: result.error.requestId,
          } satisfies MutationNicovideoRegistrationRequestAlreadyCheckedError;
        default:
          return {
            __typename: "RegisterVideoFailedPayload",
            message: RegisterVideoFailedMessage.Unknown,
          };
      }
    }

    const video = result.data;
    await registerInNeo4j({ prisma, logger, neo4j }, video.id);

    const meilisearchResult = await addVideoToMeiliSearch({ prisma, meilisearch }, video.id);
    if (isErr(meilisearchResult)) {
      logger.error({ error: meilisearchResult.error, path: info.path }, "Failed to add in meilisearch");
    }

    return {
      __typename: "RegisterVideoSucceededPayload",
      video: new VideoModel(video),
    };
  }) satisfies MutationResolvers["registerVideo"];
