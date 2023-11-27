import { NicovideoOriginalSourceDTO } from "../FetchExternal/NicovideoOriginalSource.dto.js";
import { MkQueryResolver } from "../utils/MkResolver.js";

export const mkListNicovideoBotRegistrationRequestsResolver: MkQueryResolver<
  "listNicovideoBotRegistrationRequests",
  "NicochuuService"
> =
  ({ NicochuuService }) =>
  async (_parent, { input: { skip, limit } }) => {
    const res = await NicochuuService.listVideos({ skip, take: limit });
    return res.videos.map((video) => NicovideoOriginalSourceDTO.make({ sourceId: video.sourceId }));
  };
