import { GraphQLError } from "graphql";
import { z } from "zod";

import { MkQueryResolver } from "../utils/MkResolver.js";

export const mkFindSoundcloudMADSourceResolver: MkQueryResolver<
  "findSoundcloudMADSource",
  "SoundcloudMADSourceService"
> =
  ({ SoundcloudMADSourceService }) =>
  async (_, { input }) => {
    const i = z
      .union([
        z.object({
          sourceId: z.string(),
        }),
        z.object({
          url: z.string(),
        }),
      ])
      .safeParse(input);
    if (!i.success) throw new GraphQLError("Wrong args");

    if ("sourceId" in i.data) {
      return SoundcloudMADSourceService.findBySourceId(i.data.sourceId);
    } else {
      return SoundcloudMADSourceService.findByUrl(i.data.url).catch(() => {
        throw new GraphQLError("Something wrong");
      });
    }
  };
