import { checkDuplicate } from "../../../utils/checkDuplicate.js";
import { isValidYoutubeSourceId } from "../../../utils/isValidYoutubeSourceId.js";
import { isErr } from "../../../utils/Result.js";
import { MutationResolvers, RegisterVideoFromYoutubeFailedMessage, ResolversTypes } from "../../graphql.js";
import { parseGqlIDs3 } from "../../id.js";
import { ResolverDeps } from "../../types.js";
import { VideoModel } from "../../Video/model.js";
import { registerVideoInNeo4j as registerInNeo4j } from "./neo4j.js";
import { register } from "./prisma.js";

export const resolverRegisterVideoFromYoutube = ({
  prisma,
  logger,
  neo4j,
}: Pick<ResolverDeps, "logger" | "neo4j" | "prisma">) =>
  (async (_parent, { input }, { currentUser: user }) => {
    // TagのIDの妥当性及び重複チェック
    const tagIds = parseGqlIDs3("Tag", input.tagIds);
    if (isErr(tagIds)) {
      switch (tagIds.error.type) {
        case "INVALID_ID":
          return {
            __typename: "MutationInvalidTagIdError",
            tagId: tagIds.error.type,
          } satisfies ResolversTypes["RegisterVideoFromYoutubePayload"];
        case "DUPLICATED":
          return {
            __typename: "RegisterVideoFromYoutubeTagIdsDuplicatedError",
            tagId: tagIds.error.duplicatedId,
          } satisfies ResolversTypes["RegisterVideoFromYoutubePayload"];
      }
    }
    // Semitagのnameの重複チェック
    const semitagNames = checkDuplicate(input.semitagNames);
    if (isErr(semitagNames)) {
      return {
        __typename: "RegisterVideoFromYoutubeSemitagNamesDuplicatedError",
        name: semitagNames.error,
      } satisfies ResolversTypes["RegisterVideoFromYoutubePayload"];
    }

    // Youtubeの動画IDチェック
    for (const id of input.sourceIds) {
      if (!isValidYoutubeSourceId(id))
        return {
          __typename: "RegisterVideoFromYoutubeInvalidYoutubeSourceIdError",
          sourceID: id,
        } satisfies ResolversTypes["RegisterVideoFromYoutubePayload"];
    }

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
          } satisfies ResolversTypes["RegisterVideoFromYoutubePayload"];
        case "INTERNAL_SERVER_ERROR":
          return {
            __typename: "RegisterVideoFromYoutubeOtherErrorsFallback",
            message: RegisterVideoFromYoutubeFailedMessage.InternalServerError,
          } satisfies ResolversTypes["RegisterVideoFromYoutubePayload"];
      }
    }

    const video = result.data;
    await registerInNeo4j({ prisma, logger, neo4j }, video.id);

    return {
      __typename: "RegisterVideoFromYoutubeSucceededPayload",
      video: new VideoModel(video),
    } satisfies ResolversTypes["RegisterVideoFromYoutubePayload"];
  }) satisfies MutationResolvers["registerVideoFromYoutube"];
