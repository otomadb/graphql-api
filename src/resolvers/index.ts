/* eslint sort-keys: 2 */

import { PrismaClient } from "@prisma/client";
import { Driver as Neo4jDriver } from "neo4j-driver";
import { Logger } from "pino";

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
import {
  resolveNicovideoVideoSourceCreateEvent,
  resolveNicovideoVideoSourceEvent,
} from "./NicovideoVideoSourceEvent/index.js";
import { resolveQuery } from "./Query/index.js";
import { resolveSemitag } from "./Semitag/index.js";
import {
  resolveSemitagEvent,
  resolveSemitagEventAttachEvent,
  resolveSemitagEventRejectEvent,
  resolveSemitagEventResolveEvent,
} from "./SemitagEvent/index.js";
import { resolveSession } from "./Session/index.js";
import { resolveTag } from "./Tag/index.js";
import { resolveTagEvent, resolveTagRegisterEvent } from "./TagEvent/index.js";
import { resolveUser } from "./User/index.js";
import { resolveVideo } from "./Video/index.js";
import { resolveVideoEvent, resolveVideoRegisterEvent } from "./VideoEvent/index.js";
import { resolveVideoTag } from "./VideoTag/index.js";
import {
  resolveVideoTagAttachEvent,
  resolveVideoTagDetachEvent,
  resolveVideoTagEvent,
  resolveVideoTagReattachEvent,
} from "./VideoTagEvent/index.js";
import { resolveVideoThumbnail } from "./VideoThumbnail/index.js";
import {
  resolveVideoThumbnailCreateEvent,
  resolveVideoThumbnailEvent,
  resolveVideoThumbnailSetPrimaryEvent,
  resolveVideoThumbnailUnsetPrimaryEvent,
} from "./VideoThumbnailEvent/index.js";
import { resolveVideoTitle } from "./VideoTitle/index.js";
import {
  resolveVideoTitleCreateEvent,
  resolveVideoTitleEvent,
  resolveVideoTitleSetPrimaryEvent,
  resolveVideoTitleUnsetPrimaryEvent,
} from "./VideoTitleEvent/index.js";

export type ResolverDeps = {
  prisma: PrismaClient;
  neo4j: Neo4jDriver;
  logger: Logger;
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
    NicovideoVideoSourceCreateEvent: resolveNicovideoVideoSourceCreateEvent(deps),
    NicovideoVideoSourceEvent: resolveNicovideoVideoSourceEvent(),
    Query: resolveQuery(deps),
    Semitag: resolveSemitag(deps),
    SemitagEvent: resolveSemitagEvent(),
    SemitagEventAttachEvent: resolveSemitagEventAttachEvent(deps),
    SemitagEventRejectEvent: resolveSemitagEventRejectEvent(deps),
    SemitagEventResolveEvent: resolveSemitagEventResolveEvent(deps),
    Session: resolveSession(deps),
    Tag: resolveTag(deps),
    TagEvent: resolveTagEvent(),
    TagRegisterEvent: resolveTagRegisterEvent(deps),
    User: resolveUser(deps),
    Video: resolveVideo(deps),
    VideoEvent: resolveVideoEvent(),
    VideoRegisterEvent: resolveVideoRegisterEvent(deps),
    VideoTag: resolveVideoTag(deps),
    VideoTagAttachEvent: resolveVideoTagAttachEvent(deps),
    VideoTagDetachEvent: resolveVideoTagDetachEvent(deps),
    VideoTagEvent: resolveVideoTagEvent(),
    VideoTagReattachEvent: resolveVideoTagReattachEvent(deps),
    VideoThumbnail: resolveVideoThumbnail(deps),
    VideoThumbnailCreateEvent: resolveVideoThumbnailCreateEvent(deps),
    VideoThumbnailEvent: resolveVideoThumbnailEvent(),
    VideoThumbnailSetPrimaryEvent: resolveVideoThumbnailSetPrimaryEvent(deps),
    VideoThumbnailUnsetPrimaryEvent: resolveVideoThumbnailUnsetPrimaryEvent(deps),
    VideoTitle: resolveVideoTitle(deps),
    VideoTitleCreateEvent: resolveVideoTitleCreateEvent(deps),
    VideoTitleEvent: resolveVideoTitleEvent(),
    VideoTitleSetPrimaryEvent: resolveVideoTitleSetPrimaryEvent(deps),
    VideoTitleUnsetPrimaryEvent: resolveVideoTitleUnsetPrimaryEvent(deps),
  } satisfies Resolvers);
