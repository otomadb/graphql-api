import { checkDuplicate } from "../../../utils/checkDuplicate.js";
import { isErr } from "../../../utils/Result.js";
import { MutationResolvers, RegisterVideoFromSoundcloudFailedMessage, ResolversTypes } from "../../graphql.js";
import { parseGqlIDs3 } from "../../id.js";
import { ResolverDeps } from "../../types.js";
import { VideoModel } from "../../Video/model.js";
import { registerVideoInNeo4j as registerInNeo4j } from "./neo4j.js";
import { register } from "./prisma.js";

export const resolverRegisterVideoFromSoundcloud = ({
  prisma,
  logger,
  neo4j,
}: Pick<ResolverDeps, "prisma" | "neo4j" | "logger">) =>
  (async (_parent, { input }, { currentUser: user }) => {
    // TagのIDの妥当性及び重複チェック
    const tagIds = parseGqlIDs3("Tag", input.tagIds);
    if (isErr(tagIds)) {
      switch (tagIds.error.type) {
        case "INVALID_ID":
          return {
            __typename: "MutationInvalidTagIdError",
            tagId: tagIds.error.type,
          } satisfies ResolversTypes["RegisterVideoFromSoundcloudPayload"];
        case "DUPLICATED":
          return {
            __typename: "RegisterVideoFromSoundcloudTagIdsDuplicatedError",
            tagId: tagIds.error.duplicatedId,
          } satisfies ResolversTypes["RegisterVideoFromSoundcloudPayload"];
      }
    }
    // Semitagのnameの重複チェック
    const semitagNames = checkDuplicate(input.semitagNames);
    if (isErr(semitagNames)) {
      return {
        __typename: "RegisterVideoFromSoundcloudSemitagNamesDuplicatedError",
        name: semitagNames.error,
      } satisfies ResolversTypes["RegisterVideoFromSoundcloudPayload"];
    }

    /*
    // Soundcloudの動画IDチェック
    for (const id of input.sourceIds) {
      if (!isValidSoundcloudSourceId(id))
        return {
          __typename: "RegisterVideoFromSoundcloudInvalidSoundcloudSourceIdError",
          sourceID: id,
        } satisfies ResolversTypes["RegisterVideoFromSoundcloudPayload"];
    }
    */

    const result = await register(prisma, {
      authUserId: user.id,
      primaryTitle: input.primaryTitle,
      extraTitles: input.extraTitles,
      primaryThumbnail: input.primaryThumbnailUrl,
      tagIds: tagIds.data,
      semitagNames: semitagNames.data,
      sourceIds: input.sourceIds,
    });

    if (isErr(result)) {
      switch (result.error.type) {
        case "NO_TAG":
          return {
            __typename: "MutationTagNotFoundError",
            tagId: result.error.tagId,
          } satisfies ResolversTypes["RegisterVideoFromSoundcloudPayload"];
        case "INTERNAL_SERVER_ERROR":
          return {
            __typename: "RegisterVideoFromSoundcloudOtherErrorsFallback",
            message: RegisterVideoFromSoundcloudFailedMessage.InternalServerError,
          } satisfies ResolversTypes["RegisterVideoFromSoundcloudPayload"];
      }
    }

    const video = result.data;
    await registerInNeo4j({ prisma, logger, neo4j }, video.id);

    return {
      __typename: "RegisterVideoFromSoundcloudSucceededPayload",
      video: new VideoModel(video),
    } satisfies ResolversTypes["RegisterVideoFromSoundcloudPayload"];
  }) satisfies MutationResolvers["registerVideoFromSoundcloud"];
