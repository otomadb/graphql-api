import { GraphQLError } from "graphql";

import { checkDuplicate } from "../../../utils/checkDuplicate.js";
import { isErr } from "../../../utils/Result.js";
import { MutationResolvers, ResolversTypes } from "../../graphql.js";
import { parseGqlIDs3 } from "../../id.js";
import { ResolverDeps } from "../../types.js";
import { VideoModel } from "../../Video/model.js";
import { registerVideoInNeo4j as registerInNeo4j } from "./neo4j.js";
import { register } from "./prisma.js";

export const resolverRegisterMadFromSoundcloud = ({
  prisma,
  logger,
  neo4j,
}: Pick<ResolverDeps, "prisma" | "neo4j" | "logger">) =>
  (async (_parent, { input }, { currentUser: user }, info) => {
    // TagのIDの妥当性及び重複チェック
    const tagIds = parseGqlIDs3("Tag", input.tagIds);
    if (isErr(tagIds)) {
      switch (tagIds.error.type) {
        case "INVALID_ID":
          return {
            __typename: "MutationInvalidTagIdError",
            tagId: tagIds.error.type,
          } satisfies ResolversTypes["RegisterMadFromSoundcloudPayload"];
        case "DUPLICATED":
          return {
            __typename: "RegisterMadFromSoundcloudTagIdsDuplicatedError",
            tagId: tagIds.error.duplicatedId,
          } satisfies ResolversTypes["RegisterMadFromSoundcloudPayload"];
      }
    }
    // Semitagのnameの重複チェック
    const semitagNames = checkDuplicate(input.semitagNames);
    if (isErr(semitagNames)) {
      return {
        __typename: "RegisterMadFromSoundcloudSemitagNamesDuplicatedError",
        name: semitagNames.error,
      } satisfies ResolversTypes["RegisterMadFromSoundcloudPayload"];
    }

    /*
    // Soundcloudの動画IDチェック
    for (const id of input.sourceIds) {
      if (!isValidSoundcloudSourceId(id))
        return {
          __typename: "RegisterMadFromSoundcloudInvalidSoundcloudSourceIdError",
          sourceID: id,
        } satisfies ResolversTypes["RegisterMadFromSoundcloudPayload"];
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
          } satisfies ResolversTypes["RegisterMadFromSoundcloudPayload"];
        case "INTERNAL_SERVER_ERROR":
          logger.error({ error: result.error, path: info.path }, "Internal Server Error");
          throw new GraphQLError("Internal Server Error");
      }
    }

    const video = result.data;
    await registerInNeo4j({ prisma, logger, neo4j }, video.id);

    return {
      __typename: "RegisterMadFromSoundcloudSucceededPayload",
      mad: new VideoModel(video),
    } satisfies ResolversTypes["RegisterMadFromSoundcloudPayload"];
  }) satisfies MutationResolvers["registerMadFromSoundcloud"];
