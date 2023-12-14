import { buildGqlId } from "../resolvers/id.js";
import { MkResolver } from "../utils/MkResolver.js";

export const mkYoutubeRegistrationRequestCheckingResolver: MkResolver<
  "YoutubeRegistrationRequestChecking",
  "YoutubeRegistrationRequestService"
> = ({ YoutubeRegistrationRequestService }) => ({
  id: ({ id }) => buildGqlId("YoutubeRegistrationRequestChecking", id),
  request: ({ requestId }) => YoutubeRegistrationRequestService.getByIdOrThrow(requestId),
});
