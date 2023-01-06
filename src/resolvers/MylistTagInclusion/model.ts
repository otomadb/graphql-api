export class MylistTagInclusionModel {
  constructor(
    private readonly entity: {
      count: number;
      mylistId: string;
      tagId: string;
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
