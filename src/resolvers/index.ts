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
import { resolveNicovideoOriginalSourceTag } from "./NicovideoOriginalSourceTag/index.js";
import { resolveNicovideoVideoSource } from "./NicovideoVideoSource/index.js";
import { resolveQuery } from "./Query/index.js";
import { resolveSemitag } from "./Semitag/index.js";
import { resolveSession } from "./Session/index.js";
import { resolveTag } from "./Tag/index.js";
import { resolveUser } from "./User/index.js";
import { resolveVideo } from "./Video/index.js";
import { resolveVideoAddNicovideoSourceEvent } from "./VideoAddNicovideoSourceEvent/index.js";
import { resolveVideoAddSemitagEvent } from "./VideoAddSemitagEvent/index.js";
import { resolveVideoAddTagEvent } from "./VideoAddTagEvent/index.js";
import { resolveVideoAddThumbnailEvent } from "./VideoAddThumbnailEvent/index.js";
import { resolveVideoAddTitleEvent } from "./VideoAddTitleEvent/index.js";
import { resolveVideoEvent } from "./VideoEvent/index.js";
import { resolveVideoRegisterEvent } from "./VideoRegisterEvent/index.js";
import { resolveVideoRemoveTagEvent } from "./VideoRemoveTagEvent/index.js";
import { resolveVideoRemoveThumbnailEvent } from "./VideoRemoveThumbnailEvent/index.js";
import { resolveVideoRemoveTitleEvent } from "./VideoRemoveTitleEvent/index.js";
import { resolveVideoSetPrimaryThumbnailEvent } from "./VideoSetPrimaryThumbnailEvent/index.js";
import { resolveVideoSetPrimaryTitleEvent } from "./VideoSetPrimaryTitleEvent/index.js";

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
    NicovideoOriginalSourceTag: resolveNicovideoOriginalSourceTag(deps),
    NicovideoVideoSource: resolveNicovideoVideoSource(deps),
    Query: resolveQuery(deps),
    Semitag: resolveSemitag(deps),
    Session: resolveSession(deps),
    Tag: resolveTag(deps),
    User: resolveUser(deps),
    Video: resolveVideo(deps),
    VideoAddNicovideoSourceEvent: resolveVideoAddNicovideoSourceEvent(deps),
    VideoAddSemitagEvent: resolveVideoAddSemitagEvent(deps),
    VideoAddTagEvent: resolveVideoAddTagEvent(deps),
    VideoAddThumbnailEvent: resolveVideoAddThumbnailEvent(deps),
    VideoAddTitleEvent: resolveVideoAddTitleEvent(deps),
    VideoEvent: resolveVideoEvent(),
    VideoRegisterEvent: resolveVideoRegisterEvent(deps),
    VideoRemoveTagEvent: resolveVideoRemoveTagEvent(deps),
    VideoRemoveThumbnailEvent: resolveVideoRemoveThumbnailEvent(deps),
    VideoRemoveTitleEvent: resolveVideoRemoveTitleEvent(deps),
    VideoSetPrimaryThumbnailEvent: resolveVideoSetPrimaryThumbnailEvent(deps),
    VideoSetPrimaryTitleEvent: resolveVideoSetPrimaryTitleEvent(deps),
  } satisfies Resolvers);
