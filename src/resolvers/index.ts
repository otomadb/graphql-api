import { Driver as Neo4jDriver } from "neo4j-driver";
import { DataSource } from "typeorm";

import { type Resolvers } from "../graphql.js";
import { resolveMutation } from "./Mutation/index.js";
import { resolveMylist } from "./Mylist/index.js";
import { resolveMylistGroup } from "./MylistGroup/index.js";
import { resolveMylistGroupMylistInclusion } from "./MylistGroupMylistInclusion/index.js";
import { resolveMylistGroupVideoAggregation } from "./MylistGroupVideoAggregation/index.js";
import { resolveMylistRegistration } from "./MylistRegistration/index.js";
import { resolveNicovideoVideoSource } from "./NicovideoVideoSource/index.js";
import { resolveQuery } from "./Query/index.js";
import { resolveSemitag } from "./Semitag/index.js";
import { resolveTag } from "./Tag/index.js";
import { resolveUser } from "./User/index.js";
import { resolveVideo } from "./Video/index.js";
import { resolveVideoSimilarity } from "./VideoSimilarity/index.js";

export const resolvers = (deps: { dataSource: DataSource; neo4jDriver: Neo4jDriver }) =>
  ({
    Mutation: resolveMutation(deps),
    Mylist: resolveMylist(deps),
    MylistGroup: resolveMylistGroup(deps),
    MylistGroupMylistInclusion: resolveMylistGroupMylistInclusion(deps),
    MylistGroupVideoAggregation: resolveMylistGroupVideoAggregation(deps),
    MylistRegistration: resolveMylistRegistration(deps),
    NicovideoVideoSource: resolveNicovideoVideoSource(deps),
    Query: resolveQuery(deps),
    Semitag: resolveSemitag(deps),
    Tag: resolveTag(deps),
    User: resolveUser(deps),
    Video: resolveVideo(deps),
    VideoSimilarity: resolveVideoSimilarity(deps),
  } satisfies Resolvers);
