import { TagNameEvent } from "@prisma/client";

export class TagNameEventModel {
  constructor(protected readonly event: TagNameEvent) {}

  get id() {
    return this.event.id;
  }

  get series() {
    return this.id;
  }

  get createdAt() {
    return this.event.createdAt;
  }

  get userId() {
    return this.event.userId;
  }

  get tagNameId() {
    return this.event.tagNameId;
  }

  get type() {
    return this.event.type;
  }
}
