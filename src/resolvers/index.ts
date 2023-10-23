/* eslint sort-keys: 2 */

import { resolverBilibiliMADSource } from "../BilibiliMADSource/BilibiliMADSource.resolver.js";
import { resolverBilibiliMADSourceCreateEvent } from "../BilibiliMADSource/BilibiliMADSourceEvent.resolver.js";
import { resolverBilibiliMADSourceEventConnection } from "../BilibiliMADSource/BilibiliMADSourceEventConnection.resolver.js";
import { mkBilibiliOriginalSourceResolver } from "../FetchExternal/BilibiliOriginalSource.resolver.js";
import { resolverBilibiliOriginalSourceTag } from "../FetchExternal/BilibiliOriginalSourceTag.resolver.js";
import { resolveNicovideoOriginalSourceTag } from "../FetchExternal/NicovideoOriginalSourceTag.resolver.js";
import { mkSoundcloudOriginalSourceResolver } from "../FetchExternal/SoundcloudOriginalSource.resolver.js";
import { resolverNicovideoRegistrationRequestAccepting } from "../NicovideoRegistrationRequest/NicovideoRegistrationRequestAccepting.resolver.js";
import { resolverNicovideoRegistrationRequestAcceptingNotification } from "../NicovideoRegistrationRequest/NicovideoRegistrationRequestAcceptingNotification.resolver.js";
import { resolverNicovideoRegistrationRequestConnection } from "../NicovideoRegistrationRequest/NicovideoRegistrationRequestConnection.resolver.js";
import { resolverNicovideoRegistrationRequestRejecting } from "../NicovideoRegistrationRequest/NicovideoRegistrationRequestRejecting.resolver.js";
import { resolverNicovideoRegistrationRequestRejectingNotification } from "../NicovideoRegistrationRequest/NicovideoRegistrationRequestRejectingNotification.resolver.js";
import { resolverNicovideoRegistrationRequest } from "../NicovideoRegistrationRequest/resolver.js";
import { resolverNicovideoVideoSource } from "../NicovideoVideoSource/NicovideoVideoSource.resolver.js";
import {
  resolveNicovideoVideoSourceCreateEvent,
  resolveNicovideoVideoSourceEvent,
} from "../NicovideoVideoSource/NicovideoVideoSourceEvent.resolver.js";
import { mkSoundcloudMADSourceResolver } from "../SoundcloudMADSource/SoundcloudMADSource.resolver.js";
import { resolveSoundcloudMADSourceCreateEvent } from "../SoundcloudMADSource/SoundcloudMADSourceEvent.resolver.js";
import { resolverSoundcloudMADSourceEventConnection } from "../SoundcloudMADSource/SoundcloudMADSourceEventConnection.resolver.js";
import { resolveTag } from "../Tag/Tag.resolver.js";
import { resolveTagEvent, resolveTagRegisterEvent } from "../Tag/TagEvent.resolver.js";
import { resolveTagName } from "../Tag/TagName.resolver.js";
import {
  resolveTagNameCreateEvent,
  resolveTagNameEvent,
  resolveTagNameSetPrimaryEvent,
  resolveTagNameUnsetPrimaryEvent,
} from "../Tag/TagNameEvent.resolver.js";
import { resolveTagParent } from "../Tag/TagParent.resolver.js";
import { resolverTagParentConnection } from "../Tag/TagParentConnection.resolver.js";
import { resolverTagSearchItemByName } from "../Tag/TagSearchItemByName.resolver.js";
import { resolverTypeCategoryTag } from "../Tag/TypeCategoryTag.resolver.js";
import {
  mkMadRegisteredTimelineEventResolver,
  mkNicovideoMadRequestedTimelineEventResolver,
  mkYoutubeMadRequestedTimelineEventResolver,
} from "../Timeline/TimelineEvent.resolver.js";
import { resolveUser } from "../User/User.resolver.js";
import { resolveVideo } from "../Video/Video.resolver.js";
import { resolverVideoConnection } from "../Video/VideoConnection.resolver.js";
import { resolveVideoEvent, resolveVideoRegisterEvent } from "../Video/VideoEvent.resolver.js";
import { resolverVideoSearchItemByTitle } from "../Video/VideoSearchItemByTitle.resolver.js";
import { resolveVideoSimilarity } from "../Video/VideoSimilarity.resolver.js";
import { resolveVideoTag } from "../Video/VideoTag.resolver.js";
import {
  resolveVideoTagAttachEvent,
  resolveVideoTagDetachEvent,
  resolveVideoTagEvent,
  resolveVideoTagReattachEvent,
} from "../Video/VideoTagEvent.resolver.js";
import { resolveVideoThumbnail } from "../Video/VideoThumbnail.resolver.js";
import {
  resolveVideoThumbnailCreateEvent,
  resolveVideoThumbnailEvent,
  resolveVideoThumbnailSetPrimaryEvent,
  resolveVideoThumbnailUnsetPrimaryEvent,
} from "../Video/VideoThumbnailEvent.resolver.js";
import { resolveVideoTitle } from "../Video/VideoTitle.resolver.js";
import {
  resolveVideoTitleCreateEvent,
  resolveVideoTitleEvent,
  resolveVideoTitleSetPrimaryEvent,
  resolveVideoTitleUnsetPrimaryEvent,
} from "../Video/VideoTitleEvent.resolver.js";
import { resolverYoutubeRegistrationRequest } from "../YoutubeRegistrationRequest/YoutubeRegistrationRequest.resolver.js";
import { resolverYoutubeRegistrationRequestAccepting } from "../YoutubeRegistrationRequest/YoutubeRegistrationRequestAccepting.resolver.js";
import { resolverYoutubeRegistrationRequestAcceptingNotification } from "../YoutubeRegistrationRequest/YoutubeRegistrationRequestAcceptingNotification.resolver.js";
import { resolverYoutubeRegistrationRequestConnection } from "../YoutubeRegistrationRequest/YoutubeRegistrationRequestConnection.resolver.js";
import { resolverYoutubeRegistrationRequestRejecting } from "../YoutubeRegistrationRequest/YoutubeRegistrationRequestRejecting.resolver.js";
import { resolverYoutubeRegistrationRequestRejectingNotification } from "../YoutubeRegistrationRequest/YoutubeRegistrationRequestRejectingNotification.resolver.js";
import { resolveYoutubeVideoSource } from "../YoutubeVideoSource/YoutubeVideoSource.resolver.js";
import {
  resolveYoutubeVideoSourceCreateEvent,
  resolveYoutubeVideoSourceEvent,
} from "../YoutubeVideoSource/YoutubeVideoSourceEvent.resolver.js";
import { resolverYoutubeVideoSourceEventConnection } from "../YoutubeVideoSource/YoutubeVideoSourceEventConnection.resolver.js";
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
import { ResolverDeps } from "./types.js";

