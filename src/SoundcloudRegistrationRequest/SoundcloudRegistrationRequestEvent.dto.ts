import { SoundcloudRegistrationRequestEvent } from "@prisma/client";

export class SoundcloudRegistrationRequestEventDTO {
  protected constructor(protected readonly event: SoundcloudRegistrationRequestEvent) {}

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

export class SoundcloudRegistrationRequestRequestEventDTO extends SoundcloudRegistrationRequestEventDTO {
  constructor(event: SoundcloudRegistrationRequestEvent) {
    super(event);
  }
}

export class SoundcloudRegistrationRequestAcceptEventDTO extends SoundcloudRegistrationRequestEventDTO {
  constructor(event: SoundcloudRegistrationRequestEvent) {
    super(event);
  }
}

export class SoundcloudRegistrationRequestRejectEventDTO extends SoundcloudRegistrationRequestEventDTO {
  constructor(event: SoundcloudRegistrationRequestEvent) {
    super(event);
  }
}
