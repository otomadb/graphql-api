import { YoutubeVideoSource } from "@prisma/client";

export class YoutubeVideoSourceModel {
  private constructor(private readonly source: { id: string; sourceId: string; videoId: string }) {}

  public static fromPrisma(source: YoutubeVideoSource) {
    return new YoutubeVideoSourceModel(source);
  }

  get id() {
    return this.source.id;
  }

  get sourceId() {
    return this.source.sourceId;
  }

  get videoId() {
    return this.source.videoId;
  }
}
