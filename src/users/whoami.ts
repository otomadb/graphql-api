import { GraphQLError } from "graphql";
import { MongoClient } from "mongodb";
import { getUserById } from "./user.js";

export const whoami = (_: unknown, { userId, mongo }: { userId: string; mongo: MongoClient }) => {
  if (!userId) throw new GraphQLError("Invalid access token!");
  return getUserById(userId, { mongo });
};
