import { MylistRegistration } from "./mylist_registrations.js";
import { Mylist } from "./mylists.js";
import { NicovideoSource } from "./nicovideo_source.js";
import { Session } from "./sessions.js";
import { TagName } from "./tag_names.js";
import { TagParent } from "./tag_parents.js";
import { Tag } from "./tags.js";
import { User } from "./users.js";
import { VideoSource } from "./video_sources.js";
import { VideoTag } from "./video_tags.js";
import { VideoThumbnail } from "./video_thumbnails.js";
import { VideoTitle } from "./video_titles.js";
import { Video } from "./videos.js";

export const entities = [
  Tag,
  TagName,
  TagParent,
  VideoSource,
  VideoTag,
  VideoThumbnail,
  VideoTitle,
  Session,
  User,
  Video,
  Mylist,
  MylistRegistration,
  NicovideoSource,
];
