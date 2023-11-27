import { MkResolver } from "../utils/MkResolver.js";
import { NicovideoOriginalSourceTagDTO } from "./NicovideoOriginalSourceTag.dto.js";
export const mkNicovideoOriginalSourceResolver: MkResolver<"NicovideoOriginalSource", "NicovideoService"> = ({
  NicovideoService,
}) => {
  return {
    sourceId: ({ sourceId }) => sourceId,
    url: ({ sourceId }) => `https://www.nicovideo.jp/watch/${sourceId}`,
    embedUrl: ({ sourceId }) => `https://embed.nicovideo.jp/watch/${sourceId}`,
    async info({ sourceId }) {
      return NicovideoService.getInfo(sourceId).then((info) =>
        info ? { ...info, tags: info.tags.map((tag) => new NicovideoOriginalSourceTagDTO({ name: tag })) } : null,
      );
    },
  };
};
