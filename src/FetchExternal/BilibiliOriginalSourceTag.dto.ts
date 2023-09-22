import { ApiResponseTag } from "./fetchBilibili.resolver.js";

export class BilibiliOriginalSourceTagDTO {
  private constructor(private readonly source: { name: string }) {}

  public static make({ tag_name }: ApiResponseTag) {
    return new BilibiliOriginalSourceTagDTO({ name: tag_name });
  }

  get name() {
    return this.source.name;
  }
}
