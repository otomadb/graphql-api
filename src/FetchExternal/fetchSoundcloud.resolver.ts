import { MkQueryResolver } from "../utils/MkResolver.js";
import { isErr } from "../utils/Result.js";

export const mkFetchSoundcloudResolver: MkQueryResolver<"fetchSoundcloud", "SoundcloudService"> =
  ({ SoundcloudService }) =>
  async (_parent, { input: { url } }) => {
    const rslt = await SoundcloudService.fetchFromUrl(url);
    if (isErr(rslt)) return { source: null }; // throw new GraphQLError("Failed to fetch from Soundcloud");}
    return { source: rslt.data };
  };
