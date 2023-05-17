import { z } from "zod";

import { err, isErr, ok, Result } from "../utils/Result.js";

const payloadFromUrl = z.object({
  artwork_url: z.string(),
  id: z.number(),
  title: z.string(),
  uri: z.string(),
});

const payloadFromId = z
  .array(
    z.object({
      artwork_url: z.string(),
      id: z.number(),
      title: z.string(),
      permalink_url: z.string(),
    })
  )
  .min(1);

export class SoundcloudService {
  private constructor(private clientId: string) {}

  public static make({ env: { clientId } }: { env: { clientId: string } }) {
    return new SoundcloudService(clientId);
  }

  public static enlargeArtwork(artworkUrl: string) {
    return artworkUrl.replace("large", "t500x500");
  }

  public async fetchFromUrl(url: string): Promise<
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
    apiUrl.searchParams.set("client_id", this.clientId);

    const parsed = await fetch(apiUrl.toString())
      .then((res) => res.json())
      .then((json) => payloadFromUrl.safeParse(json));

    if (!parsed.success) return err({ type: "PARSED_ERROR", error: parsed.error });

    return ok(parsed.data);
  }

  public async fetchFromId(id: string): Promise<
    Result<
      {
        type: "PARSED_ERROR";
        error: unknown; // todo
      },
      z.infer<typeof payloadFromId>[number]
    >
  > {
    const apiUrl = new URL("/tracks", "https://api-v2.soundcloud.com");
    apiUrl.searchParams.set("ids", id);
    apiUrl.searchParams.set("client_id", this.clientId);

    const parsed = await fetch(apiUrl.toString())
      .then((res) => res.json())
      .then((json) => payloadFromId.safeParse(json));

    if (!parsed.success) return err({ type: "PARSED_ERROR", error: parsed.error });

    return ok(parsed.data[0]);
  }

  public async fetchUrl(id: string): Promise<
    Result<
      {
        type: "PARSED_ERROR";
        error: unknown; // todo
      },
      string
    >
  > {
    const payload = await this.fetchFromId(id);
    if (isErr(payload)) return payload;
    return ok(payload.data.permalink_url);
  }

  public async fetchEmbedUrl(id: string): Promise<
    Result<
      {
        type: "PARSED_ERROR";
        error: unknown; // todo
      },
      string
    >
  > {
    const a = await this.fetchUrl(id);
    if (isErr(a)) return a;

    const embedUrl = new URL("https://w.soundcloud.com/player");
    embedUrl.searchParams.set("url", a.data);
    embedUrl.searchParams.set("show_artwork", "true");

    return ok(embedUrl.toString());
  }
}
