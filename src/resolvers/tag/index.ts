import { GraphQLError } from "graphql";
import { DataSource } from "typeorm";

import { TagName } from "../../db/entities/tag_names.js";
import { TagParent } from "../../db/entities/tag_parents.js";
import { VideoTag } from "../../db/entities/video_tags.js";
import { TagModel, VideoModel } from "../../graphql/models.js";
import { Resolvers, TagType } from "../../graphql/resolvers.js";
import { addIDPrefix, ObjectType } from "../../utils/id.js";

export const resolveTag: Resolvers["Tag"] = {
  id: ({ id }: TagModel) => addIDPrefix(ObjectType.Tag, id),
  type: () => TagType.Material,

  names: async ({ id: tagId }) => {
    const names = await dataSource.getRepository(TagName).find({
      where: { tag: { id: tagId } },
    });
    return names.map((n) => ({
      name: n.name,
      primary: n.primary,
    }));
  },
  name: async ({ id: tagId }) => {
    const name = await dataSource.getRepository(TagName).findOne({
      where: { tag: { id: tagId }, primary: true },
    });
    if (!name) throw new GraphQLError(`primary name for tag ${tagId} is not found`);
    return name.name;
  },

  parents: async ({ id: tagId }) => {
    const rel = await dataSource.getRepository(TagParent).find({
      where: { child: { id: tagId } },
      relations: { parent: true },
    });
    return rel.map(({ parent, explicit }) => ({
      tag: new TagModel(parent),
      explicit,
    }));
  },

  explicitParent: async ({ id: tagId }) => {
    const rel = await dataSource.getRepository(TagParent).findOne({
      where: { child: { id: tagId }, explicit: true },
      relations: { parent: true },
    });
    if (!rel) return null;

    const { parent } = rel;
    return new TagModel(parent);
  },

  taggedVideos: async ({ id: tagId }) => {
    const videoTags = await dataSource
      .getRepository(VideoTag)
      .find({ where: { tag: { id: tagId } }, relations: { video: true } });

    return videoTags.map(({ video }) => new VideoModel(video));
  },

  history: () => [],
};
