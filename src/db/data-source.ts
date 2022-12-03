import { dirname } from "node:path";
import { DataSource } from "typeorm";
import { Session } from "./entities/sessions.js";
import { Tag } from "./entities/tags.js";
import { TagName } from "./entities/tag_names.js";
import { TagParent } from "./entities/tag_parents.js";
import { User } from "./entities/users.js";
import { Video } from "./entities/videos.js";
import { VideoSource } from "./entities/video_sources.js";
import { VideoTag } from "./entities/video_tags.js";
import { VideoThumbnail } from "./entities/video_thumbnails.js";
import { VideoTitle } from "./entities/video_titles.js";

const dir = dirname(new URL(import.meta.url).pathname);

export const dataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: [Tag, TagName, TagParent, VideoSource, VideoTag, VideoThumbnail, VideoTitle, Session, User, Video],
  migrations: [`${dir}/migrations/*.ts`, `${dir}/migrations/*.js`],
});
