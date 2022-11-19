import { GraphQLError } from "graphql";
import { MongoClient } from "mongo/mod.ts";
import { getTagsCollection, getVideosCollection } from "./collections.ts";
import { Tag } from "./tag.ts";

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

  constructor({ id, titles, tags }: {
    id: string;
    titles: { title: string; primary?: boolean }[];
    tags: string[];
  }) {
    this._id = id;
    this._titles = titles;
    this._tags = tags;
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
    return tags.map(({ _id, names, type }) => new Tag({ id: _id, names, type }));
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
