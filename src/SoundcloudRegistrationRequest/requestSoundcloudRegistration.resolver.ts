import { GraphQLError } from "graphql";

import { MutationResolvers, ResolversTypes } from "../resolvers/graphql.js";
import { parseGqlID2 } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { SoundcloudMADSourceDTO } from "../SoundcloudMADSource/SoundcloudMADSource.dto.js";
import { isErr } from "../utils/Result.js";
import { SoundcloudRegistrationRequestDTO } from "./SoundcloudRegistrationRequest.dto.js";

export const mkRequestSoundcloudRegistrationResolver = ({
  logger,
  TimelineEventService,
  SoundcloudRegistrationRequestService,
}: Pick<ResolverDeps, "logger" | "SoundcloudRegistrationRequestService" | "TimelineEventService">) =>
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
        } satisfies ResolversTypes["RequestSoundcloudRegistrationReturnUnion"];
      }
      taggings.push({ tagId: parsed.data, note: note ?? null });
    }

    const result = await SoundcloudRegistrationRequestService.requestRegistration({
      userId: user.id,
      title,
      thumbnailUrl: thumbnailUrl || null,
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
          } satisfies ResolversTypes["RequestSoundcloudRegistrationReturnUnion"];
        case "VIDEO_ALREADY_REGISTERED":
          return {
            __typename: "RequestSoundcloudRegistrationVideoAlreadyRegisteredError",
            source: SoundcloudMADSourceDTO.fromPrisma(result.error.source),
          } satisfies ResolversTypes["RequestSoundcloudRegistrationReturnUnion"];
        case "INTERNAL_SERVER_ERROR":
          logger.error({ error: result.error.error, path: info.path }, "Something error happens");
          throw new GraphQLError("Internal server error");
      }
    }

    await TimelineEventService.clearAll();

    const request = result.data;
    return {
      __typename: "RequestSoundcloudRegistrationSucceededPayload",
      request: SoundcloudRegistrationRequestDTO.fromPrisma(request),
    } satisfies ResolversTypes["RequestSoundcloudRegistrationReturnUnion"];
  }) satisfies MutationResolvers["requestSoundcloudRegistration"];
