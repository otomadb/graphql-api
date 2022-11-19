import { GraphQLError } from "graphql";
import { MongoClient, ObjectId } from "mongo/mod.ts";
import {
  getTagsCollection,
  getUsersCollection,
  getVideoHistoryCollection,
  getVideosCollection,
} from "./collections.ts";
import { generateId } from "./id.ts";
import { Tag } from "./tag.ts";
import { User } from "./user.ts";

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

export class Video {
  private _id;
  private _titles;
  private _tags;
  private _history: ObjectId[];

  constructor({ id, titles, tags, history }: {
    id: string;
    titles: { title: string; primary?: boolean }[];
    tags: string[];
    history: ObjectId[];
  }) {
    this._id = id;
    this._titles = titles;
    this._tags = tags;
    this._history = history;
  }

  id() {
    return this._id;
  }

  titles() {
    return this._titles.map((v) => new VideoTitle(v));
  }

  title(_: unknown) {
    const title = this.titles().find((v) => v.primary());
    if (!title) throw new GraphQLError("no primary title");
    return title.title();
  }

  async tags(_: unknown, context: { mongo: MongoClient }) {
    const tagsColl = getTagsCollection(context.mongo);
    const tags = await tagsColl.find({ _id: { $in: this._tags } }).toArray();
    return tags.map(({ _id, names, type, history }) => new Tag({ id: _id, names, type, history }));
  }

  async history(_: unknown, context: { mongo: MongoClient }) {
    const taghistColls = getVideoHistoryCollection(context.mongo);
    const items = await taghistColls.find({ _id: { $in: this._history } }).toArray();
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
    if (!video) throw new GraphQLError("no video found");

    return new Video({
      id: video._id,
      titles: video.titles,
      tags: video.tags,
      history: video.history,
    });
  }

  async user(_: unknown, { mongo }: { mongo: MongoClient }): Promise<User> {
    const usersColl = getUsersCollection(mongo);

    const user = await usersColl.findOne({ _id: this.userId });
    if (!user) throw new GraphQLError("no user found");

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
    if (!tag) throw new GraphQLError("not found");
    return new Tag({
      id: tag._id,
      names: tag.names,
      type: tag.type,
      history: tag.history,
    });
  }
}

export const getVideo = async (
  args: { id: string },
  context: { mongo: MongoClient },
) => {
  const videosColl = getVideosCollection(context.mongo);
  const video = await videosColl.findOne({ _id: args.id });
  if (!video) throw new GraphQLError("Not Found");

  return new Video({
    id: video._id,
    titles: video.titles,
    tags: video.tags,
    history: video.history,
  });
};

export class SearchVideosResultItem {
  matchedTitle;
  video;

  constructor({ matchedTitle }: { matchedTitle: string }, videoPayload: ConstructorParameters<typeof Video>[0]) {
    this.matchedTitle = matchedTitle;
    this.video = new Video(videoPayload);
  }
}

export const searchVideos = async (
  args: { query: string; limit: number; skip: number },
  context: { mongo: MongoClient },
) => {
  const videosColl = getVideosCollection(context.mongo);
  const matched = await videosColl
    .aggregate<{
      id: string;
      titles: { title: string; primary?: boolean }[];
      tags: string[];
      matched_title: string;
    }>([
      {
        $project: {
          _id: true,
          titles: true,
          titles_search: "$titles",
          tags: true,
        },
      },
      { $unwind: { path: "$titles_search" } },
      { $match: { "titles_search.title": { "$regex": args.query } } },
      {
        $sort: {
          "titles_search.primary": -1,
        },
      },
      {
        $group: {
          _id: "$_id",
          titles: { $first: "$titles" },
          tags: { $first: "$tags" },
          matched_title: { $first: "$titles_search.title" },
        },
      },
      {
        $project: {
          _id: 0,
          id: "$_id",
          titles: "$titles",
          tags: "$tags",
          matched_title: "$matched_title",
        },
      },
      { $skip: args.skip },
      { $limit: args.limit },
    ])
    .toArray()
    .then((arr) =>
      arr.map(({ matched_title, ...rest }) => new SearchVideosResultItem({ matchedTitle: matched_title }, rest))
    );

  return {
    result: matched,
  };
};

export const addVideo = async (
  { input }: {
    input: {
      primaryTitle: string;
      extraTitles: string[];
      tags: string[];
    };
  },
  context: { mongo: MongoClient; userId?: string },
) => {
  if (!context.userId) throw new GraphQLError("Not login");
  const { userId } = context;

  const videosColl = getVideosCollection(context.mongo);
  const videoHisColl = getVideoHistoryCollection(context.mongo);

  const videoId = generateId();

  const historyIdRegisterVideo = await videoHisColl.insertOne({
    type: "REGISTER",
    user_id: userId,
    video_id: videoId,
    created_at: new Date(),
  }) as ObjectId;
  const historyIdsAddTag = await videoHisColl.insertMany(
    input.tags.map((tag) => ({
      type: "ADD_TAG",
      user_id: userId,
      video_id: videoId,
      created_at: new Date(),
      tag_id: tag,
    })),
  );

  const videoAdd = await videosColl.insertOne({
    _id: videoId,
    titles: [
      { title: input.primaryTitle, primary: true },
      ...(input.extraTitles?.map((extraTitle) => ({ title: extraTitle })) || []),
    ],
    tags: input.tags,
    history: [historyIdRegisterVideo, ...historyIdsAddTag.insertedIds],
  }).then((id) => videosColl.findOne({ _id: id }));

  if (!videoAdd) throw new GraphQLError("somwthing wrong");

  return {
    video: new Video({
      id: videoAdd._id,
      titles: videoAdd.titles,
      tags: videoAdd.tags,
      history: videoAdd.history,
    }),
  };
};
