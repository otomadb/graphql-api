import { type Resolvers } from "../../graphql/resolvers.js";
import { getMylist } from "./get_mylist.js";
import { getTag } from "./get_tag.js";
import { getTags } from "./get_tags.js";
import { getUser } from "./get_user.js";
import { getVideo } from "./get_video.js";
import { getVideos } from "./get_videos.js";
import { searchTags } from "./search_tags.js";
import { searchVideos } from "./search_videos.js";
import { whoami } from "./whoami.js";

export const resolveQuery: Resolvers["Query"] = {
  // findNiconicoSource, // 最悪まだ実装しなくてもいい
  // niconicoSource, // 最悪まだ実装しなくてもいい
  searchTags,
  searchVideos,
  tag: getTag,
  tags: getTags,
  mylist: getMylist,
  user: getUser,
  video: getVideo,
  videos: getVideos,
  whoami,
};
