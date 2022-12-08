import { DataSource } from "typeorm";

import { type Resolvers } from "../../graphql/resolvers.js";
import { getTag } from "./get_tag.js";
import { getTags } from "./get_tags.js";
import { getUser } from "./get_user.js";
import { getVideo } from "./get_video.js";
import { getVideos } from "./get_videos.js";
import { searchTags } from "./search_tags.js";
import { searchVideos } from "./search_videos.js";
import { whoami } from "./whoami.js";

export const resolveQuery = (deps: { dataSource: DataSource }): Resolvers["Query"] => ({
  // findNiconicoSource, // 最悪まだ実装しなくてもいい
  // niconicoSource, // 最悪まだ実装しなくてもいい
  searchTags: searchTags(deps),
  searchVideos: searchVideos(deps),
  tag: getTag(deps),
  tags: getTags(deps),
  user: getUser(deps),
  video: getVideo(deps),
  videos: getVideos(deps),
  whoami: whoami(),
});
