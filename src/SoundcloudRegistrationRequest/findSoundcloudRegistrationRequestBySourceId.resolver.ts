import { MkQueryResolver } from "../utils/MkResolver.js";

export const mkFindSoundcloudRegistrationRequestBySourceIdResolver: MkQueryResolver<
  "findSoundcloudRegistrationRequestBySourceId",
  "SoundcloudRegistrationRequestService"
> =
  ({ SoundcloudRegistrationRequestService }) =>
  async (_, { sourceId }) =>
    SoundcloudRegistrationRequestService.findBySourceId(sourceId);
