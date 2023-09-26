export class SoundcloudOriginalSourceDTO {
  private constructor(
    private readonly source: {
      sourceId: string;
      url: string;
      title: string;
      originalThumbnailUrl: string;
    },
  ) {}

  public static make({
    sourceId,
    title,
    url,
    originalThumbnailUrl,
  }: {
    sourceId: string;
    url: string;
    title: string;
    originalThumbnailUrl: string;
  }) {
    return new SoundcloudOriginalSourceDTO({ sourceId, title, url, originalThumbnailUrl });
  }

  get sourceId() {
    return this.source.sourceId;
  }

  get title() {
    return this.source.title;
  }

  get url() {
    return this.source.url;
  }

  get originalThumbnailUrl() {
    return this.source.originalThumbnailUrl;
  }
}
