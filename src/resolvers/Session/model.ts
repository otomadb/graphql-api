import { Session } from "@prisma/client";

export class SessionModel {
  constructor(private readonly session: Session) {}

  get id() {
    return this.session.id;
  }

  get userId() {
    return this.session.userId;
  }

  get createdAt() {
    return this.session.createdAt;
  }

  get expiredAt() {
    return this.session.expiredAt;
  }
}
