import { Driver as Neo4jDriver } from "neo4j-driver";
import { DataSource } from "typeorm";

import { type Resolvers } from "../graphql/resolvers.js";
import { resolveMutation } from "./mutation/index.js";
import { resolveMylist } from "./mylist/index.js";
import { resolveMylistRegistration } from "./mylist_registration/index.js";
import { resolveNicovideoVideoSource } from "./NicovideoVideoSource/index.js";
import { resolveQuery } from "./query/index.js";
import { resolveTag } from "./tag/index.js";
import { resolveUser } from "./user/index.js";
import { resolveVideo } from "./video/index.js";

export const resolvers = (deps: { dataSource: DataSource; neo4jDriver: Neo4jDriver }): Resolvers => ({
  Query: resolveQuery(deps),
  Mutation: resolveMutation(deps),
  Tag: resolveTag(deps),
  Video: resolveVideo(deps),
  User: resolveUser(deps),
  Mylist: resolveMylist(deps),
  MylistRegistration: resolveMylistRegistration(deps),
  NicovideoVideoSource: resolveNicovideoVideoSource(deps),
});
