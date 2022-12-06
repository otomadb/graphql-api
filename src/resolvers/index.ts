import { type Resolvers } from "../graphql/resolvers.js";
import { resolveMutation } from "./mutation/index.js";
import { resolveQuery } from "./query/index.js";
import { resolveTag } from "./tag/index.js";
import { resolveUser } from "./user/index.js";
import { resolveVideo } from "./video/index.js";

export const resolvers: Resolvers = {
  Query: resolveQuery,
  Mutation: resolveMutation,
  Tag: resolveTag,
  Video: resolveVideo,
  User: resolveUser,
};
