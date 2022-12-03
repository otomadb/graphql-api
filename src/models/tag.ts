import { GraphQLError } from "graphql";
import { dataSource } from "../db/data-source.js";
import { Tag } from "../db/entities/tags.js";
import { TagName } from "../db/entities/tag_names.js";
import { TagParent } from "../db/entities/tag_parents.js";
import { VideoTag } from "../db/entities/video_tags.js";
import { TagResolvers, TagType } from "../graphql/resolvers.js";
import { addIDPrefix, ObjectType } from "../utils/id.js";
import { TagNameModel } from "./tag_name.js";
import { TagParentModel } from "./tag_parent.js";
import { VideoModel } from "./video.js";

export class TagModel implements TagResolvers {
  constructor(private readonly tag: Tag) {}

  id() {
    return addIDPrefix(ObjectType.Tag, this.tag.id);
  }

  /**
   * @deprecated
   */
  type() {
    return TagType.Material;
  }

  async name() {
    const names = await this.names();
    const name = names.find((n) => n.primary);

    if (name === undefined) throw new GraphQLError(`primary title for tag ${this.tag.id} is not found`);
    return name.name();
  }

  async names() {
    const names = await dataSource.getRepository(TagName).find({ where: { tag: this.tag } });
    return names.map((n) => new TagNameModel(n));
  }

  async taggedVideos() {
    const videoTags = await dataSource
      .getRepository(VideoTag)
      .find({ where: { tag: this.tag }, relations: { video: true } });

    return await Promise.all(videoTags.map((t) => new VideoModel(t.video)));
  }

  history() {
    return [] as any;
  }

  async explicitParent() {
    const parents = await this.parents();
    const parent = parents.find((p) => p.explicit);
    return parent?.tag() ?? null;
  }

  async parents() {
    const parents = await dataSource.getRepository(TagParent).find({
      where: {
        child: {
          id: this.tag.id,
        },
      },
      relations: TagParentModel.needRelations,
    });
    return parents.map((p) => new TagParentModel(p));
  }

  meaningless() {
    return this.tag.meaningless;
  }
}
