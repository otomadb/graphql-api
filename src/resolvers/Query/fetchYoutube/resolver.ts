import { GraphQLError } from "graphql";

import { isValidNicovideoSourceId } from "../../../utils/isValidNicovideoSourceId.js";
import { QueryResolvers } from "../../graphql.js";

export const resolverFetchYoutube = () =>
  (async (_parent, { sourceId }) => {
    if (!isValidNicovideoSourceId(sourceId)) {
      throw new GraphQLError("Invalid sourceId");
    }

    const url = new URL(`vi/${sourceId}/maxresdefault.jpg`, "https://i.ytimg.com/");

    const ok = await fetch(url.toString()).then((res) => res.ok);
    if (!ok) return { source: null };

    return {
      source: {
        sourceId,
        thumbnailUrl: url.toString(),
      },
    };
  }) satisfies QueryResolvers["fetchYoutube"];
