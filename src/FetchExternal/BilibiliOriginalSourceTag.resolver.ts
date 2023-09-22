import { TagSearchItemByNameDTO } from "../Tag/dto.js";
import { MkResolver } from "../utils/MkResolver.js";

export const resolverBilibiliOriginalSourceTag: MkResolver<"BilibiliOriginalSourceTag", "meilisearch"> = ({
  meilisearch,
}) => ({
  name: ({ name }) => name,
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
});
