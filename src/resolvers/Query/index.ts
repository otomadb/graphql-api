import { DataSource } from "typeorm";

import { type Resolvers } from "../../graphql.js";
import { findMylist } from "./findMylist/findMylist.js";
import { findNicovideoVideoSource } from "./findNicovideoVideoSource/findNicovideoVideoSource.js";
import { findSemitags } from "./findSemitags/findSemitags.js";
import { findTags } from "./findTags/findTags.js";
import { findUser } from "./findUser/findUser.js";
import { findVideos } from "./findVideos/findVideos.js";
import { mylist } from "./mylist/mylist.js";
import { mylistGroup } from "./mylistGroup/mylistGroup.js";
import { nicovideoVideoSource } from "./nicovideoVideoSource/nicovideoVideoSource.js";
import { searchTags } from "./searchTags/searchTags.js";
import { searchVideos } from "./searchVideos/searchVideos.js";
import { semitag } from "./semitag/semitag.js";
import { tag } from "./tag/tag.js";
import { user } from "./user/user.js";
import { video } from "./video/video.js";
import { whoami } from "./whoami/whoami.js";

export const resolveQuery = (deps: { dataSource: DataSource }) =>
  ({
    findMylist: findMylist(deps),
    findNicovideoVideoSource: findNicovideoVideoSource(deps),
    findSemitags: findSemitags(deps),
    findTags: findTags(deps),
    findUser: findUser(deps),
    findVideos: findVideos(deps),
    mylist: mylist(deps),
    mylistGroup: mylistGroup(deps),
    nicovideoVideoSource: nicovideoVideoSource(deps),
    searchTags: searchTags(deps),
    searchVideos: searchVideos(deps),
    semitag: semitag(deps),
    tag: tag(deps),
    user: user(deps),
    video: video(deps),
    whoami: whoami(),
  } satisfies Resolvers["Query"]);
