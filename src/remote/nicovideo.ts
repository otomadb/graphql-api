import { Middleware } from "@koa/router";
import { z } from "zod";

import { isValidNicovideoSourceId } from "../utils/isValidNicovideoSourceId.js";

const apiResponse = z.object({
  data: z.object({
    tag: z.object({
      items: z.array(
        z.object({
          name: z.string(),
        })
      ),
    }),
    video: z.object({
      id: z.string(),
      title: z.string(),
      count: z.object({
        view: z.number().int(),
        comment: z.number().int(),
        mylist: z.number().int(),
        like: z.number().int(),
      }),
      duration: z.number().int(),
      thumbnail: z.object({
        url: z.string(),
        middleUrl: z.string(),
        largeUrl: z.string(),
        player: z.string(),
        ogp: z.string(),
      }),
      registeredAt: z.preprocess((arg) => {
        if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
      }, z.date()),
    }),
  }),
});

export const handlerRemoteNicovideo: Middleware = async (ctx) => {
  const sourceId = ctx.query["id"];
  if (typeof sourceId !== "string" || !isValidNicovideoSourceId(sourceId)) {
    ctx.status = 400;
    return;
  }

  const url = new URL(`/api/watch/v3_guest/${sourceId}`, "https://www.nicovideo.jp");
  url.searchParams.set("_frontendId", "6");
  url.searchParams.set("_frontendVersion", "0");
  url.searchParams.set("skips", "harmful");
  url.searchParams.set("actionTrackId", `${Math.random().toString(36).substring(2)}_${Date.now()}`); // TODO: random gen

  const result = await fetch(url.toString());
  const json = await result.json();

  const parsed = apiResponse.safeParse(json);
  if (!parsed.success) {
    ctx.status = 404;
    ctx.body = parsed.error;
    return;
  }

  const {
    data: { tag, video },
  } = parsed.data;

  ctx.body = {
    sourceId: video.id,
    title: video.title,
    duration: video.duration,
    registeredAt: video.registeredAt,
    count: {
      view: video.count.view,
      like: video.count.like,
      mylist: video.count.mylist,
      comment: video.count.comment,
    },
    thumbnail: {
      ogp: video.thumbnail.ogp,
    },
    tags: tag.items.map(({ name }) => ({ name })),
  };
};
