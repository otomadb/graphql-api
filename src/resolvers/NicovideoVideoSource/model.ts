import { NicovideoVideoSource } from "@prisma/client";

export class NicovideoVideoSourceModel {
  public id;
  public sourceId;
  public videoId;

  constructor(private readonly source: NicovideoVideoSource) {
    this.id = source.id;
    this.sourceId = source.sourceId;
    this.videoId = source.videoId;
  }
}
