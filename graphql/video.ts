import { GraphQLError } from "graphql";
import { MongoClient } from "mongo/mod.ts";
import { getTagsCollection2 } from "../collections.ts";
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
    const tagsColl = getTagsCollection2(context.mongo);
    const tags = await tagsColl.find({ _id: { $in: this._tags } }).toArray();
    return tags.map(({ _id, names, type }) => new Tag({ id: _id, names, type }));
  }
}
