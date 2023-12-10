import { AbstractGroup } from "@prisma/client";

export class AbstractGroupDTO {
  private constructor(private readonly source: { keyword: string }) {}

  public static fromPrisma(source: AbstractGroup) {
    return new AbstractGroupDTO({
      keyword: source.keyword,
    });
  }

  get keyword() {
    return this.source.keyword;
  }
}
