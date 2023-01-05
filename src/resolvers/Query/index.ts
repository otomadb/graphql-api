import { DataSource } from "typeorm";

import { type Resolvers } from "../../graphql.js";
import { findMylist } from "./findMylist.js";
import { findNicovideoVideoSource } from "./findNicovideoVideoSource.js";
import { findSemitags } from "./findSemitags.js";
import { findTags } from "./findTags.js";
import { findUser } from "./findUser.js";
import { findVideos } from "./findVideos.js";
import { getMylist } from "./getMylist.js";
import { getNicovideoVideoSource } from "./getNicovideoVideoSource.js";
import { getSemitag } from "./getSemitag.js";
import { getTag } from "./getTag.js";
import { getUser } from "./getUser.js";
import { getVideo } from "./getVideo.js";
import { mylistGroup } from "./mylistGroup/mylistGroup.js";
import { searchTags } from "./searchTags.js";
import { searchVideos } from "./searchVideos.js";
import { whoami } from "./whoami.js";

export const resolveQuery = (deps: { dataSource: DataSource }) =>
  ({
    findMylist: findMylist(deps),
    findNicovideoVideoSource: findNicovideoVideoSource(deps),
    findSemitags: findSemitags(deps),
    findTags: findTags(deps),
    findUser: findUser(deps),
    findVideos: findVideos(deps),
    mylist: getMylist(deps),
    nicovideoVideoSource: getNicovideoVideoSource(deps),
    searchTags: searchTags(deps),
    searchVideos: searchVideos(deps),
    semitag: getSemitag(deps),
    tag: getTag(deps),
    user: getUser(deps),
    video: getVideo(deps),
    whoami: whoami(),
    mylistGroup: mylistGroup(deps),
  } satisfies Resolvers["Query"]);
