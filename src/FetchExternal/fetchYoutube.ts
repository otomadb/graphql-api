import { GraphQLError } from "graphql";

import { QueryResolvers } from "../resolvers/graphql.js";
import { isValidYoutubeSourceId } from "../utils/isValidYoutubeSourceId.js";
import { MkQueryResolver } from "../utils/MkResolver.js";
import { YoutubeOriginalSourceDTO } from "./YoutubeOriginalSource.dto.js";

export const resolverFetchYoutube: MkQueryResolver<"fetchYoutube"> = () =>
  (async (_parent, { input: { sourceId } }) => {
    if (!isValidYoutubeSourceId(sourceId)) {
      throw new GraphQLError("Invalid sourceId");
    }

    const originalThumbnailUrl = new URL(`vi/${sourceId}/hqdefault.jpg`, "https://i.ytimg.com/");
    const ok = await fetch(originalThumbnailUrl.toString()).then((res) => res.ok);
    if (!ok) return { source: null };

    const url = new URL("/watch", "https://www.youtube.com/");
    url.searchParams.set("v", sourceId);

    return {
      source: YoutubeOriginalSourceDTO.make({
        url: url.toString(),
        sourceId,
        originalThumbnailUrl: originalThumbnailUrl.toString(),
      }),
    };
  }) satisfies QueryResolvers["fetchYoutube"];
