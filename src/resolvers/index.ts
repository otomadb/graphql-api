import { Driver as Neo4jDriver } from "neo4j-driver";
import { DataSource } from "typeorm";

import { type Resolvers } from "../graphql/resolvers.js";
import { resolveMutation } from "./Mutation/index.js";
import { resolveMylist } from "./Mylist/index.js";
import { resolveMylistRegistration } from "./MylistRegistration/index.js";
import { resolveNicovideoVideoSource } from "./NicovideoVideoSource/index.js";
import { resolveQuery } from "./Query/index.js";
import { resolveTag } from "./Tag/index.js";
import { resolveUser } from "./User/index.js";
import { resolveVideo } from "./Video/index.js";

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
