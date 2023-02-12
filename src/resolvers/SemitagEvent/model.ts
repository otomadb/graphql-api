import { SemitagEvent } from "@prisma/client";

export class SemitagEventModel {
  constructor(protected readonly event: SemitagEvent) {}

  get id() {
    return this.event.id;
  }

  get userId() {
    return this.event.userId;
  }

  get semitagId() {
    return this.event.semitagId;
  }

  get type() {
    return this.event.type;
  }
}
