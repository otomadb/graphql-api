import { Notification } from "@prisma/client";

export class NotificationModel {
  protected constructor(
    protected readonly entity: {
      id: string;
      notifyToId: string;
      isWatched: boolean;
      type: Notification["type"];
      payload: Notification["payload"];
    }
  ) {}

  public static fromPrisma({ id, type, payload, notifyToId, isWatched }: Notification) {
    return new NotificationModel({ id, type, payload, notifyToId, isWatched });
  }

  get dbId() {
    return this.entity.id;
  }

  get notifyToId() {
    return this.entity.notifyToId;
  }

  get type() {
    return this.entity.type;
  }

  get isWatched() {
    return this.entity.isWatched;
  }

  protected payload() {
    return this.entity.payload;
  }
}
