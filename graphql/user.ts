import { MongoClient } from "mongo/mod.ts";
import { GraphQLError } from "graphql";
import { getUsersCollection2 } from "../collections.ts";

export class User {
  private _id;
  private _name;
  private _displayName;

  constructor({ id, name, displayName }: { id: string; name: string; displayName: string }) {
    this._id = id;
    this._name = name;
    this._displayName = displayName;
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
}

export const getUserById = async (id: string, context: { mongo: MongoClient }): Promise<User> => {
  const usersColl = getUsersCollection2(context.mongo);
  const user = await usersColl.findOne({ _id: id });
  if (!user) throw new GraphQLError("Not Found");

  return new User({
    id: user._id,
    name: user.name,
    displayName: user.display_name,
  });
};

export const getUserByName = async (name: string, context: { mongo: MongoClient }): Promise<User> => {
  const usersColl = getUsersCollection2(context.mongo);
  const user = await usersColl.findOne({
    name: name.toLowerCase(), // TODO: case insensitive
  });
  if (!user) throw new GraphQLError("Not Found");

  return new User({
    id: user._id,
    name: user.name,
    displayName: user.display_name,
  });
};

export const getUser = (args: { name: string }, context: { mongo: MongoClient }) => getUserByName(args.name, context);

export const whoami = (_: unknown, { userId, mongo }: { userId: string; mongo: MongoClient }) => {
  if (!userId) throw new GraphQLError("Not login!");
  return getUserById(userId, { mongo });
};
