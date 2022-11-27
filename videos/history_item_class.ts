import { GraphQLError } from "graphql";
import { MongoClient, ObjectId } from "mongodb";
import { getTagsCollection, getUsersCollection, getVideosCollection } from "../common/collections.js";
import { Tag } from "../tags/mod.js";
import { User } from "../users/mod.js";
import { Video } from "./class.js";

export abstract class VideoHistoryItem {
  protected _id: ObjectId;
  protected userId: string;
  protected createdAt: Date;
  protected videoId: string;

  constructor({ id, userId, createdAt, videoId }: { id: ObjectId; userId: string; createdAt: Date; videoId: string }) {
    this._id = id;
    this.userId = userId;
    this.createdAt = createdAt;
    this.videoId = videoId;
  }

  abstract get __typename(): string;

  id() {
    return this._id.toString();
  }

  async video(_: unknown, { mongo }: { mongo: MongoClient }): Promise<Video> {
    const videosColl = getVideosCollection(mongo);

    const video = await videosColl.findOne({ _id: this.videoId });
    if (!video) {
      throw new GraphQLError("no video found");
    }

    return new Video({
      id: video._id,
      titles: video.titles,
      tags: video.tags,
      thumbnails: video.thumbnails,
    });
  }

  async user(_: unknown, { mongo }: { mongo: MongoClient }): Promise<User> {
    const usersColl = getUsersCollection(mongo);

    const user = await usersColl.findOne({ _id: this.userId });
    if (!user) {
      throw new GraphQLError("no user found");
    }

    return new User({
      id: user._id,
      name: user.name,
      displayName: user.display_name,
      icon: user.icon,
    });
  }
}

export class VideoRegisterHistoryItem extends VideoHistoryItem {
  constructor({ ...rest }: { id: ObjectId; userId: string; createdAt: Date; videoId: string }) {
    super(rest);
  }

  get __typename() {
    return "VideoRegisterHistoryItem";
  }
}

export abstract class VideoTagHistoryItem extends VideoHistoryItem {
  private tagId: string;

  constructor({ tagId, ...rest }: { id: ObjectId; userId: string; createdAt: Date; tagId: string; videoId: string }) {
    super(rest);
    this.tagId = tagId;
  }

  async tag(_: unknown, { mongo }: { mongo: MongoClient }): Promise<Tag> {
    const tagsColl = await getTagsCollection(mongo);
    const tag = await tagsColl.findOne({ _id: this.tagId });
    if (!tag) {
      throw new GraphQLError("not found");
    }
    return new Tag({
      id: tag._id,
      names: tag.names,
      type: tag.type,
    });
  }
}

export class VideoAddTagHistoryItem extends VideoTagHistoryItem {
  constructor({ ...rest }: { id: ObjectId; userId: string; createdAt: Date; tagId: string; videoId: string }) {
    super(rest);
  }

  get __typename() {
    return "VideoAddTagHistoryItem";
  }
}

export class VideoDeleteTagHistoryItem extends VideoTagHistoryItem {
  constructor({ ...rest }: { id: ObjectId; userId: string; createdAt: Date; tagId: string; videoId: string }) {
    super(rest);
  }

  get __typename() {
    return "VideoDeleteTagHistoryItem";
  }
}

export class VideoAddTitleHistoryItem extends VideoHistoryItem {
  public title: string;

  constructor(
    { title, ...rest }: { id: ObjectId; userId: string; createdAt: Date; title: string; videoId: string },
  ) {
    super(rest);
    this.title = title;
  }

  get __typename() {
    return "VideoAddTitleHistoryItem";
  }
}

export class VideoDeleteTitleHistoryItem extends VideoHistoryItem {
  public title: string;

  constructor(
    { title, ...rest }: { id: ObjectId; userId: string; createdAt: Date; title: string; videoId: string },
  ) {
    super(rest);
    this.title = title;
  }

  get __typename() {
    return "VideoDeleteTitleHistoryItem";
  }
}

export class VideoChangePrimaryTitleHistoryItem extends VideoHistoryItem {
  public from: string | null;
  public to: string;

  constructor(
    { from, to, ...rest }: {
      id: ObjectId;
      userId: string;
      createdAt: Date;
      videoId: string;
      from: string | null;
      to: string;
    },
  ) {
    super(rest);
    this.from = from;
    this.to = to;
  }

  get __typename() {
    return "VideoChangePrimaryTitleHistoryItem";
  }
}

export class VideoAddThumbnailHistoryItem extends VideoHistoryItem {
  public thumbnail: string;

  constructor(
    { thumbnail, ...rest }: { id: ObjectId; userId: string; createdAt: Date; thumbnail: string; videoId: string },
  ) {
    super(rest);
    this.thumbnail = thumbnail;
  }

  get __typename() {
    return "VideoAddThumbnailHistoryItem";
  }
}

export class VideoDeleteThumbnailHistoryItem extends VideoHistoryItem {
  public thumbnail: string;

  constructor(
    { thumbnail, ...rest }: { id: ObjectId; userId: string; createdAt: Date; thumbnail: string; videoId: string },
  ) {
    super(rest);
    this.thumbnail = thumbnail;
  }

  get __typename() {
    return "VideoDeleteThumbnailHistoryItem";
  }
}

export class VideoChangePrimaryThumbnailHistoryItem extends VideoHistoryItem {
  public from: string | null;
  public to: string;

  constructor(
    { from, to, ...rest }: {
      id: ObjectId;
      userId: string;
      createdAt: Date;
      videoId: string;
      from: string | null;
      to: string;
    },
  ) {
    super(rest);
    this.from = from;
    this.to = to;
  }

  get __typename() {
    return "VideoChangePrimaryThumbnailHistoryItem";
  }
}
