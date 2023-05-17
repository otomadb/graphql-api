import { z } from "zod";

import { err, ok, Result } from "../utils/Result.js";

const payloadFromUrl = z.object({
  artwork_url: z.string(),
  id: z.number(),
  title: z.string(),
  uri: z.string(),
});

export const makeSoundcloudService = ({ env: { clientId } }: { env: { clientId: string } }) => ({
  enlargeArtwork(artworkUrl: string) {
    return artworkUrl.replace("large", "t500x500");
  },
  async fetchFromUrl(url: string): Promise<
    Result<
      {
        type: "PARSED_ERROR";
        error: unknown; // todo
      },
      z.infer<typeof payloadFromUrl>
    >
  > {
    const apiUrl = new URL("/resolve", "https://api-v2.soundcloud.com");
    apiUrl.searchParams.set("url", url);
    apiUrl.searchParams.set("client_id", clientId);

    const parsed = await fetch(apiUrl.toString())
      .then((res) => res.json())
      .then((json) => payloadFromUrl.safeParse(json));

    if (!parsed.success) return err({ type: "PARSED_ERROR", error: parsed.error });

    return ok(parsed.data);
  },
  /*
  async fetchFromId(id: string): Promise<
    Result<
      unknown,
      {
        title: string;
        artworkUrl: string;
        sourceId: string;
        sourceUrl: string;
      }
    >
  > {
    return ok({
      title: "",
      artworkUrl: "",
      sourceId: "",
      sourceUrl: "",
    });
  },
  */
});
