/* eslint sort-keys: [2, "asc", {caseSensitive: false}] */

import { resolverGetBilibiliMADSource } from "../../BilibiliMADSource/getBilibiliMADSource.resolver.js";
import { resolverFetchBilibili } from "../../FetchExternal/fetchBilibili.resolver.js";
import { resolverFindNicovideoRegistrationRequest } from "../../NicovideoRegistrationRequest/findNicovideoRegistrationRequest.resolver.js";
import { findNicovideoRegistrationRequests } from "../../NicovideoRegistrationRequest/findNicovideoRegistrationRequests.resolver.js";
import { resolverFindUncheckedNicovideoRegistrationRequests } from "../../NicovideoRegistrationRequest/findUncheckedNicovideoRegistrationRequests.resolver.js";
import { resolverFindUncheckedNicovideoRegistrationRequestsByOffset } from "../../NicovideoRegistrationRequest/findUncheckedNicovideoRegistrationRequestsByOffset.resolver.js";
import { resolverGetNicovideoRegistrationRequest } from "../../NicovideoRegistrationRequest/getNicovideoRegistrationRequest.js";
import { resolverFindNicovideoVideoSource } from "../../NicovideoVideoSource/findNicovideoVideoSource.resolver.js";
import { getNicovideoVideoSource } from "../../NicovideoVideoSource/getNicovideoVideoSource.resolver.js";
import { getSoundcloudVideoSource } from "../../SoundcloudVideoSource/getSoundcloudVideoSource.resolver.js";
import { resolverFindTag } from "../../Tag/findTag.resolver.js";
import { resolverFindTagBySerial } from "../../Tag/findTagBySerial.resolver.js";
import { resolverFindTags } from "../../Tag/findTags.resolver.js";
import { resolverGetAllCategoryTag } from "../../Tag/getAllCategoryTag.resolver.js";
import { resolverGetAllTypeCategoryTag } from "../../Tag/getAllTypeCategoryTag.resolver.js";
import { resolverGetTag } from "../../Tag/getTag.resolver.js";
import { resolverSearchTags } from "../../Tag/searchTags.resolver.js";
import { resolverFindUser } from "../../User/findUser.resolver.js";
import { resolverGetUser } from "../../User/getUser.resolver.js";
import { resolverFindMadBySerial } from "../../Video/findMadBySerial.resolver.js";
import { resolverFindVideo } from "../../Video/findVideo.resolver.js";
import { resolverFindVideos } from "../../Video/findVideos.resolver.js";
import { resolverGetVideo } from "../../Video/getVideo.resolver.js";
import { resolverSearchVideos } from "../../Video/searchVideos.resolver.js";
import { resolverFindUncheckedYoutubeRegistrationRequests } from "../../YoutubeRegistrationRequest/findUncheckedYoutubeRegistrationRequests.resolver.js";
import { resolverFindYoutubeRegistrationRequest } from "../../YoutubeRegistrationRequest/findYoutubeRegistrationRequest.resolver.js";
import { resolverGetYoutubeRegistrationRequest } from "../../YoutubeRegistrationRequest/getYoutubeRegistrationRequest.resolver.js";
import { resolverFindYoutubeVideoSource } from "../../YoutubeVideoSource/findYoutubeVideoSource.resolver.js";
import { getYoutubeVideoSource } from "../../YoutubeVideoSource/getYoutubeVideoSource.resolver.js";
import { type Resolvers } from "../graphql.js";
import { ResolverDeps } from "../types.js";
import { fetchNicovideo } from "./fetchNicovideo/fetchNicovideo.js";
import { resolverFetchSoundcloud } from "./fetchSoundcloud/resolver.js";
import { resolverFetchYoutube } from "./fetchYoutube/resolver.js";
import { resolverFindMylist } from "./findMylist/findMylist.js";
import { findSemitags } from "./findSemitags/findSemitags.js";
import { getMylist } from "./getMylist/resolver.js";
import { getMylistGroup } from "./getMylistGroup/resolver.js";
import { getNotification } from "./getNotification/resolver.js";
import { resolverGetSemitag } from "./getSemitag/resolver.js";
import { resolverNotifications } from "./notifications/resolver.js";
import { resolverWhoami } from "./whoami/resolver.js";

export const resolveQuery = (deps: ResolverDeps) =>
  ({
    fetchBilibili: resolverFetchBilibili(deps),
    fetchNicovideo: fetchNicovideo(),
    fetchSoundcloud: resolverFetchSoundcloud(deps),
    fetchYoutube: resolverFetchYoutube(),
    findMadBySerial: resolverFindMadBySerial(deps),
    findMylist: resolverFindMylist(deps),
    findNicovideoRegistrationRequest: resolverFindNicovideoRegistrationRequest(deps),
    findNicovideoRegistrationRequests: findNicovideoRegistrationRequests(deps),
    findNicovideoVideoSource: resolverFindNicovideoVideoSource(deps),
    findSemitags: findSemitags(deps),
    findTag: resolverFindTag(deps),
    findTagBySerial: resolverFindTagBySerial(deps),
    findTags: resolverFindTags(deps),
    findUncheckedNicovideoRegistrationRequests: resolverFindUncheckedNicovideoRegistrationRequests(deps),
    findUncheckedNicovideoRegistrationRequestsByOffset:
      resolverFindUncheckedNicovideoRegistrationRequestsByOffset(deps),
    findUncheckedYoutubeRegistrationRequests: resolverFindUncheckedYoutubeRegistrationRequests(deps),
    findUser: resolverFindUser(deps),
    findVideo: resolverFindVideo(deps),
    findVideos: resolverFindVideos(deps),
    findYoutubeRegistrationRequest: resolverFindYoutubeRegistrationRequest(deps),
    findYoutubeVideoSource: resolverFindYoutubeVideoSource(deps),
    getAllCategoryTag: resolverGetAllCategoryTag(deps),
    getAllTypeCategoryTag: resolverGetAllTypeCategoryTag(deps),
    getBilibiliMADSource: resolverGetBilibiliMADSource(deps),
    getMylist: getMylist(deps),
    getMylistGroup: getMylistGroup(deps),
    getNicovideoRegistrationRequest: resolverGetNicovideoRegistrationRequest(deps),
    getNicovideoVideoSource: getNicovideoVideoSource(deps),
    getNotification: getNotification(deps),
    getSemitag: resolverGetSemitag(deps),
    getSoundcloudVideoSource: getSoundcloudVideoSource(deps),
    getTag: resolverGetTag(deps),
    getUser: resolverGetUser(deps),
    getVideo: resolverGetVideo(deps),
    getYoutubeRegistrationRequest: resolverGetYoutubeRegistrationRequest(deps),
    getYoutubeVideoSource: getYoutubeVideoSource(deps),
    notifications: resolverNotifications(deps),
    searchTags: resolverSearchTags(deps),
    searchVideos: resolverSearchVideos(deps),
    whoami: resolverWhoami(deps),
  }) satisfies Resolvers["Query"];
