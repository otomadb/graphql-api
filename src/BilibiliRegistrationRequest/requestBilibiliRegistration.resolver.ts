import { GraphQLError } from "graphql";

import { BilibiliMADSourceDTO } from "../BilibiliMADSource/BilibiliMADSource.dto.js";
import { MutationResolvers, ResolversTypes } from "../resolvers/graphql.js";
import { parseGqlID2 } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { isErr } from "../utils/Result.js";
import { BilibiliRegistrationRequestDTO } from "./BilibiliRegistrationRequest.dto.js";

export const mkRequestBilibiliRegistrationResolver = ({
  logger,
  TimelineEventService,
  BilibiliRegistrationRequestService,
}: Pick<ResolverDeps, "logger" | "BilibiliRegistrationRequestService" | "TimelineEventService">) =>
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
        } satisfies ResolversTypes["RequestBilibiliRegistrationReturnUnion"];
      }
      taggings.push({ tagId: parsed.data, note: note ?? null });
    }

    const result = await BilibiliRegistrationRequestService.requestRegistration({
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
          } satisfies ResolversTypes["RequestBilibiliRegistrationReturnUnion"];
        case "VIDEO_ALREADY_REGISTERED":
          return {
            __typename: "RequestBilibiliRegistrationVideoAlreadyRegisteredError",
            source: BilibiliMADSourceDTO.fromPrisma(result.error.source),
          } satisfies ResolversTypes["RequestBilibiliRegistrationReturnUnion"];
        case "INTERNAL_SERVER_ERROR":
          logger.error({ error: result.error.error, path: info.path }, "Something error happens");
          throw new GraphQLError("Internal server error");
      }
    }

    await TimelineEventService.clearAll();

    const request = result.data;
    return {
      __typename: "RequestBilibiliRegistrationSucceededPayload",
      request: BilibiliRegistrationRequestDTO.fromPrisma(request),
    } satisfies ResolversTypes["RequestBilibiliRegistrationReturnUnion"];
  }) satisfies MutationResolvers["requestBilibiliRegistration"];
