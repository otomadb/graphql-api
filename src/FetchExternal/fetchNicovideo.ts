import { GraphQLError } from "graphql";
import { z } from "zod";

import { QueryResolvers } from "../resolvers/graphql.js";
import { isValidNicovideoSourceId } from "../utils/isValidNicovideoSourceId.js";
import { NicovideoOriginalSourceTagDTO } from "./NicovideoOriginalSourceTag.dto.js";

const apiResponse = z.object({
  data: z.object({
    tag: z.object({
      items: z.array(
        z.object({
          name: z.string(),
        }),
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
        ogp: z.string(),
      }),
      registeredAt: z.preprocess((arg) => {
        if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
      }, z.date()),
    }),
  }),
});

export const fetchNicovideo = () =>
  (async (_parent, { input: { sourceId } }) => {
    if (!isValidNicovideoSourceId(sourceId)) {
      throw new GraphQLError("Invalid sourceId");
    }

    const url = new URL(`/api/watch/v3_guest/${sourceId}`, "https://www.nicovideo.jp");
    url.searchParams.set("_frontendId", "6");
    url.searchParams.set("_frontendVersion", "0");
    url.searchParams.set("skips", "harmful");
    url.searchParams.set("actionTrackId", `${Math.random().toString(36).substring(2)}_${Date.now()}`); // TODO: random gen

    const parsed = await fetch(url.toString())
      .then((res) => res.json())
      .then((json) => apiResponse.safeParse(json));

    if (!parsed.success)
      return {
        source: null,
      }; // TODO: もう少し詳細な情報を出しても良い気がする

    const {
      data: { video },
    } = parsed.data;
    const { tags, excludeTags } = filterTags(parsed.data.data.tag.items.map(({ name }) => name));

    return {
      source: {
        sourceId: video.id,
        title: video.title,

        thumbnailUrl: video.thumbnail.ogp,

        countViews: video.count.view,
        countLikes: video.count.like,
        countMylists: video.count.mylist,
        countComments: video.count.comment,

        tags: tags.map((name) => new NicovideoOriginalSourceTagDTO({ name })),
        excludeTags,

        registeredAt: video.registeredAt,
        duration: video.duration,

        url: `https://www.nicovideo.jp/watch/${video.id}`,
        embedUrl: `https://embed.nicovideo.jp/watch/${video.id}`,
      },
    };
  }) satisfies QueryResolvers["fetchNicovideo"];

export const filterTags = (names: string[]) => {
  return {
    tags: names.filter((n) => !isExcludeTag(n)),
    excludeTags: names.filter((n) => isExcludeTag(n)),
  };
};

export const isExcludeTag = (name: string) => {
  switch (name.toLowerCase()) {
    case "音mad":
      return true;
    default:
      return false;
  }
};
