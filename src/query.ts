/* eslint sort-keys: [2, "asc", {caseSensitive: false}] */

import { mkFindBilibiliMADSourceResolver } from "./BilibiliMADSource/findBilibiliMADSource.resolver.js";
import { resolverGetBilibiliMADSource } from "./BilibiliMADSource/getBilibiliMADSource.resolver.js";
import { mkFindBilibiliRegistrationRequestByUrlResolver } from "./BilibiliRegistrationRequest/findBilibiliRegistrationRequestBySourceId.resolver.js";
import { resolverFindUncheckedBilibiliRegistrationRequests } from "./BilibiliRegistrationRequest/findUncheckedBilibiliRegistrationRequests.resolver.js";
import { mkFindUncheckedBilibiliRegistrationRequestsByOffsetResolver } from "./BilibiliRegistrationRequest/findUncheckedBilibiliRegistrationRequestsByOffset.resolver.js";
import { resolverGetBilibiliRegistrationRequest } from "./BilibiliRegistrationRequest/getBilibiliRegistrationRequest.resolver.js";
import { resolverFetchBilibili } from "./FetchExternal/fetchBilibili.resolver.js";
import { fetchNicovideo } from "./FetchExternal/fetchNicovideo.js";
import { mkFetchSoundcloudResolver } from "./FetchExternal/fetchSoundcloud.resolver.js";
import { mkFetchSoundcloudBySourceIdResolver } from "./FetchExternal/fetchSoundcloudBySourceId.resolver.js";
import { mkFetchSoundcloudByUrlResolver } from "./FetchExternal/fetchSoundcloudByUrl.resolver.js";
import { resolverFetchYoutube } from "./FetchExternal/fetchYoutube.js";
import { mkListNicovideoBotRegistrationRequestsResolver } from "./NicovideoBotRegistrationRequest/listNicovideoBotRegistrationRequests.resolver.js";
import { resolverFindNicovideoRegistrationRequest } from "./NicovideoRegistrationRequest/findNicovideoRegistrationRequest.resolver.js";
import { findNicovideoRegistrationRequests } from "./NicovideoRegistrationRequest/findNicovideoRegistrationRequests.resolver.js";
import { resolverFindUncheckedNicovideoRegistrationRequests } from "./NicovideoRegistrationRequest/findUncheckedNicovideoRegistrationRequests.resolver.js";
import { resolverFindUncheckedNicovideoRegistrationRequestsByOffset } from "./NicovideoRegistrationRequest/findUncheckedNicovideoRegistrationRequestsByOffset.resolver.js";
import { resolverGetNicovideoRegistrationRequest } from "./NicovideoRegistrationRequest/getNicovideoRegistrationRequest.js";
import { resolverFindNicovideoVideoSource } from "./NicovideoVideoSource/findNicovideoVideoSource.resolver.js";
import { getNicovideoVideoSource } from "./NicovideoVideoSource/getNicovideoVideoSource.resolver.js";
import { type Resolvers } from "./resolvers/graphql.js";
import { resolverFindMylist } from "./resolvers/Query/findMylist/findMylist.js";
import { findSemitags } from "./resolvers/Query/findSemitags/findSemitags.js";
import { getMylist } from "./resolvers/Query/getMylist/resolver.js";
import { getMylistGroup } from "./resolvers/Query/getMylistGroup/resolver.js";
import { getNotification } from "./resolvers/Query/getNotification/resolver.js";
import { resolverGetSemitag } from "./resolvers/Query/getSemitag/resolver.js";
import { resolverNotifications } from "./resolvers/Query/notifications/resolver.js";
import { resolverWhoami } from "./resolvers/Query/whoami/resolver.js";
import { ResolverDeps } from "./resolvers/types.js";
import { mkFindSoundcloudMADSourceResolver } from "./SoundcloudMADSource/findSoundcloudMADSource.resolver.js";
import { getSoundcloudMADSource } from "./SoundcloudMADSource/getSoundcloudMADSource.resolver.js";
import { resolverFindSoundcloudRegistrationRequest } from "./SoundcloudRegistrationRequest/findSoundcloudRegistrationRequest.resolver.js";
import { mkFindSoundcloudRegistrationRequestBySourceIdResolver } from "./SoundcloudRegistrationRequest/findSoundcloudRegistrationRequestBySourceId.resolver.js";
import { mkFindSoundcloudRegistrationRequestByUrlResolver } from "./SoundcloudRegistrationRequest/findSoundcloudRegistrationRequestByUrl.resolver.js";
import { resolverFindUncheckedSoundcloudRegistrationRequests } from "./SoundcloudRegistrationRequest/findUncheckedSoundcloudRegistrationRequests.resolver.js";
import { mkFindUncheckedSoundcloudRegistrationRequestsByOffsetResolver } from "./SoundcloudRegistrationRequest/findUncheckedSoundcloudRegistrationRequestsByOffset.resolver.js";
import { resolverGetSoundcloudRegistrationRequest } from "./SoundcloudRegistrationRequest/getSoundcloudRegistrationRequest.resolver.js";
import { mkCountAllTagsResolver } from "./Tag/countAllTags.resolver.js";
import { resolverFindTag } from "./Tag/findTag.resolver.js";
import { resolverFindTagBySerial } from "./Tag/findTagBySerial.resolver.js";
import { resolverFindTags } from "./Tag/findTags.resolver.js";
import { resolverGetAllCategoryTag } from "./Tag/getAllCategoryTag.resolver.js";
import { resolverGetAllTypeCategoryTag } from "./Tag/getAllTypeCategoryTag.resolver.js";
import { resolverGetTag } from "./Tag/getTag.resolver.js";
import { resolverSearchTags } from "./Tag/searchTags.resolver.js";
import { mkShowTimelineResolver } from "./Timeline/showTimeline.resolver.js";
import { resolverFindUser } from "./User/findUser.resolver.js";
import { resolverGetUser } from "./User/getUser.resolver.js";
import { mkViewerResolver } from "./User/viewer.resolver.js";
import { mkCalcMadCountGrowthResolver } from "./Video/calcMadCountGrowth.resolver.js";
import { mkCountAllMadsResolver } from "./Video/countAllMads.resolver.js";
import { resolverFindMadBySerial } from "./Video/findMadBySerial.resolver.js";
import { mkFindMadsByOffsetResolver } from "./Video/findMadsByOffset.resolver.js";
import { resolverFindVideo } from "./Video/findVideo.resolver.js";
import { resolverFindVideos } from "./Video/findVideos.resolver.js";
import { resolverGetVideo } from "./Video/getVideo.resolver.js";
import { resolverSearchVideos } from "./Video/searchVideos.resolver.js";
import { resolverFindUncheckedYoutubeRegistrationRequests } from "./YoutubeRegistrationRequest/findUncheckedYoutubeRegistrationRequests.resolver.js";
import { mkFindUncheckedYoutubeRegistrationRequestsByOffsetResolver } from "./YoutubeRegistrationRequest/findUncheckedYoutubeRegistrationRequestsByOffset.resolver.js";
import { resolverFindYoutubeRegistrationRequest } from "./YoutubeRegistrationRequest/findYoutubeRegistrationRequest.resolver.js";
import { resolverGetYoutubeRegistrationRequest } from "./YoutubeRegistrationRequest/getYoutubeRegistrationRequest.resolver.js";
import { resolverFindYoutubeVideoSource } from "./YoutubeVideoSource/findYoutubeVideoSource.resolver.js";
import { getYoutubeVideoSource } from "./YoutubeVideoSource/getYoutubeVideoSource.resolver.js";

