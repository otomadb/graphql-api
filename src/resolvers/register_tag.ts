import { ulid } from "ulid";
import { dataSource } from "../db/data-source.js";
import { Tag } from "../db/entities/tags.js";
import { TagName } from "../db/entities/tag_names.js";
import { MutationResolvers } from "../graphql/resolvers.js";
import { TagModel } from "../models/tag.js";

export const registerTag: MutationResolvers["registerTag"] = async (parent, { input }, context, info) => {
  const tag = new Tag();
  tag.id = ulid();
  tag.videoTags = [];
  tag.tagNames = [];
  tag.tagParents = [];

  const tagNames: TagName[] = [];

  const primaryTagName = new TagName();
  primaryTagName.id = ulid();
  primaryTagName.name = input.primaryName;
  primaryTagName.primary = true;
  primaryTagName.tag = tag;

  tagNames.push(primaryTagName);

  if (input.extraNames) {
    tagNames.push(
      ...input.extraNames.map((n) => {
        const tagName = new TagName();
        tagName.id = ulid();
        tagName.name = n;
        tagName.tag = tag;

        return tagName;
      })
    );
  }

  await dataSource.transaction(async (manager) => {
    await manager.getRepository(Tag).insert(tag);
    await manager.getRepository(TagName).insert(tagNames);
  });

  tag.tagNames = tagNames;

  return { tag: new TagModel(tag) };
};
