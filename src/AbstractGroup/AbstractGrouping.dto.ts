import { AbstractGrouping } from "@prisma/client";

export class AbstractGroupingDTO {
  private constructor(
    private readonly source: {
      id: string;
      groupKeyword: string;
      tagId: string;
    },
  ) {}

  public static fromPrisma(source: AbstractGrouping) {
    return new AbstractGroupingDTO({ id: source.id, groupKeyword: source.groupKeyword, tagId: source.tagId });
  }

  get id() {
    return this.source.id;
  }

  get groupKeyword() {
    return this.source.groupKeyword;
  }

  get tagId() {
    return this.source.tagId;
  }
}
