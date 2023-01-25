import { Semitag } from "@prisma/client";

export class SemitagModel {
  public id;
  public name;
  public resolved;

  constructor({ id, name, isResolved }: Semitag) {
    this.id = id;
    this.name = name;
    this.resolved = isResolved;
  }
}
