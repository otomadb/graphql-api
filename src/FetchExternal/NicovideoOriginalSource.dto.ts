export class NicovideoOriginalSourceDTO {
  private constructor(private readonly source: { sourceId: string; originalThumbnailUrl: string }) {}

  public static make(source: { sourceId: string; originalThumbnailUrl: string }) {
    return new NicovideoOriginalSourceDTO(source);
  }

  get sourceId() {
    return this.source.sourceId;
  }

  get originalThumbnailUrl() {
    return this.source.originalThumbnailUrl;
  }
}
