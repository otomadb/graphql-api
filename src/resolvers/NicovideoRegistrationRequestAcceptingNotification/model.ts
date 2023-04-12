import { Notification } from "@prisma/client";

import { NotificationModel } from "../Notification/model.js";

export class NicovideoRegistrationRequestRejectingNotificationModel extends NotificationModel {
  private constructor(entity: Notification) {
    super(entity);
  }

  get acceptingId() {
    console.log(this.payload());
    return this.payload();
  }
}
