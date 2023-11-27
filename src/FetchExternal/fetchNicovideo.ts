import { GraphQLError } from "graphql";
import { z } from "zod";

import { QueryResolvers } from "../resolvers/graphql.js";
import { isValidNicovideoSourceId } from "../utils/isValidNicovideoSourceId.js";
import { NicovideoOriginalSourceDTO } from "./NicovideoOriginalSource.dto.js";

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
    return {
      source: NicovideoOriginalSourceDTO.make({ sourceId }),
    };
  }) satisfies QueryResolvers["fetchNicovideo"];
