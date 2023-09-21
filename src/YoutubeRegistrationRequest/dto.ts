import { Connection, Edge } from "@devoxa/prisma-relay-cursor-connection";
import { YoutubeRegistrationRequest, YoutubeRegistrationRequestChecking } from "@prisma/client";

import { AbstractConnectionModel } from "../resolvers/connection.js";

export class YoutubeRegistrationRequestDTO {
  private constructor(private readonly request: YoutubeRegistrationRequest) {}

  public static fromPrisma(conn: YoutubeRegistrationRequest) {
    return new YoutubeRegistrationRequestDTO(conn);
  }

  get dbId() {
    return this.request.id;
  }

  get sourceId() {
    return this.request.sourceId;
  }

  get title() {
    return this.request.title;
  }

  get thumbnailUrl() {
    return this.request.thumbnailUrl;
  }

  get checked() {
    return this.request.isChecked;
  }

  get requestedById() {
    return this.request.requestedById;
  }
}

export class YoutubeRegistrationRequestAcceptingDTO {
  private constructor(
    private readonly entity: {
      id: string;
      note: string | null;
      requestId: string;
      checkedById: string;
      videoId: string;
    },
  ) {}

  public static fromPrisma({ id, checkedById, requestId, note, videoId }: YoutubeRegistrationRequestChecking) {
    if (!videoId) throw new Error("videoId is null");

    return new YoutubeRegistrationRequestAcceptingDTO({
      id,
      checkedById,
      requestId,
      note,
      videoId,
    });
  }

  get dbId() {
    return this.entity.id;
  }

  get note() {
    return this.entity.note;
  }

  get requestId() {
    return this.entity.requestId;
  }

  get checkedById() {
    return this.entity.checkedById;
  }

  get videoId() {
    return this.entity.videoId;
  }
}

export class YoutubeRegistrationRequestRejectingDTO {
  private constructor(
    private readonly request: {
      id: string;
      note: string | null;
      requestId: string;
      checkedById: string;
    },
  ) {}

  public static fromPrisma({ id, checkedById, requestId, note }: YoutubeRegistrationRequestChecking) {
    return new YoutubeRegistrationRequestRejectingDTO({
      id,
      checkedById,
      requestId,
      note,
    });
  }

  get dbId() {
    return this.request.id;
  }

  get note() {
    return this.request.note;
  }

  get requestId() {
    return this.request.requestId;
  }

  get checkedById() {
    return this.request.checkedById;
  }
}

export class YoutubeRegistrationRequestConnectionDTO extends AbstractConnectionModel<YoutubeRegistrationRequest> {
  static fromPrisma(conn: Connection<YoutubeRegistrationRequest, Edge<YoutubeRegistrationRequest>>) {
    return new YoutubeRegistrationRequestConnectionDTO(conn);
  }
}

export {
  NotificationModel as YoutubeRegistrationRequestAcceptingNotificationDTO,
  NotificationModel as YoutubeRegistrationRequestRejectingNotificationDTO,
} from "../resolvers/Notification/model.js";
