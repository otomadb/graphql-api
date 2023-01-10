import { GraphQLError } from "graphql";
import { DataSource } from "typeorm";

import { TagName } from "../../db/entities/tag_names.js";
import { TagParent } from "../../db/entities/tag_parents.js";
import { VideoTag } from "../../db/entities/video_tags.js";
import { Resolvers, TagResolvers, TagType } from "../../graphql.js";
import { buildGqlId, parseGqlID } from "../../utils/id.js";
import { VideoModel } from "../Video/model.js";
import { TagModel } from "./model.js";
import { resolvePseudoType } from "./pseudoType.js";

export const resolveHistory = (() => ({ nodes: [] })) satisfies TagResolvers["history"];

export const resolveTag = ({ dataSource }: { dataSource: DataSource }) =>
  ({
    id: ({ id }): string => buildGqlId("Tag", id),
    type: () => TagType.Material,
    pseudoType: resolvePseudoType({ dataSource }),

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

    parents: async ({ id: tagId }, { meaningless }) => {
      const rel = await dataSource
        .getRepository(TagParent)
        .find({ where: { child: { id: tagId } }, relations: { parent: true } })
        .then((v) => v.filter(({ parent }) => typeof meaningless !== "boolean" || parent.meaningless === meaningless));
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

    history: resolveHistory,

    canTagTo: async ({ id: tagId }, { videoId: videoGqlId }) => {
      const videoId = parseGqlID("Video", videoGqlId);

      return dataSource
        .getRepository(VideoTag)
        .findOne({ where: { tag: { id: tagId }, video: { id: videoId } } })
        .then((v) => !v);
    },
  } satisfies Resolvers["Tag"]);
