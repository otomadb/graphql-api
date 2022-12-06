import { In, Like } from "typeorm";

import { QueryResolvers } from "~/codegen/resolvers.js";
import { dataSource } from "~/db/data-source.js";
import { TagName } from "~/db/entities/tag_names.js";
import { Tag } from "~/db/entities/tags.js";
import { TagModel } from "~/models/tag.js";

export const searchTags: QueryResolvers["searchTags"] = async (_parent, { limit, query, skip }, _context, _info) => {
  const tagNames = await dataSource
    .getRepository(TagName)
    .createQueryBuilder("tagName")
    .where({ name: Like(`%${query}%`) })
    .leftJoinAndSelect("tagName.tag", "tags")
    .distinctOn(["tagName.tag.id"])
    .getMany();

  const tags = await dataSource.getRepository(Tag).find({
    where: { id: In(tagNames.map((t) => t.tag.id)) },
  });

  return {
    result: tagNames.map((n) => {
      const tag = tags.find((t) => t.id === n.tag.id);
      if (!tag) throw new Error(`Failed to find tag ${n.tag.id}`);
      return {
        matchedName: n.name,
        tag: new TagModel(tag),
      };
    }),
  };
};
