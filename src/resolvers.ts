/* eslint sort-keys: 2 */

import { DateTimeResolver } from "graphql-scalars";

import { mkAbstractGroupResolver } from "./AbstractGroup/AbstractGroup.resolver.js";
import { mkAbstractGroupingResolver } from "./AbstractGroup/AbstractGrouping.resolver.js";
import { resolverBilibiliMADSource } from "./BilibiliMADSource/BilibiliMADSource.resolver.js";
import { resolverBilibiliMADSourceCreateEvent } from "./BilibiliMADSource/BilibiliMADSourceEvent.resolver.js";
import { resolverBilibiliMADSourceEventConnection } from "./BilibiliMADSource/BilibiliMADSourceEventConnection.resolver.js";
import { resolverBilibiliRegistrationRequest } from "./BilibiliRegistrationRequest/BilibiliRegistrationRequest.resolver.js";
import { resolverBilibiliRegistrationRequestAccepting } from "./BilibiliRegistrationRequest/BilibiliRegistrationRequestAccepting.resolver.js";
import { resolverBilibiliRegistrationRequestConnection } from "./BilibiliRegistrationRequest/BilibiliRegistrationRequestConnection.resolver.js";
import {
  mkBilibiliRegistrationRequestAcceptEventResolver,
  mkBilibiliRegistrationRequestEventResolver,
  mkBilibiliRegistrationRequestRejectEventResolver,
  mkBilibiliRegistrationRequestRequestEventResolver,
} from "./BilibiliRegistrationRequest/BilibiliRegistrationRequestEvent.resolver.js";
import { mkBilibiliRegistrationRequestEventConnectionResolver } from "./BilibiliRegistrationRequest/BilibiliRegistrationRequestEventConnection.resolver.js";
import { mkBilibiliRegistrationRequestRejectingResolver } from "./BilibiliRegistrationRequest/BilibiliRegistrationRequestRejecting.resolver.js";
import { mkBilibiliOriginalSourceResolver } from "./FetchExternal/BilibiliOriginalSource.resolver.js";
import { resolverBilibiliOriginalSourceTag } from "./FetchExternal/BilibiliOriginalSourceTag.resolver.js";
import { mkNicovideoOriginalSourceResolver } from "./FetchExternal/NicovideoOriginalSource.resolver.js";
import { resolveNicovideoOriginalSourceTag } from "./FetchExternal/NicovideoOriginalSourceTag.resolver.js";
import { mkSoundcloudOriginalSourceResolver } from "./FetchExternal/SoundcloudOriginalSource.resolver.js";
import { mkYoutubeOriginalSourceResolver } from "./FetchExternal/YoutubeOriginalSource.resolver.js";
import { resolveMutation } from "./mutation.js";
import { resolverNicovideoRegistrationRequest } from "./NicovideoRegistrationRequest/NicovideoRegistrationRequest.resolver.js";
import { resolverNicovideoRegistrationRequestAccepting } from "./NicovideoRegistrationRequest/NicovideoRegistrationRequestAccepting.resolver.js";
import { resolverNicovideoRegistrationRequestConnection } from "./NicovideoRegistrationRequest/NicovideoRegistrationRequestConnection.resolver.js";
import {
  mkNicovideoRegistrationRequestAcceptEventResolver,
  mkNicovideoRegistrationRequestEventResolver,
  mkNicovideoRegistrationRequestRejectEventResolver,
  mkNicovideoRegistrationRequestRequestEventResolver,
} from "./NicovideoRegistrationRequest/NicovideoRegistrationRequestEvent.resolver.js";
import { mkNicovideoRegistrationRequestEventConnectionResolver } from "./NicovideoRegistrationRequest/NicovideoRegistrationRequestEventConnection.resolver.js";
import { resolverNicovideoRegistrationRequestRejecting } from "./NicovideoRegistrationRequest/NicovideoRegistrationRequestRejecting.resolver.js";
import { mkNicovideoVideoSourceResolver } from "./NicovideoVideoSource/NicovideoVideoSource.resolver.js";
import {
  resolveNicovideoVideoSourceCreateEvent,
  resolveNicovideoVideoSourceEvent,
} from "./NicovideoVideoSource/NicovideoVideoSourceEvent.resolver.js";
import {
  mkBilibiliRegistrationRequestAcceptingNotificationResolver,
  mkBilibiliRegistrationRequestRejectingNotificationResolver,
  mkNicovideoRegistrationRequestAcceptingNotificationResolver,
  mkNicovideoRegistrationRequestRejectingNotificationResolver,
  mkSoundcloudRegistrationRequestAcceptingNotificationResolver,
  mkSoundcloudRegistrationRequestRejectingNotificationResolver,
  mkYoutubeRegistrationRequestAcceptingNotificationResolver,
  mkYoutubeRegistrationRequestRejectingNotificationResolver,
} from "./Notification/Notification.resolver.js";
import { resolverNotificationConnection } from "./Notification/NotificationConnection.resolver.js";
import { resolveQuery } from "./query.js";
import { type Resolvers } from "./resolvers/graphql.js";
import { resolveMylist } from "./resolvers/Mylist/index.js";
import { resolverMylistConnection } from "./resolvers/MylistConnection/resolver.js";
import { resolveMylistGroup } from "./resolvers/MylistGroup/index.js";
import { resolveMylistGroupMylistInclusion } from "./resolvers/MylistGroupMylistInclusion/index.js";
import { resolveMylistGroupVideoAggregation } from "./resolvers/MylistGroupVideoAggregation/index.js";
import { resolveMylistRegistration } from "./resolvers/MylistRegistration/index.js";
import { resolverMylistRegistrationConnection } from "./resolvers/MylistRegistrationConnection/resolver.js";
import { resolveMylistTagInclusion } from "./resolvers/MylistTagInclusion/index.js";
import { resolveMylistVideoRecommendation } from "./resolvers/MylistVideoRecommendation/index.js";
import { resolveSemitag } from "./resolvers/Semitag/index.js";
import { resolverSemitagConnection } from "./resolvers/SemitagConnection/resolver.js";
import {
  resolveSemitagEvent,
  resolveSemitagEventAttachEvent,
  resolveSemitagEventRejectEvent,
  resolveSemitagEventResolveEvent,
} from "./resolvers/SemitagEvent/index.js";
import { resolverSemitagRejecting } from "./resolvers/SemitagRejecting/resolver.js";
import { resolverSemitagResolving } from "./resolvers/SemitagResolving/resolver.js";
import { resolverSemitagSuggestTagsItem } from "./resolvers/SemitagSuggestTagsItem/resolver.js";
import { ResolverDeps } from "./resolvers/types.js";
import { mkSoundcloudMADSourceResolver } from "./SoundcloudMADSource/SoundcloudMADSource.resolver.js";
import { resolveSoundcloudMADSourceCreateEvent } from "./SoundcloudMADSource/SoundcloudMADSourceEvent.resolver.js";
import { resolverSoundcloudMADSourceEventConnection } from "./SoundcloudMADSource/SoundcloudMADSourceEventConnection.resolver.js";
import { resolverSoundcloudRegistrationRequest } from "./SoundcloudRegistrationRequest/SoundcloudRegistrationRequest.resolver.js";
import { resolverSoundcloudRegistrationRequestAccepting } from "./SoundcloudRegistrationRequest/SoundcloudRegistrationRequestAccepting.resolver.js";
import { resolverSoundcloudRegistrationRequestConnection } from "./SoundcloudRegistrationRequest/SoundcloudRegistrationRequestConnection.resolver.js";
import {
  mkSoundcloudRegistrationRequestAcceptEventResolver,
  mkSoundcloudRegistrationRequestEventResolver,
  mkSoundcloudRegistrationRequestRejectEventResolver,
  mkSoundcloudRegistrationRequestRequestEventResolver,
} from "./SoundcloudRegistrationRequest/SoundcloudRegistrationRequestEvent.resolver.js";
import { mkSoundcloudRegistrationRequestEventConnectionResolver } from "./SoundcloudRegistrationRequest/SoundcloudRegistrationRequestEventConnection.resolver.js";
import { mkSoundcloudRegistrationRequestRejectingResolver } from "./SoundcloudRegistrationRequest/SoundcloudRegistrationRequestRejecting.resolver.js";
import { resolveTag } from "./Tag/Tag.resolver.js";
import { mkTagConnectionResolver } from "./Tag/TagConnection.resolver.js";
import { resolveTagEvent, resolveTagRegisterEvent } from "./Tag/TagEvent.resolver.js";
import { resolveTagName } from "./Tag/TagName.resolver.js";
import {
  resolveTagNameCreateEvent,
  resolveTagNameEvent,
  resolveTagNameSetPrimaryEvent,
  resolveTagNameUnsetPrimaryEvent,
} from "./Tag/TagNameEvent.resolver.js";
import { resolveTagParent } from "./Tag/TagParent.resolver.js";
import { resolverTagParentConnection } from "./Tag/TagParentConnection.resolver.js";
import { resolverTagSearchItemByName } from "./Tag/TagSearchItemByName.resolver.js";
import {
  mkBilibiliMadRequestedTimelineEventResolver,
  mkMadRegisteredTimelineEventResolver,
  mkNicovideoMadRequestedTimelineEventResolver,
  mkSoundcloudMadRequestedTimelineEventResolver,
  mkYoutubeMadRequestAcceptedTimelineEventResolver,
  mkYoutubeMadRequestedTimelineEventResolver,
  mkYoutubeMadRequestRejectedTimelineEventResolver,
  mkYoutubeMadRequestResolvedTimelineEventResolver,
} from "./Timeline/TimelineEvent.resolver.js";
import { resolveUser } from "./User/User.resolver.js";
import { resolveVideo } from "./Video/Video.resolver.js";
import { resolverVideoConnection } from "./Video/VideoConnection.resolver.js";
import { resolveVideoEvent, resolveVideoRegisterEvent } from "./Video/VideoEvent.resolver.js";
import { resolverVideoSearchItemByTitle } from "./Video/VideoSearchItemByTitle.resolver.js";
import { resolveVideoSimilarity } from "./Video/VideoSimilarity.resolver.js";
import { resolveVideoTag } from "./Video/VideoTag.resolver.js";
import {
  resolveVideoTagAttachEvent,
  resolveVideoTagDetachEvent,
  resolveVideoTagEvent,
  resolveVideoTagReattachEvent,
} from "./Video/VideoTagEvent.resolver.js";
import { resolveVideoThumbnail } from "./Video/VideoThumbnail.resolver.js";
import {
  resolveVideoThumbnailCreateEvent,
  resolveVideoThumbnailEvent,
  resolveVideoThumbnailSetPrimaryEvent,
  resolveVideoThumbnailUnsetPrimaryEvent,
} from "./Video/VideoThumbnailEvent.resolver.js";
import { resolveVideoTitle } from "./Video/VideoTitle.resolver.js";
import {
  resolveVideoTitleCreateEvent,
  resolveVideoTitleEvent,
  resolveVideoTitleSetPrimaryEvent,
  resolveVideoTitleUnsetPrimaryEvent,
} from "./Video/VideoTitleEvent.resolver.js";
import { resolverYoutubeRegistrationRequest } from "./YoutubeRegistrationRequest/YoutubeRegistrationRequest.resolver.js";
import { resolverYoutubeRegistrationRequestAccepting } from "./YoutubeRegistrationRequest/YoutubeRegistrationRequestAccepting.resolver.js";
import { mkYoutubeRegistrationRequestCheckingResolver } from "./YoutubeRegistrationRequest/YoutubeRegistrationRequestChecking.resolver.js";
import {
  mkYoutubeRegistrationRequestAcceptedEventResolver,
  mkYoutubeRegistrationRequestRejectedEventResolver,
  mkYoutubeRegistrationRequestResolvedEventResolver,
} from "./YoutubeRegistrationRequest/YoutubeRegistrationRequestCheckingEvent.resolver.js";
import { resolverYoutubeRegistrationRequestConnection } from "./YoutubeRegistrationRequest/YoutubeRegistrationRequestConnection.resolver.js";
import {
  mkYoutubeRegistrationRequestEventResolver,
  mkYoutubeRegistrationRequestRequestEventResolver,
} from "./YoutubeRegistrationRequest/YoutubeRegistrationRequestEvent.resolver.js";
import { resolverYoutubeRegistrationRequestRejecting } from "./YoutubeRegistrationRequest/YoutubeRegistrationRequestRejecting.resolver.js";
import { resolveYoutubeVideoSource } from "./YoutubeVideoSource/YoutubeVideoSource.resolver.js";
import {
  resolveYoutubeVideoSourceCreateEvent,
  resolveYoutubeVideoSourceEvent,
} from "./YoutubeVideoSource/YoutubeVideoSourceEvent.resolver.js";
import { resolverYoutubeVideoSourceEventConnection } from "./YoutubeVideoSource/YoutubeVideoSourceEventConnection.resolver.js";

