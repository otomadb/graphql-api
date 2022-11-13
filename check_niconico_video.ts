import { parse as parseXML } from "xml/mod.ts";
import { z } from "zod/mod.ts";

export type Result<V> =
  | { ok: false; error: { status: 400 | 404 | 409 | 500; message?: string } }
  | { ok: true; value: V };

const schema = z.union([
  z.object({
    "@status": z.literal("fail"),
  }),
  z.object({
    "@status": z.literal("ok"),
    thumb: z.object({
      video_id: z.string(),
      title: z.string(),
      thumbnail_url: z.string(),
      watch_url: z.string(),
      first_retrieve: z.preprocess(
        (arg) => {
          if (typeof arg == "string" || arg instanceof Date) {
            return new Date(arg);
          }
        },
        z.date(),
      ),
      tags: z.object({
        tag: z.array(
          z.union([
            z.string(),
            z.object({
              "@lock": z.literal(1),
              "#text": z.string(),
            }),
          ]),
        ),
      }),
    }),
  }),
]);

export const checkNiconicoVideo = async (id: string): Promise<
  Result<{
    title: string;
    video_id: string;
    watch_url: string;
    thumbnail_url: string;
    thumbnail_url_large: string;
    first_retrieve: Date;
    tags: string[];
    isPossiblyOtomad: boolean;
  }>
> => {
  const result = await fetch(`http://ext.nicovideo.jp/api/getthumbinfo/${id}`);
  const xml = await result.text();

  const parsedXML = parseXML(xml);
  const parsedResult = schema.safeParse(parsedXML.nicovideo_thumb_response);

  if (!parsedResult.success) {
    return { ok: false, error: { status: 404 } };
  }
  if (parsedResult.data["@status"] === "fail") {
    return { ok: false, error: { status: 404 } };
  }

  const {
    data: {
      thumb: {
        video_id,
        watch_url,
        thumbnail_url,
        first_retrieve,
        title,
        tags,
      },
    },
  } = parsedResult;

  const normalizedTags = tags.tag.map((tag) => {
    if (typeof tag === "string") {
      return tag;
    }
    return tag["#text"];
  });
  const isPossiblyOtomad = normalizedTags.includes("音MAD");

  return {
    ok: true,
    value: {
      video_id,
      watch_url,
      thumbnail_url,
      thumbnail_url_large: `${thumbnail_url}.L`,
      first_retrieve,
      title,
      tags: normalizedTags,
      isPossiblyOtomad: isPossiblyOtomad,
    },
  };
};
