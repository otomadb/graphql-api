/* eslint sort-keys: [2, "asc", {caseSensitive: false}] */

import { type Resolvers } from "../graphql.js";
import { ResolverDeps } from "../types.js";
import { fetchNicovideo } from "./fetchNicovideo/fetchNicovideo.js";
import { resolverFetchYoutube } from "./fetchYoutube/resolver.js";
import { resolverFindMylist } from "./findMylist/findMylist.js";
import { resolverFindNicovideoRegistrationRequest } from "./findNicovideoRegistrationRequest/resolver.js";
import { findNicovideoRegistrationRequests } from "./findNicovideoRegistrationRequests/findNicovideoRegistrationRequests.js";
import { findNicovideoVideoSource } from "./findNicovideoVideoSource/findNicovideoVideoSource.js";
import { findSemitags } from "./findSemitags/findSemitags.js";
import { findTag } from "./findTag/findTag.js";
import { findTags } from "./findTags/findTags.js";
import { resolverFindUncheckedNicovideoRegistrationRequests } from "./findUncheckedNicovideoRegistrationRequests/resolver.js";
import { resolverFindUncheckedNicovideoRegistrationRequestsByOffset } from "./findUncheckedNicovideoRegistrationRequestsByOffset/resolver.js";
import { findUser } from "./findUser/findUser.js";
import { findVideo } from "./findVideo/findVideos.js";
import { findVideos } from "./findVideos/findVideos.js";
import { resolverFindYoutubeVideoSource } from "./findYoutubeVideoSource/resolver.js";
import { resolverGetAllCategoryTag } from "./getAllCategoryTag/resolver.js";
import { resolverGetAllTypeCategoryTag } from "./getAllTypeCategoryTag/resolver.js";
import { getMylist } from "./getMylist/resolver.js";
import { getMylistGroup } from "./getMylistGroup/resolver.js";
import { getNicovideoRegistrationRequest } from "./getNicovideoRegistrationRequest/getNicovideoRegistrationRequest.js";
import { getNicovideoVideoSource } from "./getNicovideoVideoSource/resolver.js";
import { getNotification } from "./getNotification/resolver.js";
import { resolverGetSemitag } from "./getSemitag/resolver.js";
import { getTag } from "./getTag/resolver.js";
import { getUser } from "./getUser/resolver.js";
import { getVideo } from "./getVideo/resolver.js";
import { getYoutubeVideoSource } from "./getYoutubeVideoSource/resolver.js";
import { resolverNotifications } from "./notifications/resolver.js";
import { searchTags } from "./searchTags/resolver.js";
import { searchVideos } from "./searchVideos/resolver.js";
import { resolverWhoami } from "./whoami/resolver.js";

export const resolveQuery = (deps: ResolverDeps) =>
  ({
    fetchNicovideo: fetchNicovideo(),
    fetchYoutube: resolverFetchYoutube(),
    findMylist: resolverFindMylist(deps),
    findNicovideoRegistrationRequest: resolverFindNicovideoRegistrationRequest(deps),
    findNicovideoRegistrationRequests: findNicovideoRegistrationRequests(deps),
    findNicovideoVideoSource: findNicovideoVideoSource(deps),
    findSemitags: findSemitags(deps),
    findTag: findTag(deps),
    findTags: findTags(deps),
    findUncheckedNicovideoRegistrationRequests: resolverFindUncheckedNicovideoRegistrationRequests(deps),
    findUncheckedNicovideoRegistrationRequestsByOffset:
      resolverFindUncheckedNicovideoRegistrationRequestsByOffset(deps),
    findUser: findUser(deps),
    findVideo: findVideo(deps),
    findVideos: findVideos(deps),
    findYoutubeVideoSource: resolverFindYoutubeVideoSource(deps),
    getAllCategoryTag: resolverGetAllCategoryTag(deps),
    getAllTypeCategoryTag: resolverGetAllTypeCategoryTag(deps),
    getMylist: getMylist(deps),
    getMylistGroup: getMylistGroup(deps),
    getNicovideoRegistrationRequest: getNicovideoRegistrationRequest(deps),
    getNicovideoVideoSource: getNicovideoVideoSource(deps),
    getNotification: getNotification(deps),
    getSemitag: resolverGetSemitag(deps),
    getTag: getTag(deps),
    getUser: getUser(deps),
    getVideo: getVideo(deps),
    getYoutubeVideoSource: getYoutubeVideoSource(deps),
    notifications: resolverNotifications(deps),
    searchTags: searchTags(deps),
    searchVideos: searchVideos(deps),
    whoami: resolverWhoami(deps),
  } satisfies Resolvers["Query"]);
