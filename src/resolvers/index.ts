/* eslint sort-keys: 2 */

import { type Resolvers } from "./graphql.js";
import { resolveMutation } from "./Mutation/index.js";
import { resolveMylist } from "./Mylist/index.js";
import { resolverMylistConnection } from "./MylistConnection/resolver.js";
import { resolveMylistGroup } from "./MylistGroup/index.js";
import { resolveMylistGroupMylistInclusion } from "./MylistGroupMylistInclusion/index.js";
import { resolveMylistGroupVideoAggregation } from "./MylistGroupVideoAggregation/index.js";
import { resolveMylistRegistration } from "./MylistRegistration/index.js";
import { resolverMylistRegistrationConnection } from "./MylistRegistrationConnection/resolver.js";
import { resolveMylistTagInclusion } from "./MylistTagInclusion/index.js";
import { resolveMylistVideoRecommendation } from "./MylistVideoRecommendation/index.js";
import { resolveNicovideoOriginalSourceTag } from "./NicovideoOriginalSourceTag/index.js";
import { resolverNicovideoRegistrationRequest } from "./NicovideoRegistrationRequest/resolver.js";
import { resolverNicovideoRegistrationRequestAccepting } from "./NicovideoRegistrationRequestAccepting/resolver.js";
import { resolverNicovideoRegistrationRequestAcceptingNotification } from "./NicovideoRegistrationRequestAcceptingNotification/resolver.js";
import { resolverNicovideoRegistrationRequestConnection } from "./NicovideoRegistrationRequestConnection/resolver.js";
import { resolverNicovideoRegistrationRequestRejecting } from "./NicovideoRegistrationRequestRejecting/resolver.js";
import { resolverNicovideoRegistrationRequestRejectingNotification } from "./NicovideoRegistrationRequestRejectingNotification/resolver.js";
import { resolveNicovideoVideoSource } from "./NicovideoVideoSource/index.js";
import {
  resolveNicovideoVideoSourceCreateEvent,
  resolveNicovideoVideoSourceEvent,
} from "./NicovideoVideoSourceEvent/index.js";
import { resolverNotification } from "./Notification/resolver.js";
import { resolverNotificationConnection } from "./NotificationConnection/resolver.js";
import { resolveQuery } from "./Query/index.js";
import { resolveSemitag } from "./Semitag/index.js";
import { resolverSemitagConnection } from "./SemitagConnection/resolver.js";
import {
  resolveSemitagEvent,
  resolveSemitagEventAttachEvent,
  resolveSemitagEventRejectEvent,
  resolveSemitagEventResolveEvent,
} from "./SemitagEvent/index.js";
import { resolverSemitagRejecting } from "./SemitagRejecting/resolver.js";
import { resolverSemitagResolving } from "./SemitagResolving/resolver.js";
import { resolverSemitagSuggestTagsItem } from "./SemitagSuggestTagsItem/resolver.js";
import { resolveTag } from "./Tag/index.js";
import { resolveTagEvent, resolveTagRegisterEvent } from "./TagEvent/index.js";
import { resolveTagName } from "./TagName/index.js";
import {
  resolveTagNameCreateEvent,
  resolveTagNameEvent,
  resolveTagNameSetPrimaryEvent,
  resolveTagNameUnsetPrimaryEvent,
} from "./TagNameEvent/index.js";
import { resolveTagParent } from "./TagParent/index.js";
import { resolverTagParentConnection } from "./TagParentConnection/resolver.js";
import { resolverTagSearchItemByName } from "./TagSearchItemByName/resolver.js";
import { resolverTypeCategoryTag } from "./TypeCategoryTag/resolver.js";
import { ResolverDeps } from "./types.js";
import { resolveUser } from "./User/index.js";
import { resolveVideo } from "./Video/index.js";
import { resolverVideoConnection } from "./VideoConnection/resolver.js";
import { resolveVideoEvent, resolveVideoRegisterEvent } from "./VideoEvent/index.js";
import { resolverVideoSearchItemByTitle } from "./VideoSearchItemByTitle/resolver.js";
import { resolveVideoSimilarity } from "./VideoSimilarity/index.js";
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
import { resolverYoutubeRegistrationRequest } from "./YoutubeRegistrationRequest/resolver.js";
import { resolverYoutubeRegistrationRequestAccepting } from "./YoutubeRegistrationRequestAccepting/resolver.js";
import { resolverYoutubeRegistrationRequestAcceptingNotification } from "./YoutubeRegistrationRequestAcceptingNotification/resolver.js";
import { resolverYoutubeRegistrationRequestConnection } from "./YoutubeRegistrationRequestConnection/resolver.js";
import { resolverYoutubeRegistrationRequestRejecting } from "./YoutubeRegistrationRequestRejecting/resolver.js";
import { resolverYoutubeRegistrationRequestRejectingNotification } from "./YoutubeRegistrationRequestRejectingNotification/resolver.js";
import { resolveYoutubeVideoSource } from "./YoutubeVideoSource/resolver.js";
import {
  resolveYoutubeVideoSourceCreateEvent,
  resolveYoutubeVideoSourceEvent,
} from "./YoutubeVideoSourceEvent/resolver.js";
import { resolverYoutubeVideoSourceEventConnection } from "./YoutubeVideoSourceEventConnection/resolver.js";

