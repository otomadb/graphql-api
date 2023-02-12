import { VideoTitle } from "@prisma/client";

export class VideoTitleModel {
  constructor(protected readonly videoTitle: VideoTitle) {}

  get id() {
    return this.videoTitle.id;
  }

  get title() {
    return this.videoTitle.title;
  }

  get primary() {
    return this.videoTitle.isPrimary;
  }

  get videoId() {
    return this.videoTitle.videoId;
  }
}
