import { VideoTitleResolvers } from "~/codegen/resolvers.js";
import { VideoTitle } from "~/db/entities/video_titles.js";

export class VideoTitleModel implements VideoTitleResolvers {
  constructor(private readonly videoTitle: VideoTitle) {}

  title() {
    return this.videoTitle.title;
  }

  primary() {
    return this.videoTitle.isPrimary;
  }
}
