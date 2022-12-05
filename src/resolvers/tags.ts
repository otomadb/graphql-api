import { GraphQLError } from "graphql";
import { In, Like } from "typeorm";
import { ulid } from "ulid";
import { dataSource } from "../db/data-source.js";
import { Tag } from "../db/entities/tags.js";
import { TagName } from "../db/entities/tag_names.js";
import { MutationResolvers, QueryResolvers } from "../graphql/resolvers.js";
import { TagModel } from "../models/tag.js";
import { registerTag as registerTagToNeo4j } from "../neo4j/register_tag.js";
import { ObjectType, removeIDPrefix } from "../utils/id.js";

export const tag: QueryResolvers["tag"] = async (_parent, { id }, _context, _info) => {
  const tag = await dataSource.getRepository(Tag).findOne({
    where: { id: removeIDPrefix(ObjectType.Tag, id) },
  });
  if (!tag) throw new GraphQLError("Not Found");

  return new TagModel(tag);
};

export const tags: QueryResolvers["tags"] = async (_parent, { input }, _context, _info) => {
  const tags = await dataSource.getRepository(Tag).find({
    take: input?.limit || 0,
    skip: input?.skip || 0,
    order: {
      createdAt: input?.order?.createdAt || undefined,
      updatedAt: input?.order?.updatedAt || undefined,
    },
  });

  return { nodes: tags.map((t) => new TagModel(t)) };
};

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

  await registerTagToNeo4j(tag.id);

  return { tag: new TagModel(tag) };
};
