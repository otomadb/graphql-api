import { SemitagResolvers } from "../../graphql.js";
import { SemitagSuggestTagsItemModel } from "../../SemitagSuggestTagsItem/model.js";
import { ResolverDeps } from "../../types.js";

export const resolverSemitagSuggestTags = ({ meilisearch }: Pick<ResolverDeps, "meilisearch">) =>
  (async ({ dbId, name }, { limit, skip }) => {
    const index = await meilisearch.getIndex<{
      id: string;
      name: string;
      tag_id: string;
    }>("tags");
    const { hits } = await index.search(name, {
      limit,
      offset: skip,
      showMatchesPosition: true,
    });
    return {
      items: hits.map(({ id, tag_id }) =>
        SemitagSuggestTagsItemModel.make({
          semitagId: dbId,
          nameId: id,
          tagId: tag_id,
        }),
      ),
    };
  }) satisfies SemitagResolvers["suggestTags"];
