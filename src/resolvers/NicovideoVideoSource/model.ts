export class NicovideoVideoSourceModel {
  public id;
  public sourceId;
  public videoId;

  constructor(private readonly source: { id: string; sourceId: string; videoId: string }) {
    this.id = source.id;
    this.sourceId = source.sourceId;
    this.videoId = source.videoId;
  }
}
