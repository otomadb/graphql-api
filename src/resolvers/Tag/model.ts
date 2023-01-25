import { Tag } from "@prisma/client";

export class TagModel {
  public id;
  public meaningless;

  constructor(tag: Tag) {
    this.id = tag.id;
    this.meaningless = tag.meaningless;
  }
}
