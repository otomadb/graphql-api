import { GraphQLError } from "graphql";

import { MkQueryResolver } from "../utils/MkResolver.js";
import { isErr } from "../utils/Result.js";

export const mkFindSoundcloudRegistrationRequestByUrlResolver: MkQueryResolver<
  "findSoundcloudRegistrationRequestByUrl",
  "SoundcloudService" | "SoundcloudRegistrationRequestService" | "logger"
> =
  ({ SoundcloudRegistrationRequestService, SoundcloudService, logger }) =>
  async (_, { url }, _ctx, info) => {
    const searched = await SoundcloudService.fetchFromUrl(url);
    if (isErr(searched)) {
      switch (searched.error) {
        case "PARSED_ERROR":
          logger.debug({ path: info.path, args: { url } }, "Invalid url");
          throw new GraphQLError("Soundcloud url not found");
        case "SOUNDCLOUD_KEY_NOT_FOUND":
          throw new GraphQLError("Something wrong happened");
      }
    }
    return SoundcloudRegistrationRequestService.findBySourceId(searched.data.sourceId);
  };
