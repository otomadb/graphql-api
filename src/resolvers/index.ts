/* eslint sort-keys: 2 */

import { PrismaClient } from "@prisma/client";
import { Driver as Neo4jDriver } from "neo4j-driver";

import { type Resolvers } from "./graphql.js";
import { resolveMutation } from "./Mutation/index.js";
import { resolveMylist } from "./Mylist/index.js";
import { resolveMylistGroup } from "./MylistGroup/index.js";
import { resolveMylistGroupMylistInclusion } from "./MylistGroupMylistInclusion/index.js";
import { resolveMylistGroupVideoAggregation } from "./MylistGroupVideoAggregation/index.js";
import { resolveMylistRegistration } from "./MylistRegistration/index.js";
import { resolveMylistTagInclusion } from "./MylistTagInclusion/index.js";
import { resolveMylistVideoRecommendation } from "./MylistVideoRecommendation/index.js";
import { resolveNicovideoVideoSource } from "./NicovideoVideoSource/index.js";
import { resolveQuery } from "./Query/index.js";
import { resolveSemitag } from "./Semitag/index.js";
import { resolveTag } from "./Tag/index.js";
import { resolveUser } from "./User/index.js";
import { resolveVideo } from "./Video/index.js";
import { resolveVideoSimilarity } from "./VideoSimilarity/index.js";

export type ResolverDeps = {
  prisma: PrismaClient;
  neo4j: Neo4jDriver;
};

export const resolvers = (deps: ResolverDeps) =>
  ({
    Mutation: resolveMutation(deps),
    Mylist: resolveMylist(deps),
    MylistGroup: resolveMylistGroup(deps),
    MylistGroupMylistInclusion: resolveMylistGroupMylistInclusion(deps),
    MylistGroupVideoAggregation: resolveMylistGroupVideoAggregation(deps),
    MylistRegistration: resolveMylistRegistration(deps),
    MylistTagInclusion: resolveMylistTagInclusion(deps),
    MylistVideoRecommendation: resolveMylistVideoRecommendation(deps),
    NicovideoVideoSource: resolveNicovideoVideoSource(deps),
    Query: resolveQuery(deps),
    Semitag: resolveSemitag(deps),
    Tag: resolveTag(deps),
    User: resolveUser(deps),
    Video: resolveVideo(deps),
    VideoSimilarity: resolveVideoSimilarity(deps),
  } satisfies Resolvers);
