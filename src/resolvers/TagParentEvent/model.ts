import { TagParentEvent } from "@prisma/client";

export class TagParentEventModel {
  constructor(protected readonly event: TagParentEvent) {}

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

  get tagParentId() {
    return this.event.tagParentId;
  }

  get type() {
    return this.event.type;
  }
}
