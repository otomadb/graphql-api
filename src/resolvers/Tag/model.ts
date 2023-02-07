import { Tag } from "@prisma/client";

export class TagModel {
  constructor(private readonly tag: Tag) {}

  get id() {
    return this.tag.id;
  }

  get serial() {
    return this.tag.serial;
  }

  get meaningless() {
    return this.tag.meaningless;
  }
}
