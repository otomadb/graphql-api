import { DataSource } from "typeorm";

import { type Resolvers } from "../../graphql/resolvers.js";
import { findNicovideoVideoSource } from "./findNicovideoVideoSource.js";
import { getMylist } from "./get_mylist.js";
import { getTag } from "./get_tag.js";
import { getTags } from "./get_tags.js";
import { getUser } from "./get_user.js";
import { getVideo } from "./get_video.js";
import { getVideos } from "./get_videos.js";
import { getNicovideoVideoSource } from "./getNicovideoVideoSource.js";
import { searchTags } from "./search_tags.js";
import { searchVideos } from "./search_videos.js";
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
  whoami: whoami(),
  nicovideoVideoSource: getNicovideoVideoSource(deps),
  findNicovideoVideoSource: findNicovideoVideoSource(deps),
});
