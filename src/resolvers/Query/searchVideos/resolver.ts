import { QueryResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../types.js";
import { VideoSearchResultByTitleModel } from "../../VideoSearchResultByTitle/model.js";

export const searchVideos = ({ meilisearch }: Pick<ResolverDeps, "meilisearch">) =>
  (async (_, { input }) => {
    const index = await meilisearch.getIndex<{
      id: string;
      title: string;
      video_id: string;
    }>("videos");
    const { hits } = await index.search(input.query, {
      limit: input.limit,
      offset: input.skip,
      showMatchesPosition: true,
    });
    return {
      items: hits.map(({ id, video_id }) => VideoSearchResultByTitleModel.make({ titleId: id, videoId: video_id })),
    };
  }) satisfies QueryResolvers["searchVideos"];
