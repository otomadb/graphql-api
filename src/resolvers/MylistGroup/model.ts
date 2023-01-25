import { MylistGroup } from ".prisma/client";

export class MylistGroupModel {
  constructor(private readonly entity: MylistGroup) {}

  get id() {
    return this.entity.id;
  }

  get title() {
    return this.entity.title;
  }

  get createdAt() {
    return this.entity.createdAt;
  }

  get updatedAt() {
    return this.entity.updatedAt;
  }

  get holderId() {
    return this.entity.holderId;
  }
}
