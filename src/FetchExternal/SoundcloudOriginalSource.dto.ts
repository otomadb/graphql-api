export class SoundcloudOriginalSourceDTO {
  private constructor(
    private readonly source: {
      sourceId: string;
      url: string;
      title: string;
      originalThumbnailUrl: string | null;
      userAvatarUrl: string;
    },
  ) {}

  public static make({
    sourceId,
    title,
    url,
    originalThumbnailUrl,
    userAvatarUrl,
  }: {
    sourceId: string;
    url: string;
    title: string;
    originalThumbnailUrl: string | null;
    userAvatarUrl: string;
  }) {
    return new SoundcloudOriginalSourceDTO({ sourceId, title, url, originalThumbnailUrl, userAvatarUrl });
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

  get userAvatarUrl() {
    return this.source.userAvatarUrl;
  }
}
