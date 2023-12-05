import { MkQueryResolver } from "../utils/MkResolver.js";

export const mkFindBilibiliRegistrationRequestByUrlResolver: MkQueryResolver<
  "findBilibiliRegistrationRequestBySourceId",
  "BilibiliRegistrationRequestService" | "logger"
> =
  ({ BilibiliRegistrationRequestService }) =>
  async (_, { sourceId }) => {
    return BilibiliRegistrationRequestService.findBySourceId(sourceId);
  };
