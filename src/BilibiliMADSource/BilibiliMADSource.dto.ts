import { BilibiliMADSource } from "@prisma/client";

export class BilibiliMADSourceDTO {
  private constructor(private readonly source: { id: string; sourceId: string; videoId: string }) {}

  public static fromPrisma(source: BilibiliMADSource) {
    return new BilibiliMADSourceDTO({
      id: source.id,
      sourceId: source.sourceId,
      videoId: source.videoId,
    });
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
