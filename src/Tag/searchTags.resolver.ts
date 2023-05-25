import { QueryResolvers } from "../resolvers/graphql.js";
import { ResolverDeps } from "../resolvers/types.js";
import { TagSearchItemByNameDTO } from "./dto.js";

export const resolverSearchTags = ({ meilisearch }: Pick<ResolverDeps, "meilisearch">) =>
  (async (_, { input }) => {
    const index = await meilisearch.getIndex<{
      id: string;
      name: string;
      tag_id: string;
    }>("tags");
    const { hits } = await index.search(input.query, {
      limit: input.limit,
      offset: input.skip,
      showMatchesPosition: true,
    });
    return {
      items: hits.map(({ id, tag_id }) => TagSearchItemByNameDTO.make({ nameId: id, tagId: tag_id })),
    };
  }) satisfies QueryResolvers["searchTags"];
