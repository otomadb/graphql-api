import { DataSource } from "typeorm";

import { type Resolvers } from "../../graphql/resolvers.js";
import { findMylist } from "./findMylist.js";
import { findNicovideoVideoSource } from "./findNicovideoVideoSource.js";
import { getMylist } from "./getMylist.js";
import { getNicovideoVideoSource } from "./getNicovideoVideoSource.js";
import { getTag } from "./getTag.js";
import { getTags } from "./getTags.js";
import { getUser } from "./getUser.js";
import { getVideo } from "./getVideo.js";
import { getVideos } from "./getVideos.js";
import { searchTags } from "./searchTags.js";
import { searchVideos } from "./searchVideos.js";
import { whoami } from "./whoami.js";

export const resolveQuery = (deps: { dataSource: DataSource }): Resolvers["Query"] => ({
  searchTags: searchTags(deps),
  searchVideos: searchVideos(deps),
  tag: getTag(deps),
  tags: getTags(deps),
  user: getUser(deps),
  video: getVideo(deps),
  videos: getVideos(deps),
  mylist: getMylist(deps),
  findMylist: findMylist(deps),
  whoami: whoami(),
  nicovideoVideoSource: getNicovideoVideoSource(deps),
  findNicovideoVideoSource: findNicovideoVideoSource(deps),
});
