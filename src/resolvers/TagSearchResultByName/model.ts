export class TagSearchResultByNameModel {
  private constructor(private readonly entity: { nameId: string; tagId: string }) {}

  static make(entity: { nameId: string; tagId: string }) {
    return new TagSearchResultByNameModel(entity);
  }

  get tagId() {
    return this.entity.tagId;
  }

  get nameId() {
    return this.entity.nameId;
  }
}
