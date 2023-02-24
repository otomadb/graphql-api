import { UserRole } from "@prisma/client";

import { isValidNicovideoSourceId } from "../../../utils/isValidNicovideoSourceId.js";
import {
  MutationInvalidNicovideoRegistrationRequestIdError,
  MutationNicovideoRegistrationRequestAlreadyCheckedError,
  MutationNicovideoRegistrationRequestNotFoundError,
  MutationResolvers,
  RegisterVideoFailedMessage,
  RegisterVideoInputSourceType,
} from "../../graphql.js";
import { parseGqlID3, parseGqlIDs2 } from "../../id.js";
import { ResolverDeps } from "../../index.js";
import { VideoModel } from "../../Video/model.js";
import { registerVideoInNeo4j as registerInNeo4j } from "./neo4j.js";
import { register } from "./prisma.js";

export const resolverRegisterVideo = ({ prisma, logger, neo4j }: Pick<ResolverDeps, "prisma" | "neo4j" | "logger">) =>
  // registerVideoScaffold(deps)
  (async (_parent, { input }, { user }) => {
    if (!user || (user.role !== UserRole.EDITOR && user.role !== UserRole.ADMINISTRATOR))
      return {
        __typename: "RegisterVideoFailedPayload",
        message: RegisterVideoFailedMessage.Forbidden,
      };

    const tagIds = parseGqlIDs2("Tag", input.tags);
    if (tagIds.status === "error") {
      return {
        __typename: "RegisterVideoFailedPayload",
        message: RegisterVideoFailedMessage.InvalidTagId,
      };
    }

    const requestId = input.requestId ? parseGqlID3("NicovideoRegistrationRequest", input.requestId) : null;
    if (requestId?.status === "error") {
      return {
        __typename: "MutationInvalidNicovideoRegistrationRequestIdError",
        requestId: requestId.error.invalidId,
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
      requestId: requestId?.data ?? null,
    });

    if (result.status === "error") {
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

    return {
      __typename: "RegisterVideoSucceededPayload",
      video: new VideoModel(video),
    };
  }) satisfies MutationResolvers["registerVideo"];
