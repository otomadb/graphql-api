import { BilibiliOriginalSourceTagDTO } from "./BilibiliOriginalSourceTag.dto.js";

export class BilibiliOriginalSourceDTO {
  private constructor(
    private readonly source: {
      sourceId: string;
      title: string;
      tags: BilibiliOriginalSourceTagDTO[];
      originalThumbnailUrl: string;
    },
  ) {}

  public static make({
    sourceId,
    title,
    tags,
    originalThumbnailUrl,
  }: {
    sourceId: string;
    title: string;
    originalThumbnailUrl: string;
    tags: BilibiliOriginalSourceTagDTO[];
  }) {
    return new BilibiliOriginalSourceDTO({ sourceId, title, tags, originalThumbnailUrl });
  }

  get sourceId() {
    return this.source.sourceId;
  }

  get title() {
    return this.source.title;
  }

  get tags() {
    return this.source.tags;
  }

  get originalThumbnailUrl() {
    return this.source.originalThumbnailUrl;
  }
}
