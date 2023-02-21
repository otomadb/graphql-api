/* eslint sort-keys: 2 */

import { type Resolvers } from "../graphql.js";
import { ResolverDeps } from "../index.js";
import { fetchNicovideo } from "./fetchNicovideo/fetchNicovideo.js";
import { findMylist } from "./findMylist/findMylist.js";
import { findNicovideoRegistrationRequests } from "./findNicovideoRegistrationRequests/findNicovideoRegistrationRequests.js";
import { findNicovideoVideoSource } from "./findNicovideoVideoSource/findNicovideoVideoSource.js";
import { findSemitags } from "./findSemitags/findSemitags.js";
import { findTag } from "./findTag/findTag.js";
import { findTags } from "./findTags/findTags.js";
import { findUser } from "./findUser/findUser.js";
import { findVideo } from "./findVideo/findVideos.js";
import { findVideos } from "./findVideos/findVideos.js";
import { mylist } from "./mylist/mylist.js";
import { mylistGroup } from "./mylistGroup/mylistGroup.js";
import { queryNicovideoRegistrationRequest } from "./NicovideoRegistrationRequest/NicovideoRegistrationRequest.js";
import { nicovideoVideoSource } from "./nicovideoVideoSource/nicovideoVideoSource.js";
import { searchTags } from "./searchTags/searchTags.js";
import { searchVideos } from "./searchVideos/searchVideos.js";
import { semitag } from "./semitag/semitag.js";
import { tag } from "./tag/tag.js";
import { user } from "./user/user.js";
import { video } from "./video/video.js";
import { whoami } from "./whoami/whoami.js";

export const resolveQuery = (deps: Pick<ResolverDeps, "prisma">) =>
  ({
    fetchNicovideo: fetchNicovideo(),
    findMylist: findMylist(deps),
    findNicovideoRegistrationRequests: findNicovideoRegistrationRequests(deps),
    findNicovideoVideoSource: findNicovideoVideoSource(deps),
    findSemitags: findSemitags(deps),
    findTag: findTag(deps),
    findTags: findTags(deps),
    findUser: findUser(deps),
    findVideo: findVideo(deps),
    findVideos: findVideos(deps),
    mylist: mylist(deps),
    mylistGroup: mylistGroup(deps),
    NicovideoRegistrationRequest: queryNicovideoRegistrationRequest(deps),
    nicovideoVideoSource: nicovideoVideoSource(deps),
    searchTags: searchTags(deps),
    searchVideos: searchVideos(deps),
    semitag: semitag(deps),
    tag: tag(deps),
    user: user(deps),
    video: video(deps),
    whoami: whoami(deps),
  } satisfies Resolvers["Query"]);