export const resolveQuery = (deps: ResolverDeps) =>
  ({
    calcMadCountGrowth: mkCalcMadCountGrowthResolver(deps),
    countAllMads: mkCountAllMadsResolver(deps),
    countAllTags: mkCountAllTagsResolver(deps),
    fetchBilibili: resolverFetchBilibili(deps),
    fetchNicovideo: fetchNicovideo(),
    fetchSoundcloud: mkFetchSoundcloudResolver(deps),
    fetchSoundcloudBySourceId: mkFetchSoundcloudBySourceIdResolver(deps),
    fetchSoundcloudByUrl: mkFetchSoundcloudByUrlResolver(deps),
    fetchYoutube: resolverFetchYoutube(),
    findBilibiliMADSource: mkFindBilibiliMADSourceResolver(deps),
    findBilibiliRegistrationRequestBySourceId: mkFindBilibiliRegistrationRequestByUrlResolver(deps),
    findMadBySerial: resolverFindMadBySerial(deps),
    findMadsByOffset: mkFindMadsByOffsetResolver({
      ...deps,
      logger: deps.logger.child({ resolver: "Query.findMadsByOffset" }),
    }),
    findMylist: resolverFindMylist(deps),
    findNicovideoRegistrationRequest: resolverFindNicovideoRegistrationRequest(deps),
    findNicovideoRegistrationRequests: findNicovideoRegistrationRequests(deps),
    findNicovideoVideoSource: resolverFindNicovideoVideoSource(deps),
    findSemitags: findSemitags(deps),
    findSoundcloudMADSource: mkFindSoundcloudMADSourceResolver(deps),
    findSoundcloudRegistrationRequest: resolverFindSoundcloudRegistrationRequest(deps),
    findSoundcloudRegistrationRequestBySourceId: mkFindSoundcloudRegistrationRequestBySourceIdResolver(deps),
    findSoundcloudRegistrationRequestByUrl: mkFindSoundcloudRegistrationRequestByUrlResolver(deps),
    findTag: resolverFindTag(deps),
    findTagBySerial: resolverFindTagBySerial(deps),
    findTags: resolverFindTags(deps),
    findUncheckedBilibiliRegistrationRequests: resolverFindUncheckedBilibiliRegistrationRequests(deps),
    findUncheckedBilibiliRegistrationRequestsByOffset: mkFindUncheckedBilibiliRegistrationRequestsByOffsetResolver({
      ...deps,
      logger: deps.logger.child({ resolver: "Query.findUncheckedBilibiliRegistrationRequestsByOffset" }),
    }),
    findUncheckedNicovideoRegistrationRequests: resolverFindUncheckedNicovideoRegistrationRequests(deps),
    findUncheckedNicovideoRegistrationRequestsByOffset: resolverFindUncheckedNicovideoRegistrationRequestsByOffset({
      ...deps,
      logger: deps.logger.child({ resolver: "Query.findUncheckedNicovideoRegistrationRequestsByOffset" }),
    }),
    findUncheckedSoundcloudRegistrationRequests: resolverFindUncheckedSoundcloudRegistrationRequests(deps),
    findUncheckedSoundcloudRegistrationRequestsByOffset: mkFindUncheckedSoundcloudRegistrationRequestsByOffsetResolver({
      ...deps,
      logger: deps.logger.child({ resolver: "Query.findUncheckedSoundcloudRegistrationRequestsByOffset" }),
    }),
    findUncheckedYoutubeRegistrationRequests: resolverFindUncheckedYoutubeRegistrationRequests(deps),
    findUncheckedYoutubeRegistrationRequestsByOffset: mkFindUncheckedYoutubeRegistrationRequestsByOffsetResolver({
      ...deps,
      logger: deps.logger.child({ resolver: "Query.findUncheckedYoutubeRegistrationRequestsByOffset" }),
    }),
    findUser: resolverFindUser(deps),
    findVideo: resolverFindVideo(deps),
    findVideos: resolverFindVideos(deps),
    findYoutubeRegistrationRequest: resolverFindYoutubeRegistrationRequest(deps),
    findYoutubeVideoSource: resolverFindYoutubeVideoSource(deps),
    getAllCategoryTag: resolverGetAllCategoryTag(deps),
    getAllTypeCategoryTag: resolverGetAllTypeCategoryTag(deps),
    getBilibiliMADSource: resolverGetBilibiliMADSource(deps),
    getBilibiliRegistrationRequest: resolverGetBilibiliRegistrationRequest(deps),
    getMylist: getMylist(deps),
    getMylistGroup: getMylistGroup(deps),
    getNicovideoRegistrationRequest: resolverGetNicovideoRegistrationRequest(deps),
    getNicovideoVideoSource: getNicovideoVideoSource(deps),
    getNotification: getNotification(deps),
    getSemitag: resolverGetSemitag(deps),
    getSoundcloudMADSource: getSoundcloudMADSource(deps),
    getSoundcloudRegistrationRequest: resolverGetSoundcloudRegistrationRequest(deps),
    getTag: resolverGetTag(deps),
    getUser: resolverGetUser(deps),
    getVideo: resolverGetVideo(deps),
    getYoutubeRegistrationRequest: resolverGetYoutubeRegistrationRequest(deps),
    getYoutubeVideoSource: getYoutubeVideoSource(deps),
    listNicovideoBotRegistrationRequests: mkListNicovideoBotRegistrationRequestsResolver(deps),
    notifications: resolverNotifications(deps),
    searchTags: resolverSearchTags(deps),
    searchVideos: resolverSearchVideos(deps),
    showTimeline: mkShowTimelineResolver(deps),
    viewer: mkViewerResolver({ ...deps }),
    whoami: resolverWhoami(deps),
  }) satisfies Required<Resolvers["Query"]>;
