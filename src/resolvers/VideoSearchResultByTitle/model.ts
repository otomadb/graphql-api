export class VideoSearchResultByTitleModel {
  private constructor(private readonly entity: { titleId: string; videoId: string }) {}

  static make(entity: { titleId: string; videoId: string }) {
    return new VideoSearchResultByTitleModel(entity);
  }

  get titleId() {
    return this.entity.titleId;
  }

  get videoId() {
    return this.entity.videoId;
  }
}
