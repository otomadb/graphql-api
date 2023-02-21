import {
  MutationResolvers,
  RequestNicovideoRegistrationOtherErrorMessage,
  UserRole as GraphQLUserRole,
} from "../../graphql.js";
import { ResolverDeps } from "../../index.js";
import { NicovideoRegistrationRequestModel } from "../../NicovideoRegistrationRequest/model.js";
import { NicovideoVideoSourceModel } from "../../NicovideoVideoSource/model.js";
import { requestRegistration } from "./request.js";

export const resolverRequestNicovideoRegistration = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_, { input: { title, sourceId, taggings, semitaggings } }, { user }, info) => {
    if (!user)
      return {
        __typename: "MutationAuthenticationError",
        requiredRole: GraphQLUserRole.User,
      } as const;

    const result = await requestRegistration(prisma, {
      userId: user.id,
      title,
      sourceId,
      taggings: taggings.map(({ tagId, note }) => ({ id: tagId, note: note || null })),
      semitaggings: semitaggings.map(({ name, note }) => ({ name, note: note || null })),
    });

    if (result.status === "error") {
      switch (result.error.message) {
        case "TAG_NOT_FOUND":
          return {
            __typename: "RequestNicovideoRegistrationTagNotFoundError",
            tagId: result.error.tagId,
          } as const;
        case "VIDEO_ALREADY_REGISTERED":
          return {
            __typename: "RequestNicovideoRegistrationVideoAlreadyRegisteredError",
            source: new NicovideoVideoSourceModel(result.error.source),
          } as const;
        case "INTERNAL_SERVER_ERROR":
          logger.error({ error: result.error.error, path: info.path }, "Something error happens");
          return {
            __typename: "RequestNicovideoRegistrationOtherErrorsFallback",
            message: RequestNicovideoRegistrationOtherErrorMessage.InternalServerError,
          } as const;
      }
    }

    const request = result.data;
    return {
      __typename: "RequestNicovideoRegistrationSucceededPayload",
      request: new NicovideoRegistrationRequestModel(request),
    } as const;
  }) satisfies MutationResolvers["requestNicovideoRegistration"];
