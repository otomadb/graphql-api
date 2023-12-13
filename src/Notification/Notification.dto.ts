import { Notification } from "@prisma/client";

export class NotificationDTO {
  protected constructor(
    protected readonly entity: {
      id: string;
      notifyToId: string;
      isWatched: boolean;
      createdAt: Date;
      type: Notification["type"];
      payload: Notification["payload"];
    },
  ) {}

  public static fromPrisma({ id, type, payload, notifyToId, isWatched, createdAt }: Notification) {
    return new NotificationDTO({ id, type, payload, notifyToId, isWatched, createdAt });
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

export {
  NotificationDTO as BilibiliRegistrationRequestAcceptingNotificationDTO,
  NotificationDTO as BilibiliRegistrationRequestRejectingNotificationDTO,
  NotificationDTO as NicovideoRegistrationRequestAcceptingNotificationDTO,
  NotificationDTO as NicovideoRegistrationRequestRejectingNotificationDTO,
  NotificationDTO as SoundcloudRegistrationRequestAcceptingNotificationDTO,
  NotificationDTO as SoundcloudRegistrationRequestRejectingNotificationDTO,
  NotificationDTO as YoutubeRegistrationRequestAcceptingNotificationDTO,
  NotificationDTO as YoutubeRegistrationRequestRejectingNotificationDTO,
} from "./Notification.dto.js";
