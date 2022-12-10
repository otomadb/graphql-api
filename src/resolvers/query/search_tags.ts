import { DataSource, In, Like } from "typeorm";

import { TagName } from "../../db/entities/tag_names.js";
import { Tag } from "../../db/entities/tags.js";
import { TagModel } from "../../graphql/models.js";
import { QueryResolvers } from "../../graphql/resolvers.js";

export const searchTags =
  ({ dataSource }: { dataSource: DataSource }): QueryResolvers["searchTags"] =>
  async (_, { input }) => {
    const tagNames = await dataSource
      .getRepository(TagName)
      .createQueryBuilder("tagName")
      .where({ name: Like(`%${input.query}%`) })
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
