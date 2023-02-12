import { Semitag } from "@prisma/client";

export class SemitagModel {
  constructor(private readonly entity: Semitag) {}

  get dbId() {
    return this.entity.id;
  }

  get name() {
    return this.entity.name;
  }

  get resolved() {
    return this.entity.isChecked;
  }

  get videoTagId() {
    return this.entity.videoTagId;
  }

  get videoId() {
    return this.entity.videoId;
  }
}
