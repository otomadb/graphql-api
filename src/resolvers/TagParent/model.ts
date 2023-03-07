import { TagParent } from "@prisma/client";

export class TagParentModel {
  constructor(protected readonly event: TagParent) {}

  static fromPrisma(e: TagParent) {
    return new TagParentModel(e);
  }

  get id() {
    return this.event.id;
  }

  get explicit() {
    return this.event.isExplicit;
  }

  get parentId() {
    return this.event.parentId;
  }

  get childId() {
    return this.event.childId;
  }
}
