import { GraphQLError } from "graphql";
import { MongoClient, ObjectId } from "mongo/mod.ts";
import { getTagHistoryCollection, getUsersCollection, getVideosCollection } from "~/common/collections.ts";
import { User } from "~/users/mod.ts";
import { Video } from "~/videos/mod.ts";

export class Tag {
  protected id;
  protected type;
  private _names;
  private _history;

  constructor({ id, names, type, history }: {
    id: string;
    names: { name: string; primary?: boolean }[];
    type: string;
    history: ObjectId[];
  }) {
    this.id = id;
    this._names = names;
    this.type = type;
    this._history = history;
  }

  names() {
    return this._names.map((v) => new TagName(v));
  }

  name() {
    const name = this.names().find((v) => v.primary());
    if (!name) {
      throw new GraphQLError("no primary title");
    }
    return name.name();
  }

  async history(_: unknown, context: { mongo: MongoClient }) {
    const taghistColls = getTagHistoryCollection(context.mongo);
    const items = await taghistColls.find({ _id: { $in: this._history } }).toArray();
    return items.map(
      ({ _id, type, user_id, created_at }) => {
        switch (type) {
          case "REGISTER":
            return new TagRegisterHistoryItem({
              id: _id,
              userId: user_id,
              createdAt: created_at,
            });
          default:
            throw new GraphQLError("something wrong");
        }
      },
    );
  }

  async taggedVideos(_: unknown, context: { mongo: MongoClient }) {
    const videosColl = getVideosCollection(context.mongo);
    return (await videosColl
      .find({ tags: this.id as unknown as string[] })
      .toArray())
      .map((v) =>
        new Video({
          id: v._id,
          history: v.history,
          tags: v.tags,
          thumbnails: v.thumbnails,
          titles: v.titles,
        })
      );
  }
}

export class TagRegisterHistoryItem {
  private _id: ObjectId;
  private _userId: string;
  protected createdAt: Date;

  constructor({ id, userId, createdAt }: { id: ObjectId; userId: string; createdAt: Date }) {
    this._id = id;
    this._userId = userId;
    this.createdAt = createdAt;
  }

  get __typename() {
    return "TagRegisterHistoryItem";
  }

  id() {
    return this._id.toString();
  }

  async user(_: unknown, { mongo }: { mongo: MongoClient }): Promise<User> {
    const usersColl = getUsersCollection(mongo);

    const user = await usersColl.findOne({ _id: this._userId });
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

export class TagName {
  private _name;
  private _primary;

  constructor({ name, primary }: { name: string; primary?: boolean }) {
    this._name = name;
    this._primary = primary;
  }

  name() {
    return this._name;
  }

  primary() {
    return !!this._primary;
  }
}

export class SearchTagsResultItem {
  matchedName;
  tag;

  constructor({ matchedName }: { matchedName: string }, tagPayload: ConstructorParameters<typeof Tag>[0]) {
    this.matchedName = matchedName;
    this.tag = new Tag(tagPayload);
  }
}
