import { Semitag } from "@prisma/client";

export class SemitagModel {
  constructor(private readonly entity: Semitag) {}

  static fromPrisma(entity: Semitag) {
    return new SemitagModel(entity);
  }

  get dbId() {
    return this.entity.id;
  }

  get name() {
    return this.entity.name;
  }

  get resolved() {
    return this.checked;
  }

  get checked() {
    return this.entity.isChecked;
  }

  get videoId() {
    return this.entity.videoId;
  }
}
