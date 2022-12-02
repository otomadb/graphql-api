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
}
