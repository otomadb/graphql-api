import { z } from "zod";

import { MkQueryResolver } from "../utils/MkResolver.js";
import { BilibiliOriginalSourceTagDTO } from "./BilibiliOriginalSourceTag.dto.js";

export const apiResponse = z.object({
  data: z.object({
    View: z.object({
      bvid: z.string(),
      title: z.string(),
      pic: z.string().url(),
      subtitle: z.object({
        allow_submit: z.boolean(),
        list: z.array(z.string()),
      }),
    }),
    Tags: z.array(
      z.object({
        tag_id: z.number().int(),
        tag_name: z.string(),
      }),
    ),
  }),
});
export type ApiResponseTag = z.infer<typeof apiResponse>["data"]["Tags"][number];

export const resolverFetchBilibili: MkQueryResolver<"fetchBilibili"> =
  () =>
  async (_parent, { input: { bvid } }) => {
    const url = new URL("https://api.bilibili.com/x/web-interface/view/detail");
    url.searchParams.set("bvid", bvid);

    const parsed = await fetch(url.toString())
      .then((res) => res.json())
      .then((json) => apiResponse.safeParse(json));

    if (!parsed.success) {
      return { source: null };
    }

    const {
      data: { View, Tags },
    } = parsed.data;

    return {
      source: {
        sourceId: View.bvid,
        title: View.title,
        url: `https://www.bilibili.com/video/${View.bvid}`,
        thumbnailUrl: View.pic,
        tags: Tags.map((tag) => BilibiliOriginalSourceTagDTO.make(tag)),
      },
    };
  };
