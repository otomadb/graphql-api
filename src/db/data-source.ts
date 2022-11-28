import { dirname } from "node:path";
import { DataSource } from "typeorm";
import { Session } from "./entities/sessions.js";
import { Tag } from "./entities/tags.js";
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
  entities: [User, Session, Video, VideoTitle, VideoThumbnail, VideoTag, VideoSource, Tag],
  migrations: [`${dir}/migrations/*.ts`, `${dir}/migrations/*.js`],
});