export const makeResolvers = (deps: ResolverDeps) =>
  ({
    Mutation: resolveMutation(deps),
    Mylist: resolveMylist(deps),
    MylistConnection: resolverMylistConnection(),
    MylistGroup: resolveMylistGroup(deps),
    MylistGroupMylistInclusion: resolveMylistGroupMylistInclusion(deps),
    MylistGroupVideoAggregation: resolveMylistGroupVideoAggregation(deps),
    MylistRegistration: resolveMylistRegistration(deps),
    MylistRegistrationConnection: resolverMylistRegistrationConnection(),
    MylistTagInclusion: resolveMylistTagInclusion(deps),
    MylistVideoRecommendation: resolveMylistVideoRecommendation(deps),
    NicovideoOriginalSourceTag: resolveNicovideoOriginalSourceTag(deps),
    NicovideoRegistrationRequest: resolverNicovideoRegistrationRequest(deps),
    NicovideoRegistrationRequestAccepting: resolverNicovideoRegistrationRequestAccepting(deps),
    NicovideoRegistrationRequestAcceptingNotification: resolverNicovideoRegistrationRequestAcceptingNotification(deps),
    NicovideoRegistrationRequestConnection: resolverNicovideoRegistrationRequestConnection(),
    NicovideoRegistrationRequestRejecting: resolverNicovideoRegistrationRequestRejecting(deps),
    NicovideoRegistrationRequestRejectingNotification: resolverNicovideoRegistrationRequestRejectingNotification(deps),
    NicovideoVideoSource: resolveNicovideoVideoSource(deps),
    NicovideoVideoSourceCreateEvent: resolveNicovideoVideoSourceCreateEvent(deps),
    NicovideoVideoSourceEvent: resolveNicovideoVideoSourceEvent(),
    Notification: resolverNotification(deps),
    NotificationConnection: resolverNotificationConnection(),
    Query: resolveQuery(deps),
    Semitag: resolveSemitag(deps),
    SemitagAttachEvent: resolveSemitagEventAttachEvent(deps),
    SemitagConnection: resolverSemitagConnection(),
    SemitagEvent: resolveSemitagEvent(),
    SemitagRejectEvent: resolveSemitagEventRejectEvent(deps),
    SemitagRejecting: resolverSemitagRejecting(deps),
    SemitagResolveEvent: resolveSemitagEventResolveEvent(deps),
    SemitagResolving: resolverSemitagResolving(deps),
    SemitagSuggestTagsItem: resolverSemitagSuggestTagsItem(deps),
    Tag: resolveTag(deps),
    TagEvent: resolveTagEvent(),
    TagName: resolveTagName(deps),
    TagNameCreateEvent: resolveTagNameCreateEvent(deps),
    TagNameEvent: resolveTagNameEvent(),
    TagNameSetPrimaryEvent: resolveTagNameSetPrimaryEvent(deps),
    TagNameUnsetPrimaryEvent: resolveTagNameUnsetPrimaryEvent(deps),
    TagParent: resolveTagParent(deps),
    TagParentConnection: resolverTagParentConnection(),
    TagRegisterEvent: resolveTagRegisterEvent(deps),
    TagSearchItemByName: resolverTagSearchItemByName(deps),
    TypeCategoryTag: resolverTypeCategoryTag(deps),
    User: resolveUser(deps),
    Video: resolveVideo(deps),
    VideoConnection: resolverVideoConnection(),
    VideoEvent: resolveVideoEvent(),
    VideoRegisterEvent: resolveVideoRegisterEvent(deps),
    VideoSearchItemByTitle: resolverVideoSearchItemByTitle(deps),
    VideoSimilarity: resolveVideoSimilarity(deps),
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
    YoutubeRegistrationRequest: resolverYoutubeRegistrationRequest(deps),
    YoutubeRegistrationRequestAccepting: resolverYoutubeRegistrationRequestAccepting(deps),
    YoutubeRegistrationRequestAcceptingNotification: resolverYoutubeRegistrationRequestAcceptingNotification(deps),
    YoutubeRegistrationRequestConnection: resolverYoutubeRegistrationRequestConnection(),
    YoutubeRegistrationRequestRejecting: resolverYoutubeRegistrationRequestRejecting(deps),
    YoutubeRegistrationRequestRejectingNotification: resolverYoutubeRegistrationRequestRejectingNotification(deps),
    YoutubeVideoSource: resolveYoutubeVideoSource(deps),
    YoutubeVideoSourceCreateEvent: resolveYoutubeVideoSourceCreateEvent(deps),
    YoutubeVideoSourceEvent: resolveYoutubeVideoSourceEvent(),
    YoutubeVideoSourceEventConnection: resolverYoutubeVideoSourceEventConnection(),
  } satisfies Resolvers);
