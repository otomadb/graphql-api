import { Video } from "@prisma/client";

export class VideoModel {
  constructor(private readonly video: Video) {}

  get id() {
    return this.video.id;
  }
}
