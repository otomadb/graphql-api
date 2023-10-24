import { YoutubeRegistrationRequestEvent } from "@prisma/client";

export class YoutubeRegistrationRequestEventDTO {
  protected constructor(protected readonly event: YoutubeRegistrationRequestEvent) {}

  get id() {
    return this.event.id;
  }
  get series() {
    return this.id;
  }

  get createdAt() {
    return this.event.createdAt;
  }

  get userId() {
    return this.event.userId;
  }

  get requestId() {
    return this.event.requestId;
  }
}

export class YoutubeRegistrationRequestRequestEventDTO extends YoutubeRegistrationRequestEventDTO {
  constructor(event: YoutubeRegistrationRequestEvent) {
    super(event);
  }
}

export class YoutubeRegistrationRequestAcceptEventDTO extends YoutubeRegistrationRequestEventDTO {
  constructor(event: YoutubeRegistrationRequestEvent) {
    super(event);
  }
}

export class YoutubeRegistrationRequestRejectEventDTO extends YoutubeRegistrationRequestEventDTO {
  constructor(event: YoutubeRegistrationRequestEvent) {
    super(event);
  }
}
