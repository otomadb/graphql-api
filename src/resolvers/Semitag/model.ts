import { Semitag } from "@prisma/client";

export class SemitagModel {
  constructor(private readonly entity: Semitag) {}

  get id() {
    return this.entity.id;
  }

  get name() {
    return this.entity.name;
  }

  get isResolved() {
    return this.entity.isResolved;
  }

  get tagId() {
    return this.entity.tagId;
  }

  get videoId() {
    return this.entity.videoId;
  }
}
