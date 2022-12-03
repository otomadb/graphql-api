import { GraphQLError } from "graphql";
import { FindOptionsRelations, In, Like } from "typeorm";
import { ulid } from "ulid";
import { dataSource } from "../db/data-source.js";
import { Tag } from "../db/entities/tags.js";
import { TagName } from "../db/entities/tag_names.js";
import { MutationResolvers, QueryResolvers, Tag as GqlTag, TagType } from "../graphql/resolvers.js";
import { addIDPrefix, ObjectType, removeIDPrefix } from "../utils/id.js";
import { videoEntityToGraphQLType } from "./videos.js";

export const tagEntityToGraphQLTypeRelations: FindOptionsRelations<Tag> = {
  tagNames: true,
  tagParents: { tag: true },
  videoTags: {
    video: true,
  },
};

export function tagEntityToGraphQLType(tag: Tag): GqlTag {
  return {
    id: addIDPrefix(ObjectType.Tag, tag.id),
    type: TagType.Material,
    name: tag.tagNames.find((n) => n.primary)?.name!,
    names: tag.tagNames,

    taggedVideos: tag.videoTags.map((t) => videoEntityToGraphQLType(t.video)),
    history: [],

    explicitParent: null,
    parents: tag.tagParents.map((parent) => {
      return {
        tag: tagEntityToGraphQLType(parent.tag),
        explicit: parent.explicit,
      };
    }),
    meaningless: tag.meaningless,
  };
}

export const tag: QueryResolvers["tag"] = async (_parent, { id }, _context, _info) => {
  const tag = await dataSource.getRepository(Tag).findOne({
    relations: tagEntityToGraphQLTypeRelations,
    where: { id: removeIDPrefix(ObjectType.Tag, id) },
  });
  if (!tag) throw new GraphQLError("Not Found");

  return tagEntityToGraphQLType(tag);
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
    relations: tagEntityToGraphQLTypeRelations,
  });

  return {
    result: tagNames.map((n) => {
      const tag = tags.find((t) => t.id === n.tag.id);
      if (!tag) throw new Error(`Failed to find tag ${n.tag.id}`);
      return {
        matchedName: n.name,
        tag: tagEntityToGraphQLType(tag),
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

  return { tag: tagEntityToGraphQLType(tag) };
};
