import { MylistRegistration } from "@prisma/client";

export class MylistRegistrationModel {
  constructor(private readonly entity: MylistRegistration) {}

  static fromPrisma(e: MylistRegistration) {
    // TODO: isRemoved が true の場合はエラーにする
    return new MylistRegistrationModel(e);
  }

  static fromPrismaNullable(r: MylistRegistration | null) {
    if (!r || r.isRemoved) return null;
    return new MylistRegistrationModel(r);
  }

  get id() {
    return this.entity.id;
  }

  get note() {
    return this.entity.note;
  }

  get createdAt() {
    return this.entity.createdAt;
  }

  get updatedAt() {
    return this.entity.updatedAt;
  }

  get mylistId() {
    return this.entity.mylistId;
  }

  get videoId() {
    return this.entity.videoId;
  }
}
