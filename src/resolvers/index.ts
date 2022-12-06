import { type Resolvers } from "../graphql/resolvers.js";
import { resolveMutation } from "./mutation/index.js";
import { resolveMylist } from "./mylist/index.js";
import { resolveMylistRegistration } from "./mylist_registration/index.js";
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
  Mylist: resolveMylist,
  MylistRegistration: resolveMylistRegistration,
};
