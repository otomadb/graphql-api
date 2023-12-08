import { MkQueryResolver } from "../utils/MkResolver.js";
import { isErr } from "../utils/Result.js";

export const mkFetchSoundcloudByUrlResolver: MkQueryResolver<"fetchSoundcloudByUrl", "SoundcloudService"> =
  ({ SoundcloudService }) =>
  async (_parent, { url }) => {
    const rslt = await SoundcloudService.fetchFromUrl(url);
    if (isErr(rslt)) return { source: null };
    return { source: rslt.data };
  };
