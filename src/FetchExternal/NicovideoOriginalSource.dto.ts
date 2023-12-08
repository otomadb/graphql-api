export class NicovideoOriginalSourceDTO {
  private constructor(private readonly source: { sourceId: string }) {}

  public static make(source: { sourceId: string }) {
    return new NicovideoOriginalSourceDTO(source);
  }

  get sourceId() {
    return this.source.sourceId;
  }
}
