import { GraphQLError } from "graphql";
import { dataSource } from "../db/data-source.js";
import { Video } from "../db/entities/videos.js";
import { VideoTag } from "../db/entities/video_tags.js";
import { VideoThumbnail } from "../db/entities/video_thumbnails.js";
import { VideoTitle as VideoTitleEntity } from "../db/entities/video_titles.js";
import { VideoResolvers } from "../graphql/resolvers.js";
import { addIDPrefix, ObjectType } from "../utils/id.js";
import { ResolverArgs } from "../utils/type.js";
import { TagModel } from "./tag.js";
import { VideoThumbnailModel } from "./video_thumbnail.js";
import { VideoTitleModel } from "./video_title.js";

export class VideoModel implements VideoResolvers {
  constructor(private readonly video: Video) {}

  id() {
    return addIDPrefix(ObjectType.Video, this.video.id);
  }

  async title() {
    const videoTitles = await this.titles();
    const videoTitle = videoTitles.find((t) => t.primary());
    if (videoTitle === undefined) throw new GraphQLError(`primary title for video ${this.video.id} is not found`);

    return videoTitle.title();
  }

  async titles() {
    const videoTitles = await dataSource
      .getRepository(VideoTitleEntity)
      .find({ where: { video: { id: this.video.id } } });

    return videoTitles.map((t) => new VideoTitleModel(t));
  }

  async thumbnailUrl() {
    const videoThumbnails = await this.thumbnails();
    const videoThumbnail = videoThumbnails.find((t) => t.primary());
    if (videoThumbnail === undefined)
      throw new GraphQLError(`primary thumbnail for video ${this.video.id} is not found`);

    return videoThumbnail.imageUrl();
  }

  async thumbnails() {
    const videoThumbnails = await dataSource
      .getRepository(VideoThumbnail)
      .find({ where: { video: { id: this.video.id } } });

    return videoThumbnails.map((t) => new VideoThumbnailModel(t));
  }

  async tags() {
    const tags = await dataSource.getRepository(VideoTag).find({
      where: { video: { id: this.video.id } },
      relations: {
        tag: true,
      },
    });
    return tags.map(({ tag }) => new TagModel(tag));
  }

  async hasTag(...[_parent, { id }]: ResolverArgs<VideoResolvers["hasTag"]>) {
    const tags = await this.tags();

    return tags.some((t) => t.id() === id);
  }

  history() {
    return [] as any;
  }

  registeredAt() {
    return this.video.createdAt;
  }
}
