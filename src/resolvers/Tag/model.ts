export class TagModel {
  public id;
  public meaningless;

  constructor(tag: { id: string; meaningless: boolean }) {
    this.id = tag.id;
    this.meaningless = tag.meaningless;
  }
}
