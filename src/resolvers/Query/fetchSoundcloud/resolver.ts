import { GraphQLError } from "graphql";

import { SoundcloudService } from "../../../Soundcloud/service.js";
import { isErr } from "../../../utils/Result.js";
import { QueryResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../types.js";

export const resolverFetchSoundcloud = ({
  logger,
  soundcloudService: sc,
}: Pick<ResolverDeps, "logger" | "soundcloudService">) =>
  (async (_parent, { url }, _ctx, info) => {
    const result = await sc.fetchFromUrl(url);

    if (isErr(result)) {
      logger.error({ path: info.path, error: result.error }, "Something wrong");
      throw new GraphQLError("error");
    }

    const value = result.data;

    return {
      source: {
        artworkUrl: SoundcloudService.enlargeArtwork(value.artwork_url),
        sourceId: value.id.toString(),
        title: value.title,
        uri: value.uri,
      },
    };
  }) satisfies QueryResolvers["fetchSoundcloud"];
