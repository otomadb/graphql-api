import { GraphQLError } from "graphql";

import { MutationResolvers, ResolversTypes } from "../resolvers/graphql.js";
import { parseGqlID2 } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { isErr } from "../utils/Result.js";
import { YoutubeVideoSourceDTO } from "../YoutubeVideoSource/dto.js";
import { YoutubeRegistrationRequestDTO } from "./YoutubeRegistrationRequest.dto.js";

export const mkRequestYoutubeRegistrationResolver = ({
  logger,
  TimelineEventService,
  YoutubeRegistrationRequestService,
}: Pick<ResolverDeps, "logger" | "YoutubeRegistrationRequestService" | "TimelineEventService">) =>
  (async (
    _,
    { input: { title, thumbnailUrl, sourceId, taggings: gqlTaggings, semitaggings } },
    { currentUser: user },
    info,
  ) => {
    const taggings: { tagId: string; note: string | null }[] = [];
    for (const { tagId, note } of gqlTaggings) {
      const parsed = parseGqlID2("Tag", tagId);
      if (isErr(parsed)) {
        return {
          __typename: "MutationInvalidTagIdError",
          tagId,
        } satisfies ResolversTypes["RequestYoutubeRegistrationReturnUnion"];
      }
      taggings.push({ tagId: parsed.data, note: note ?? null });
    }

    const result = await YoutubeRegistrationRequestService.requestRegistration({
      userId: user.id,
      title,
      thumbnailUrl,
      sourceId,
      taggings,
      semitaggings: semitaggings.map(({ name, note }) => ({ name, note: note || null })),
    });

    if (isErr(result)) {
      switch (result.error.message) {
        case "TAG_NOT_FOUND":
          return {
            __typename: "MutationInvalidTagIdError",
            tagId: result.error.tagId,
          } satisfies ResolversTypes["RequestYoutubeRegistrationReturnUnion"];
        case "VIDEO_ALREADY_REGISTERED":
          return {
            __typename: "RequestYoutubeRegistrationVideoAlreadyRegisteredError",
            source: YoutubeVideoSourceDTO.fromPrisma(result.error.source),
          } satisfies ResolversTypes["RequestYoutubeRegistrationReturnUnion"];
        case "INTERNAL_SERVER_ERROR":
          logger.error({ error: result.error.error, path: info.path }, "Something error happens");
          throw new GraphQLError("Internal server error");
      }
    }

    await TimelineEventService.clearAll();

    const request = result.data;
    return {
      __typename: "RequestYoutubeRegistrationSucceededPayload",
      request: YoutubeRegistrationRequestDTO.fromPrisma(request),
    } satisfies ResolversTypes["RequestYoutubeRegistrationReturnUnion"];
  }) satisfies MutationResolvers["requestYoutubeRegistration"];
