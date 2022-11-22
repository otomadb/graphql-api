import { GraphQLError } from "graphql";
import { MongoClient, ObjectId } from "mongo/mod.ts";
import { getTagsCollection, getVideoHistoryCollection } from "~/common/collections.ts";
import { Tag } from "~/tags/mod.ts";
import { VideoAddTagHistoryItem, VideoRegisterHistoryItem } from "./history_item_class.ts";

export class VideoTitle {
  private _title;
  private _primary;

  constructor({ title, primary }: { title: string; primary?: boolean }) {
    this._title = title;
    this._primary = primary;
  }

  title() {
    return this._title;
  }

  primary() {
    return !!this._primary;
  }
}

export class VideoThumbnail {
  public imageUrl;
  private _primary;

  constructor({ image_url, primary }: { image_url: string; primary?: boolean }) {
    this.imageUrl = image_url;
    this._primary = primary;
  }

  primary() {
    return !!this._primary;
  }
}

export class Video {
  private _id;
  private _titles;
  private _tags;
  private _history: ObjectId[];
  private _thumbnails: { image_url: string; primary?: boolean }[];

  constructor({ id, titles, tags, history, thumbnails }: {
    id: string;
    titles: { title: string; primary?: boolean }[];
    tags: string[];
    history: ObjectId[];
    thumbnails: { image_url: string; primary?: boolean }[];
  }) {
    this._id = id;
    this._titles = titles;
    this._tags = tags;
    this._history = history;
    this._thumbnails = thumbnails;
  }

  id() {
    return this._id;
  }

  titles() {
    return this._titles.map((v) => new VideoTitle(v));
  }

  title(_: unknown) {
    const title = this.titles().find((v) => v.primary());
    if (!title) {
      throw new GraphQLError("no primary title");
    }
    return title.title();
  }

  thumbnailUrl() {
    const thumbnail = this.thumbnails().find(({ primary }) => primary);
    if (!thumbnail) {
      throw new GraphQLError("no thumbnail");
    }
    return thumbnail.imageUrl;
  }

  thumbnails() {
    return this._thumbnails.map(({ image_url, primary }) => new VideoThumbnail({ image_url, primary }));
  }

  async tags(_: unknown, context: { mongo: MongoClient }) {
    const tagsColl = getTagsCollection(context.mongo);
    const tags = await tagsColl.find({ _id: { $in: this._tags } }).toArray();
    return tags.map(({ _id, names, type, history }) => new Tag({ id: _id, names, type, history }));
  }

  async history(
    { skip, limit, order }: { skip: number; limit: number; order: { createdAt?: "ASC" | "DESC" } },
    context: { mongo: MongoClient },
  ) {
    console.log(skip, limit, order);
    const taghistColls = getVideoHistoryCollection(context.mongo);

    const items = await taghistColls.find(
      { _id: { $in: this._history } },
      {
        skip,
        limit,
        sort: { "created_at": order.createdAt === "ASC" ? 1 : -1 },
      },
    ).toArray();
    return items.map(
      (item) => {
        switch (item.type) {
          case "REGISTER": {
            const { _id, user_id, created_at, video_id } = item;
            return new VideoRegisterHistoryItem({
              id: _id,
              userId: user_id,
              createdAt: created_at,
              videoId: video_id,
            });
          }
          case "ADD_TAG": {
            const { _id, user_id, created_at, tag_id, video_id } = item;
            return new VideoAddTagHistoryItem({
              id: _id,
              userId: user_id,
              createdAt: created_at,
              tagId: tag_id,
              videoId: video_id,
            });
          }
          default:
            throw new GraphQLError("something wrong");
        }
      },
    );
  }
}
