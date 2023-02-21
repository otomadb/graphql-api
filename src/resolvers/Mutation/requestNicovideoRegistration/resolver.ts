import { MutationResolvers, RequestNicovideoRegistrationErrorFallbackMessage } from "../../graphql.js";
import { ResolverDeps } from "../../index.js";
import { NicovideoRegistrationRequestModel } from "../../NicovideoRegistrationRequest/model.js";
import { NicovideoVideoSourceModel } from "../../NicovideoVideoSource/model.js";
import { requestRegistration } from "./request.js";

export const resolverRequestNicovideoRegistration = ({ prisma }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_, { input: { title, sourceId, taggings, semitaggings } }, { user }) => {
    if (!user)
      return {
        __typename: "RequestNicovideoRegistrationErrorFallback",
        message: RequestNicovideoRegistrationErrorFallbackMessage.NotLoggedIn,
      };

    const result = await requestRegistration(prisma, {
      userId: user.id,
      title,
      sourceId,
      taggings: taggings.map(({ tagId, note }) => ({ id: tagId, note: note || null })),
      semitaggings: semitaggings.map(({ name, note }) => ({ name, note: note || null })),
    });

    if (result.status === "error") {
      switch (result.error.message) {
        case "VIDEO_ALREADY_REGISTERED":
          return {
            __typename: "RequestNicovideoRegistrationVideoAlreadyRegisteredError",
            source: new NicovideoVideoSourceModel(result.error.source),
          };
        case "TAG_NOT_FOUND":
          return {
            __typename: "RequestNicovideoRegistrationTagNotFoundError",
            tagId: result.error.tagId,
          };
      }
    }

    const request = result.data;
    return {
      __typename: "RequestNicovideoRegistrationSucceededPayload",
      request: new NicovideoRegistrationRequestModel(request),
    };
  }) satisfies MutationResolvers["requestNicovideoRegistration"];
