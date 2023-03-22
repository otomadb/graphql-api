import { Resolvers } from "../graphql.js";
import { TagSearchResultByNameModel } from "../TagSearchResultByName/model.js";
import { ResolverDeps } from "../types.js";

export const resolveNicovideoOriginalSourceTag = ({ meilisearch }: Pick<ResolverDeps, "meilisearch">) =>
  ({
    searchTags: async ({ name }, { input }) => {
      const index = await meilisearch.getIndex<{
        id: string;
        name: string;
        tag_id: string;
      }>("tags");
      const { hits } = await index.search(name, {
        limit: input.limit,
        offset: input.skip,
        showMatchesPosition: true,
      });
      return {
        items: hits.map(({ id, tag_id }) => TagSearchResultByNameModel.make({ nameId: id, tagId: tag_id })),
      };
    },
  } satisfies Resolvers["NicovideoOriginalSourceTag"]);
