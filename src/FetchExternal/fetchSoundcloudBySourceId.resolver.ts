import { MkQueryResolver } from "../utils/MkResolver.js";
import { isErr } from "../utils/Result.js";

export const mkFetchSoundcloudBySourceIdResolver: MkQueryResolver<"fetchSoundcloudBySourceId", "SoundcloudService"> =
  ({ SoundcloudService }) =>
  async (_parent, { sourceId }) => {
    const rslt = await SoundcloudService.fetchFromSourceId(sourceId);
    if (isErr(rslt)) return { source: null };
    return { source: rslt.data };
  };
