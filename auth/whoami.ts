import { GraphQLError } from "graphql";
import { MongoClient } from "mongo/mod.ts";
import { getUserById } from "../users/user.ts";

export const whoami = (_: unknown, { userId, mongo }: { userId: string; mongo: MongoClient }) => {
  if (!userId) throw new GraphQLError("Not login!");
  return getUserById(userId, { mongo });
};
