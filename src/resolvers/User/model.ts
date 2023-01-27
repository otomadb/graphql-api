import { User } from "@prisma/client";

export class UserModel {
  constructor(private readonly entity: User) {}

  get id() {
    return this.entity.id;
  }

  get name() {
    return this.entity.name;
  }

  get displayName() {
    return this.entity.displayName;
  }

  get icon() {
    return this.entity.icon;
  }

  get role() {
    return this.entity.role;
  }
}
