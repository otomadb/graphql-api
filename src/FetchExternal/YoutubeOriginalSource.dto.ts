export class YoutubeOriginalSourceDTO {
  private constructor(
    private readonly source: {
      sourceId: string;
      url: string;
      originalThumbnailUrl: string;
    },
  ) {}

  public static make({
    sourceId,
    url,
    originalThumbnailUrl,
  }: {
    sourceId: string;
    url: string;
    originalThumbnailUrl: string;
  }) {
    return new YoutubeOriginalSourceDTO({ sourceId, url, originalThumbnailUrl });
  }

  get sourceId() {
    return this.source.sourceId;
  }

  get url() {
    return this.source.url;
  }

  get originalThumbnailUrl() {
    return this.source.originalThumbnailUrl;
  }
}