export const makeResolvers = (deps: ResolverDeps) =>
  ({
    BilibiliMADSource: resolverBilibiliMADSource(deps),
    BilibiliMADSourceCreateEvent: resolverBilibiliMADSourceCreateEvent(deps),
    BilibiliMADSourceEventConnection: resolverBilibiliMADSourceEventConnection(deps),
    BilibiliOriginalSource: mkBilibiliOriginalSourceResolver(deps),
    BilibiliOriginalSourceTag: resolverBilibiliOriginalSourceTag(deps),
    MadRegisteredTimelineEvent: mkMadRegisteredTimelineEventResolver(deps),
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
    NicovideoMadRequestedTimelineEvent: mkNicovideoMadRequestedTimelineEventResolver(deps),
    NicovideoOriginalSourceTag: resolveNicovideoOriginalSourceTag(deps),
    NicovideoRegistrationRequest: resolverNicovideoRegistrationRequest(deps),
    NicovideoRegistrationRequestAccepting: resolverNicovideoRegistrationRequestAccepting(deps),
    NicovideoRegistrationRequestAcceptingNotification: resolverNicovideoRegistrationRequestAcceptingNotification(deps),
    NicovideoRegistrationRequestConnection: resolverNicovideoRegistrationRequestConnection(),
    NicovideoRegistrationRequestRejecting: resolverNicovideoRegistrationRequestRejecting(deps),
    NicovideoRegistrationRequestRejectingNotification: resolverNicovideoRegistrationRequestRejectingNotification(deps),
    NicovideoVideoSource: resolverNicovideoVideoSource(deps),
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
    SoundcloudMADSource: mkSoundcloudMADSourceResolver(deps),
    SoundcloudMADSourceCreateEvent: resolveSoundcloudMADSourceCreateEvent(deps),
    SoundcloudMADSourceEventConnection: resolverSoundcloudMADSourceEventConnection(deps),
    SoundcloudOriginalSource: mkSoundcloudOriginalSourceResolver(deps),
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
    YoutubeMadRequestedTimelineEvent: mkYoutubeMadRequestedTimelineEventResolver(deps),
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
  }) satisfies Resolvers;
