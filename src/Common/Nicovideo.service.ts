import { Logger } from "pino";
import { z } from "zod";

export const mkNicovideoService = ({ logger }: { logger: Logger }) => {
  return {
    async getInfo(sourceId: string) {
      const url = new URL(`/api/watch/v3_guest/${sourceId}`, "https://www.nicovideo.jp");
      url.searchParams.set("_frontendId", "6");
      url.searchParams.set("_frontendVersion", "0");
      url.searchParams.set("skips", "harmful");
      url.searchParams.set("actionTrackId", `${Math.random().toString(36).substring(2)}_${Date.now()}`);

      const parsed = await fetch(url.toString())
        .then((res) => res.json())
        .then((json) =>
          z
            .object({
              data: z.object({
                tag: z.object({ items: z.array(z.object({ name: z.string() })) }),
                video: z.object({
                  id: z.string(),
                  title: z.string(),
                  description: z.string(),
                  count: z.object({
                    view: z.number().int(),
                    comment: z.number().int(),
                    mylist: z.number().int(),
                    like: z.number().int(),
                  }),
                  duration: z.number().int(),
                  thumbnail: z.object({
                    url: z.string(),
                    ogp: z.string(),
                  }),
                  registeredAt: z.preprocess((arg) => {
                    if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
                  }, z.date()),
                }),
              }),
            })
            .safeParse(json),
        );
      if (!parsed.success) {
        logger.warn({ parsed, sourceId }, "Failed to get nicovideo response");
        return null;
      }

      const {
        data: { video },
      } = parsed.data;

      return {
        title: video.title,
        thumbnailUrl: video.thumbnail.ogp,
        countViews: video.count.view,
        countLikes: video.count.like,
        countMylists: video.count.mylist,
        countComments: video.count.comment,
        registeredAt: video.registeredAt,
        duration: video.duration,
        description: video.description,
        tags: parsed.data.data.tag.items.map(({ name }) => name).filter((name) => !isExcludeTag(name)),
        excludeTags: parsed.data.data.tag.items.map(({ name }) => name).filter((name) => isExcludeTag(name)),
      };
    },
  };
};
export type NicovideoService = ReturnType<typeof mkNicovideoService>;

export function isExcludeTag(tag: string) {
  switch (tag.toLowerCase()) {
    case "音mad":
      return true;
    default:
      return false;
  }
}
