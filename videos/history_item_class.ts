import { GraphQLError } from "graphql";
import { MongoClient, ObjectId } from "mongo/mod.ts";
import { getTagsCollection, getUsersCollection, getVideosCollection } from "~/common/collections.ts";
import { Tag } from "~/tags/mod.ts";
import { User } from "~/users/mod.ts";
import { Video } from "./class.ts";

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
      history: video.history,
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

export class VideoAddTagHistoryItem extends VideoHistoryItem {
  private tagId: string;

  constructor({ tagId, ...rest }: { id: ObjectId; userId: string; createdAt: Date; tagId: string; videoId: string }) {
    super(rest);
    this.tagId = tagId;
  }

  get __typename() {
    return "VideoAddTagHistoryItem";
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
      history: tag.history,
    });
  }
}
