import { Tag } from "@prisma/client";

export class TagModel {
  constructor(private readonly tag: Tag) {}

  static fromPrisma(tag: Tag) {
    return new TagModel(tag);
  }

  get id() {
    return this.tag.id;
  }

  get serial() {
    return this.tag.serial;
  }

  get isCategoryTag() {
    return this.tag.isCategoryTag;
  }
}
