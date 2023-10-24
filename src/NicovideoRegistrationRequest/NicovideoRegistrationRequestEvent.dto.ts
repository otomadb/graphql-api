import { NicovideoRegistrationRequestEvent } from "@prisma/client";

export class NicovideoRegistrationRequestEventDTO {
  protected constructor(protected readonly event: NicovideoRegistrationRequestEvent) {}

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

export class NicovideoRegistrationRequestRequestEventDTO extends NicovideoRegistrationRequestEventDTO {
  constructor(event: NicovideoRegistrationRequestEvent) {
    super(event);
  }
}

export class NicovideoRegistrationRequestAcceptEventDTO extends NicovideoRegistrationRequestEventDTO {
  constructor(event: NicovideoRegistrationRequestEvent) {
    super(event);
  }
}

export class NicovideoRegistrationRequestRejectEventDTO extends NicovideoRegistrationRequestEventDTO {
  constructor(event: NicovideoRegistrationRequestEvent) {
    super(event);
  }
}
