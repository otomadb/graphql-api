import { Resolvers } from "../resolvers/graphql.js";
import { ResolverDeps } from "../resolvers/types.js";
import { TagSearchItemByNameDTO } from "../Tag/dto.js";

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
        items: hits.map(({ id, tag_id }) => TagSearchItemByNameDTO.make({ nameId: id, tagId: tag_id })),
      };
    },
  }) satisfies Resolvers["NicovideoOriginalSourceTag"];
