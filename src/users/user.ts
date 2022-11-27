import { GraphQLError } from "graphql";
import { MongoClient } from "mongodb";
import { getUsersCollection } from "../common/collections.js";
import { User } from "./class.js";

export const getUserById = async (id: string, context: { mongo: MongoClient }): Promise<User> => {
  const usersColl = getUsersCollection(context.mongo);
  const user = await usersColl.findOne({ _id: id });
  if (!user) throw new GraphQLError("Not Found");

  return new User({
    id: user._id,
    name: user.name,
    displayName: user.display_name,
    icon: user.icon,
  });
};

export const getUserByName = async (name: string, context: { mongo: MongoClient }): Promise<User> => {
  const usersColl = getUsersCollection(context.mongo);
  const user = await usersColl.findOne({
    name: name.toLowerCase(), // TODO: case insensitive
  });
  if (!user) throw new GraphQLError("Not Found");

  return new User({
    id: user._id,
    name: user.name,
    displayName: user.display_name,
    icon: user.icon,
  });
};

export const getUser = (args: { name: string }, context: { mongo: MongoClient }) => getUserByName(args.name, context);
