import { GraphQLError } from "graphql";
import { In } from "typeorm";
import { dataSource } from "../db/data-source.js";
import { Video } from "../db/entities/videos.js";
import { VideoTag } from "../db/entities/video_tags.js";
import { VideoThumbnail } from "../db/entities/video_thumbnails.js";
import { VideoTitle as VideoTitleEntity } from "../db/entities/video_titles.js";
import { VideoResolvers } from "../graphql/resolvers.js";
import { calcVideoSimilarities } from "../neo4j/video_similarities.js";
import { addIDPrefix, ObjectType } from "../utils/id.js";
import { ResolverArgs } from "../utils/type.js";
import { TagModel } from "./tag.js";
import { VideoThumbnailModel } from "./video_thumbnail.js";
import { VideoTitleModel } from "./video_title.js";

// TODO: 全然実際の挙動と型推論が乖離していたので一旦外す
export class VideoModel /* implements VideoResolvers */ {
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

  async similarVideos(args: { input?: { limit?: number } }) {
    const similarities = await calcVideoSimilarities(this.video.id, { limit: args.input?.limit || 0 });

    const items = await dataSource
      .getRepository(Video)
      .find({ where: { id: In(similarities.map(({ videoId }) => videoId)) } })
      .then((vs) =>
        vs.map((v) => {
          const { score } = similarities.find(({ videoId }) => videoId === v.id)!; // TODO: 危険
          return {
            video: new VideoModel(v),
            score,
          };
        })
      );

    return { items: items };
  }
}
