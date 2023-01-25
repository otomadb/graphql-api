import { GraphQLError } from "graphql";

import { QueryResolvers } from "../../../graphql.js";
import { ResolverDeps } from "../../index.js";
import { TagModel } from "../../Tag/model.js";

export const searchTags = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_, { input }) => {
    const tagNames = await dataSource
      .getRepository(TagName)
      .createQueryBuilder("tagName")
      .where({ name: Like(`%${input.query}%`) })
      .leftJoinAndSelect("tagName.tag", "tags")
      .distinctOn(["tagName.tag.id"])
      .skip(input.skip)
      .limit(input.limit)
      .getMany();

    const tags = await dataSource.getRepository(Tag).find({
      where: { id: In(tagNames.map((t) => t.tag.id)) },
    });

    return {
      items: tagNames.map((n) => {
        const tag = tags.find((t) => t.id === n.tag.id);
        if (!tag) throw new GraphQLError(`Data inconcistency is occuring for "video:${n.tag.id}"`);
        return {
          matchedName: n.name,
          tag: new TagModel(tag),
        };
      }),
    };
  }) satisfies QueryResolvers["searchTags"];
