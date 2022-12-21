export class SemitagModel {
  public id;
  public name;

  constructor({ id, name }: { id: string; name: string }) {
    this.id = id;
    this.name = name;
  }
}
