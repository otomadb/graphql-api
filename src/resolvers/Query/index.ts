/* eslint sort-keys: [2, "asc", {caseSensitive: false}] */

import { type Resolvers } from "../graphql.js";
import { ResolverDeps } from "../types.js";
import { fetchNicovideo } from "./fetchNicovideo/fetchNicovideo.js";
import { findMylist } from "./findMylist/findMylist.js";
import { resolverFindNicovideoRegistrationRequest } from "./findNicovideoRegistrationRequest/resolver.js";
import { findNicovideoRegistrationRequests } from "./findNicovideoRegistrationRequests/findNicovideoRegistrationRequests.js";
import { findNicovideoVideoSource } from "./findNicovideoVideoSource/findNicovideoVideoSource.js";
import { findSemitags } from "./findSemitags/findSemitags.js";
import { findTag } from "./findTag/findTag.js";
import { findTags } from "./findTags/findTags.js";
import { findUser } from "./findUser/findUser.js";
import { findVideo } from "./findVideo/findVideos.js";
import { findVideos } from "./findVideos/findVideos.js";
import { getMylist } from "./getMylist/resolver.js";
import { getMylistGroup } from "./getMylistGroup/resolver.js";
import { getNicovideoRegistrationRequest } from "./getNicovideoRegistrationRequest/getNicovideoRegistrationRequest.js";
import { getNicovideoVideoSource } from "./getNicovideoVideoSource/resolver.js";
import { getSemitag } from "./getSemitag/resolver.js";
import { getTag } from "./getTag/resolver.js";
import { getUser } from "./getUser/resolver.js";
import { getVideo } from "./getVideo/resolver.js";
import { getYoutubeVideoSource } from "./getYoutubeVideoSource/resolver.js";
import { searchTags } from "./searchTags/resolver.js";
import { searchVideos } from "./searchVideos/resolver.js";
import { whoami } from "./whoami/whoami.js";

export const resolveQuery = (deps: ResolverDeps) =>
  ({
    fetchNicovideo: fetchNicovideo(),
    findMylist: findMylist(deps),
    findNicovideoRegistrationRequest: resolverFindNicovideoRegistrationRequest(deps),
    findNicovideoRegistrationRequests: findNicovideoRegistrationRequests(deps),
    findNicovideoVideoSource: findNicovideoVideoSource(deps),
    findSemitags: findSemitags(deps),
    findTag: findTag(deps),
    findTags: findTags(deps),
    findUser: findUser(deps),
    findVideo: findVideo(deps),
    findVideos: findVideos(deps),
    getMylist: getMylist(deps),
    getMylistGroup: getMylistGroup(deps),
    getNicovideoRegistrationRequest: getNicovideoRegistrationRequest(deps),
    getNicovideoVideoSource: getNicovideoVideoSource(deps),
    getSemitag: getSemitag(deps),
    getTag: getTag(deps),
    getUser: getUser(deps),
    getVideo: getVideo(deps),
    getYoutubeVideoSource: getYoutubeVideoSource(deps),
    mylist: getMylist(deps),
    mylistGroup: getMylistGroup(deps),
    nicovideoVideoSource: getNicovideoVideoSource(deps),
    searchTags: searchTags(deps),
    searchVideos: searchVideos(deps),
    semitag: getSemitag(deps),
    tag: getTag(deps),
    user: getUser(deps),
    video: getVideo(deps),
    whoami: whoami(deps),
  } satisfies Resolvers["Query"]);
