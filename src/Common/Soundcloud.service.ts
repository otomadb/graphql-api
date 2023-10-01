import { Redis } from "ioredis";
import { Logger } from "pino";
import { z } from "zod";

import { SoundcloudOriginalSourceDTO } from "../FetchExternal/SoundcloudOriginalSource.dto.js";
import { fetchSoundcloudKey } from "../utils/fetchSoundcloudKey.js";
import { err, ok, Result } from "../utils/Result.js";

const scK = "soundcloud:client_id";

export const mkSoundcloudService = ({ redis, logger }: { redis: Redis; logger: Logger }) => {
  return {
    async fetchFromSourceId(
      id: string,
    ): Promise<Result<"SOUNDCLOUD_KEY_NOT_FOUND" | "PARSED_ERROR", SoundcloudOriginalSourceDTO>> {
      let clientId = await redis.get(scK);
      if (!clientId) {
        clientId = await fetchSoundcloudKey();
        if (!clientId) return err("SOUNDCLOUD_KEY_NOT_FOUND");
      }

      const apiUrl = new URL("/tracks", "https://api-v2.soundcloud.com");
      apiUrl.searchParams.set("ids", id);
      apiUrl.searchParams.set("client_id", clientId);
      logger.debug(apiUrl.toString());

      const parsed = await fetch(apiUrl.toString())
        .then((res) => res.json())
        .then((json) =>
          z
            .array(
              z.object({
                artwork_url: z.string(),
                id: z.number(),
                title: z.string(),
                permalink_url: z.string(),
                kind: z.literal("track"),
              }),
            )
            .min(1)
            .safeParse(json),
        );

      if (!parsed.success) {
        logger.error({ payload: parsed.error }, "Payload of fetchd user from Soundcloud is invalid");
        return err("PARSED_ERROR");
      }

      await redis.setex(scK, 60 * 60 * 12, clientId);

      const d = parsed.data[0];

      return ok(
        SoundcloudOriginalSourceDTO.make({
          title: d.title,
          sourceId: d.id.toString(),
          originalThumbnailUrl: d.artwork_url,
          url: d.permalink_url,
        }),
      );
    },

    async fetchFromUrl(
      url: string,
    ): Promise<Result<"SOUNDCLOUD_KEY_NOT_FOUND" | "PARSED_ERROR", SoundcloudOriginalSourceDTO>> {
      let clientId = await redis.get(scK);
      if (!clientId) {
        clientId = await fetchSoundcloudKey();
        if (!clientId) return err("SOUNDCLOUD_KEY_NOT_FOUND");
      }

      const apiUrl = new URL("/resolve", "https://api-v2.soundcloud.com");
      apiUrl.searchParams.set("url", url);
      apiUrl.searchParams.set("client_id", clientId);
      logger.debug(apiUrl.toString());

      const parsed = await fetch(apiUrl.toString())
        .then((res) => res.json())
        .then((json) =>
          z
            .object({
              artwork_url: z.string(),
              id: z.number(),
              title: z.string(),
              permalink: z.string(),
              permalink_url: z.string(),
              kind: z.literal("track"),
            })
            .safeParse(json),
        );

      if (!parsed.success) {
        logger.error({ payload: parsed.error }, "Payload of fetchd user from Soundcloud is invalid");
        return err("PARSED_ERROR");
      }

      await redis.setex(scK, 60 * 60 * 12, clientId);

      return ok(
        SoundcloudOriginalSourceDTO.make({
          title: parsed.data.title,
          sourceId: parsed.data.id.toString(),
          originalThumbnailUrl: parsed.data.artwork_url,
          url: parsed.data.permalink_url,
        }),
      );
    },
  };
};

export type SoundcloudService = ReturnType<typeof mkSoundcloudService>;