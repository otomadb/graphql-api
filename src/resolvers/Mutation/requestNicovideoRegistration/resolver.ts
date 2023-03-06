import { isErr } from "../../../utils/Result.js";
import {
  MutationAuthenticationError,
  MutationInvalidTagIdError,
  MutationResolvers,
  RequestNicovideoRegistrationOtherErrorMessage,
  RequestNicovideoRegistrationOtherErrorsFallback,
  UserRole as GraphQLUserRole,
} from "../../graphql.js";
import { parseGqlID2 } from "../../id.js";
import { ResolverDeps } from "../../index.js";
import { NicovideoRegistrationRequestModel } from "../../NicovideoRegistrationRequest/model.js";
import { NicovideoVideoSourceModel } from "../../NicovideoVideoSource/model.js";
import { requestRegistration } from "./request.js";

export const resolverRequestNicovideoRegistration = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_, { input: { title, thumbnailUrl, sourceId, taggings: gqlTaggings, semitaggings } }, { user }, info) => {
    if (!user)
      return {
        __typename: "MutationAuthenticationError",
        requiredRole: GraphQLUserRole.User,
      } satisfies MutationAuthenticationError;

    const taggings: { tagId: string; note: string | null }[] = [];
    for (const { tagId, note } of gqlTaggings) {
      const parsed = parseGqlID2("Tag", tagId);
      if (isErr(parsed)) {
        return {
          __typename: "MutationInvalidTagIdError",
          tagId,
        };
      }
      taggings.push({ tagId: parsed.data, note: note ?? null });
    }

    const result = await requestRegistration(prisma, {
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
          } satisfies MutationInvalidTagIdError;
        case "VIDEO_ALREADY_REGISTERED":
          return {
            __typename: "RequestNicovideoRegistrationVideoAlreadyRegisteredError",
            source: new NicovideoVideoSourceModel(result.error.source),
          }; // TODO: 何らかのsatisfiesを使う
        case "INTERNAL_SERVER_ERROR":
          logger.error({ error: result.error.error, path: info.path }, "Something error happens");
          return {
            __typename: "RequestNicovideoRegistrationOtherErrorsFallback",
            message: RequestNicovideoRegistrationOtherErrorMessage.InternalServerError,
          } satisfies RequestNicovideoRegistrationOtherErrorsFallback;
      }
    }

    const request = result.data;
    return {
      __typename: "RequestNicovideoRegistrationSucceededPayload",
      request: new NicovideoRegistrationRequestModel(request),
    };
  }) satisfies MutationResolvers["requestNicovideoRegistration"];
