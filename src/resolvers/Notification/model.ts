import { Notification } from "@prisma/client";

export class NotificationModel {
  protected constructor(
    protected readonly entity: {
      id: string;
      notifyToId: string;
      isWatched: boolean;
      createdAt: Date;
      type: Notification["type"];
      payload: Notification["payload"];
    }
  ) {}

  public static fromPrisma({ id, type, payload, notifyToId, isWatched, createdAt }: Notification) {
    return new NotificationModel({ id, type, payload, notifyToId, isWatched, createdAt });
  }

  get dbId() {
    return this.entity.id;
  }

  get notifyToId() {
    return this.entity.notifyToId;
  }

  get createdAt() {
    return this.entity.createdAt;
  }

  get type() {
    return this.entity.type;
  }

  get isWatched() {
    return this.entity.isWatched;
  }

  get payload() {
    return this.entity.payload;
  }
}
