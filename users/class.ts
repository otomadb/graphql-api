import { GraphQLError } from "graphql";
import { MongoClient } from "mongodb";
import { getMylistsCollection } from "../common/collections.js";
import { Mylist } from "../mylists/class.js";

export class User {
  private _id;
  private _name;
  private _displayName;
  public icon;

  constructor({ id, name, displayName, icon }: {
    id: string;
    name: string;
    displayName: string;
    icon: string;
  }) {
    this._id = id;
    this._name = name;
    this._displayName = displayName;
    this.icon = icon;
  }

  id() {
    return this._id;
  }

  name() {
    return this._name;
  }

  displayName() {
    return this._displayName;
  }

  async favorites(_: unknown, context: { mongo: MongoClient }) {
    const mylistsColl = getMylistsCollection(context.mongo);
    const mylist = await mylistsColl.findOne({ holder_id: this._id, favorites: true });
    if (!mylist) {
      throw new GraphQLError("Not Found");
    }

    return new Mylist({
      id: mylist._id,
      title: mylist.title,
      holderId: mylist.holder_id,
      range: mylist.range,
    });
  }

  async mylists(
    { input: input }: {
      input: {
        limit?: number;
        skip?: number;
        order: Record<"createdAt" | "updatedAt", "ASC" | "DESC" | undefined>;
        range: ("PUBLIC" | "KNOW_LINK" | "PRIVATE")[];
      };
    },
    { userId, mongo }: { userId?: string; mongo: MongoClient },
  ) {
    if (
      (input.range.includes("KNOW_LINK") || input.range.includes("PRIVATE"))
      && this._id !== userId
    ) {
      throw new GraphQLError("you can't view other's private mylists");
    }

    const mylistsColl = getMylistsCollection(mongo);
    const nodes = (await mylistsColl
      .find({ holder_id: this._id, range: { $in: input.range } }, {
        sort: {
          created_at: input.order.createdAt === "ASC" ? 1 : -1,
          // updated_at: input.order.updatedAt === "ASC" ? 1 : -1,
        },
        ...(input.limit ? { limit: input.limit } : {}),
        ...(input.skip ? { skip: input.skip } : {}),
      })
      .toArray()).map(({
        _id,
        created_at,
        holder_id,
        range,
        title,
      }) =>
        new Mylist({
          id: _id,
          holderId: holder_id,
          range: range,
          title,
        })
      );

    return { nodes: nodes };
  }
}
