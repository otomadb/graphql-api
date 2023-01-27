export class MylistTagInclusionModel {
  constructor(
    private readonly entity: {
      count: number;
      tagId: string;
      mylistId: string;
    }
  ) {}

  get count() {
    return this.entity.count;
  }

  get mylistId() {
    return this.entity.mylistId;
  }

  get tagId() {
    return this.entity.tagId;
  }
}
