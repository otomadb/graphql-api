export class SemitagSuggestTagsItemModel {
  private constructor(
    private readonly entity: {
      nameId: string;
      tagId: string;
      semitagId: string;
    },
  ) {}

  static make(entity: { nameId: string; tagId: string; semitagId: string }) {
    return new SemitagSuggestTagsItemModel(entity);
  }

  get tagId() {
    return this.entity.tagId;
  }

  get nameId() {
    return this.entity.nameId;
  }

  get semitagId() {
    return this.entity.semitagId;
  }
}
