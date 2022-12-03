import { GraphQLError } from "graphql";
import { dataSource } from "../db/data-source.js";
import { Tag } from "../db/entities/tags.js";
import { QueryResolvers, TagType } from "../graphql/resolvers.js";
import { videoEntityToGraphQLVideo } from "./videos.js";

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

  return {
    id: "video:" + tag.id,
    type: TagType.Material,
    name: tag.name,
    names: tag.tagNames,

    taggedVideos: tag.videoTags.map((t) => videoEntityToGraphQLVideo(t.video)),
    history: [],

    explicitParent: null,
    parents: tag.tagParents,
    meaningless: tag.meaningless,
  };
};
