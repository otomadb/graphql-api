import { MylistGroupMylistInclsion } from ".prisma/client";

export class MylistGroupMylistInclusionModel {
  constructor(private readonly entity: MylistGroupMylistInclsion) {}

  get id() {
    return this.entity.id;
  }

  get createdAt() {
    return this.entity.createdAt;
  }

  get updatedAt() {
    return this.entity.updatedAt;
  }

  get groupId() {
    return this.entity.groupId;
  }

  get mylistId() {
    return this.entity.mylistId;
  }
}
