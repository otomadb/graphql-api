import { GraphQLError } from "graphql";

import { QueryResolvers } from "../resolvers/graphql.js";
import { isValidYoutubeSourceId } from "../utils/isValidYoutubeSourceId.js";

export const resolverFetchYoutube = () =>
  (async (_parent, { input: { sourceId } }) => {
    if (!isValidYoutubeSourceId(sourceId)) {
      throw new GraphQLError("Invalid sourceId");
    }

    const thumbnailUrl = new URL(`vi/${sourceId}/hqdefault.jpg`, "https://i.ytimg.com/");
    const ok = await fetch(thumbnailUrl.toString()).then((res) => res.ok);
    if (!ok) return { source: null };

    const url = new URL("/watch", "https://www.youtube.com/");
    url.searchParams.set("v", sourceId);

    return {
      source: {
        url: url.toString(),
        sourceId,
        thumbnailUrl: thumbnailUrl.toString(),
      },
    };
  }) satisfies QueryResolvers["fetchYoutube"];
