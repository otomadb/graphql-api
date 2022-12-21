export class SemitagModel {
  public id;
  public name;
  public resolved;

  constructor({ id, name, resolved }: { id: string; name: string; resolved: boolean }) {
    this.id = id;
    this.name = name;
    this.resolved = resolved;
  }
}
