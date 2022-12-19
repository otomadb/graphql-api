import { Video } from "../../db/entities/videos.js";

export class VideoModel {
  public id;
  public createdAt;

  constructor(video: Video) {
    this.id = video.id;
    this.createdAt = video.createdAt;
  }
}
