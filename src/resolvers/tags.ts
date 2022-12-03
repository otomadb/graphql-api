import { GraphQLError } from "graphql";
import { In, Like } from "typeorm";
import { dataSource } from "../db/data-source.js";
import { Tag } from "../db/entities/tags.js";
import { TagName } from "../db/entities/tag_names.js";
import { QueryResolvers, TagType } from "../graphql/resolvers.js";
import { videoEntityToGraphQLVideo } from "./videos.js";

export function tagEntityToGraphQLTag(tag: Tag) {
  return {
    id: "tag:" + tag.id,
    type: TagType.Material,
    name: tag.name,
    names: tag.tagNames,

    taggedVideos: tag.videoTags.map((t) => videoEntityToGraphQLVideo(t.video)),
    history: [],

    explicitParent: null,
    parents: tag.tagParents,
    meaningless: tag.meaningless,
  };
}

export const tag: QueryResolvers["tag"] = async (_parent, { id }, _context, _info) => {
  const tag = await dataSource.getRepository(Tag).findOne({
    relations: [
      "tagNames",
      "tagParents",
      "videoTags",
      "videoTags.video",
      "videoTags.video.source",
      "videoTags.video.thumbnails",
      "videoTags.video.titles",
    ],
    where: { id },
  });
  if (!tag) throw new GraphQLError("Not Found");

  return tagEntityToGraphQLTag(tag);
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
    relations: [
      "tagNames",
      "tagParents",
      "videoTags",
      "videoTags.video",
      "videoTags.video.source",
      "videoTags.video.thumbnails",
      "videoTags.video.titles",
    ],
  });

  return {
    result: tagNames.map((n) => {
      const tag = tags.find((t) => t.id === n.tag.id);
      if (!tag) throw new Error(`Failed to find tag ${n.tag.id}`);
      return {
        matchedName: n.name,
        tag: tagEntityToGraphQLTag(tag),
      };
    }),
  };
};