export const makeResolvers = (deps: ResolverDeps) =>
  ({
    AbstractGroup: mkAbstractGroupResolver(deps),
    AbstractGrouping: mkAbstractGroupingResolver(deps),
    BilibiliMADSource: resolverBilibiliMADSource(deps),
    BilibiliMADSourceCreateEvent: resolverBilibiliMADSourceCreateEvent(deps),
    BilibiliMADSourceEventConnection: resolverBilibiliMADSourceEventConnection(deps),
    BilibiliMadRequestedTimelineEvent: mkBilibiliMadRequestedTimelineEventResolver(deps),
    BilibiliOriginalSource: mkBilibiliOriginalSourceResolver(deps),
    BilibiliOriginalSourceTag: resolverBilibiliOriginalSourceTag(deps),
    BilibiliRegistrationRequest: resolverBilibiliRegistrationRequest(deps),
    BilibiliRegistrationRequestAcceptEvent: mkBilibiliRegistrationRequestAcceptEventResolver(deps),
    BilibiliRegistrationRequestAccepting: resolverBilibiliRegistrationRequestAccepting(deps),
    BilibiliRegistrationRequestAcceptingNotification: mkBilibiliRegistrationRequestAcceptingNotificationResolver(deps),
    BilibiliRegistrationRequestConnection: resolverBilibiliRegistrationRequestConnection(),
    BilibiliRegistrationRequestEvent: mkBilibiliRegistrationRequestEventResolver(deps),
    BilibiliRegistrationRequestEventConnection: mkBilibiliRegistrationRequestEventConnectionResolver(deps),
    BilibiliRegistrationRequestRejectEvent: mkBilibiliRegistrationRequestRejectEventResolver(deps),
    BilibiliRegistrationRequestRejecting: mkBilibiliRegistrationRequestRejectingResolver(deps),
    BilibiliRegistrationRequestRejectingNotification: mkBilibiliRegistrationRequestRejectingNotificationResolver(deps),
    BilibiliRegistrationRequestRequestEvent: mkBilibiliRegistrationRequestRequestEventResolver(deps),
    DateTime: DateTimeResolver,
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
    NicovideoOriginalSource: mkNicovideoOriginalSourceResolver(deps),
    NicovideoOriginalSourceTag: resolveNicovideoOriginalSourceTag(deps),
    NicovideoRegistrationRequest: resolverNicovideoRegistrationRequest(deps),
    NicovideoRegistrationRequestAcceptEvent: mkNicovideoRegistrationRequestAcceptEventResolver(deps),
    NicovideoRegistrationRequestAccepting: resolverNicovideoRegistrationRequestAccepting(deps),
    NicovideoRegistrationRequestAcceptingNotification:
      mkNicovideoRegistrationRequestAcceptingNotificationResolver(deps),
    NicovideoRegistrationRequestConnection: resolverNicovideoRegistrationRequestConnection(),
    NicovideoRegistrationRequestEvent: mkNicovideoRegistrationRequestEventResolver(deps),
    NicovideoRegistrationRequestEventConnection: mkNicovideoRegistrationRequestEventConnectionResolver(deps),
    NicovideoRegistrationRequestRejectEvent: mkNicovideoRegistrationRequestRejectEventResolver(deps),
    NicovideoRegistrationRequestRejecting: resolverNicovideoRegistrationRequestRejecting(deps),
    NicovideoRegistrationRequestRejectingNotification:
      mkNicovideoRegistrationRequestRejectingNotificationResolver(deps),
    NicovideoRegistrationRequestRequestEvent: mkNicovideoRegistrationRequestRequestEventResolver(deps),
    NicovideoVideoSource: mkNicovideoVideoSourceResolver(deps),
    NicovideoVideoSourceCreateEvent: resolveNicovideoVideoSourceCreateEvent(deps),
    NicovideoVideoSourceEvent: resolveNicovideoVideoSourceEvent(),
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
    SoundcloudMadRequestedTimelineEvent: mkSoundcloudMadRequestedTimelineEventResolver(deps),
    SoundcloudOriginalSource: mkSoundcloudOriginalSourceResolver(deps),
    SoundcloudRegistrationRequest: resolverSoundcloudRegistrationRequest(deps),
    SoundcloudRegistrationRequestAcceptEvent: mkSoundcloudRegistrationRequestAcceptEventResolver(deps),
    SoundcloudRegistrationRequestAccepting: resolverSoundcloudRegistrationRequestAccepting(deps),
    SoundcloudRegistrationRequestAcceptingNotification:
      mkSoundcloudRegistrationRequestAcceptingNotificationResolver(deps),
    SoundcloudRegistrationRequestConnection: resolverSoundcloudRegistrationRequestConnection(),
    SoundcloudRegistrationRequestEvent: mkSoundcloudRegistrationRequestEventResolver(deps),
    SoundcloudRegistrationRequestEventConnection: mkSoundcloudRegistrationRequestEventConnectionResolver(deps),
    SoundcloudRegistrationRequestRejectEvent: mkSoundcloudRegistrationRequestRejectEventResolver(deps),
    SoundcloudRegistrationRequestRejecting: mkSoundcloudRegistrationRequestRejectingResolver(deps),
    SoundcloudRegistrationRequestRejectingNotification:
      mkSoundcloudRegistrationRequestRejectingNotificationResolver(deps),
    SoundcloudRegistrationRequestRequestEvent: mkSoundcloudRegistrationRequestRequestEventResolver(deps),
    Tag: resolveTag(deps),
    TagConnection: mkTagConnectionResolver(deps),
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
    // YoutubeRegistrationRequestEventConnection: mkYoutubeRegistrationRequestEventConnectionResolver(deps),
    VideoTitleUnsetPrimaryEvent: resolveVideoTitleUnsetPrimaryEvent(deps),
    YoutubeMadRequestAcceptedTimelineEvent: mkYoutubeMadRequestAcceptedTimelineEventResolver(deps),
    YoutubeMadRequestRejectedTimelineEvent: mkYoutubeMadRequestRejectedTimelineEventResolver(deps),
    YoutubeMadRequestResolvedTimelineEvent: mkYoutubeMadRequestResolvedTimelineEventResolver(deps),
    YoutubeMadRequestedTimelineEvent: mkYoutubeMadRequestedTimelineEventResolver(deps),
    YoutubeOriginalSource: mkYoutubeOriginalSourceResolver(deps),
    YoutubeRegistrationRequest: resolverYoutubeRegistrationRequest(deps),
    YoutubeRegistrationRequestAcceptedEvent: mkYoutubeRegistrationRequestAcceptedEventResolver(deps),
    YoutubeRegistrationRequestAccepting: resolverYoutubeRegistrationRequestAccepting(deps),
    YoutubeRegistrationRequestAcceptingNotification: mkYoutubeRegistrationRequestAcceptingNotificationResolver(deps),
    YoutubeRegistrationRequestChecking: mkYoutubeRegistrationRequestCheckingResolver(deps),
    YoutubeRegistrationRequestConnection: resolverYoutubeRegistrationRequestConnection(),
    YoutubeRegistrationRequestEvent: mkYoutubeRegistrationRequestEventResolver(deps),
    YoutubeRegistrationRequestRejectedEvent: mkYoutubeRegistrationRequestRejectedEventResolver(deps),
    YoutubeRegistrationRequestRejecting: resolverYoutubeRegistrationRequestRejecting(deps),
    YoutubeRegistrationRequestRejectingNotification: mkYoutubeRegistrationRequestRejectingNotificationResolver(deps),
    YoutubeRegistrationRequestRequestEvent: mkYoutubeRegistrationRequestRequestEventResolver(deps),
    YoutubeRegistrationRequestResolvedEvent: mkYoutubeRegistrationRequestResolvedEventResolver(deps),
    YoutubeVideoSource: resolveYoutubeVideoSource(deps),
    YoutubeVideoSourceCreateEvent: resolveYoutubeVideoSourceCreateEvent(deps),
    YoutubeVideoSourceEvent: resolveYoutubeVideoSourceEvent(),
    YoutubeVideoSourceEventConnection: resolverYoutubeVideoSourceEventConnection(),
  }) satisfies Resolvers;
