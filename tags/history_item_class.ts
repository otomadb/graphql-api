import { GraphQLError } from "graphql";
import { MongoClient, ObjectId } from "mongodb";
import { getTagsCollection, getUsersCollection } from "../common/collections.js";
import { User } from "../users/mod.js";
import { Tag } from "./class.js";

export abstract class TagHistoryItem {
  protected _id: ObjectId;
  protected userId: string;
  protected createdAt: Date;
  protected videoId: string;

  constructor({ id, userId, createdAt, tagId }: { id: ObjectId; userId: string; createdAt: Date; tagId: string }) {
    this._id = id;
    this.userId = userId;
    this.createdAt = createdAt;
    this.videoId = tagId;
  }

  get __typename() {
    return "TagRegisterHistoryItem";
  }

  id() {
    return this._id.toString();
  }

  async tag(_: unknown, { mongo }: { mongo: MongoClient }): Promise<Tag> {
    const videosColl = getTagsCollection(mongo);

    const tag = await videosColl.findOne({ _id: this.videoId });
    if (!tag) {
      throw new GraphQLError("no tag found");
    }

    return new Tag({
      id: tag._id,
      // history: tag.history,
      names: tag.names,
      type: tag.type,
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

export class TagRegisterHistoryItem extends TagHistoryItem {
  constructor({ ...rest }: {
    id: ObjectId;
    userId: string;
    createdAt: Date;
    tagId: string;
  }) {
    super(rest);
  }

  get __typename() {
    return "TagRegisterHistoryItem";
  }
}

export class TagAddNameHistoryItem extends TagHistoryItem {
  public name: string;

  constructor({ name, ...rest }: {
    id: ObjectId;
    userId: string;
    createdAt: Date;
    tagId: string;
    name: string;
  }) {
    super(rest);
    this.name = name;
  }

  get __typename() {
    return "TagAddNameHistoryItem";
  }
}

export class TagDeleteNameHistoryItem extends TagHistoryItem {
  public name: string;

  constructor({ name, ...rest }: {
    id: ObjectId;
    userId: string;
    createdAt: Date;
    tagId: string;
    name: string;
  }) {
    super(rest);
    this.name = name;
  }

  get __typename() {
    return "TagDeleteNameHistoryItem";
  }
}

export class TagChangePrimaryNameHistoryItem extends TagHistoryItem {
  public from: string | null;
  public to: string;

  constructor(
    { from, to, ...rest }: {
      id: ObjectId;
      userId: string;
      createdAt: Date;
      tagId: string;
      from: string | null;
      to: string;
    },
  ) {
    super(rest);
    this.from = from;
    this.to = to;
  }

  get __typename() {
    return "TagChangePrimaryNameHistoryItem";
  }
}
