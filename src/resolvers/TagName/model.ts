import { TagName } from "@prisma/client";

export class TagNameModel {
  constructor(protected readonly event: TagName) {}

  get id() {
    return this.event.id;
  }

  get name() {
    return this.event.name;
  }

  get primary() {
    return this.event.isPrimary;
  }
}
