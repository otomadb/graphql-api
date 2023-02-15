import { TagEvent } from "@prisma/client";

export class TagEventModel {
  constructor(protected readonly event: TagEvent) {}

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

  get tagId() {
    return this.event.tagId;
  }

  get type() {
    return this.event.type;
  }

  get payload() {
    return this.event.payload;
  }
}
