import { BilibiliRegistrationRequestEvent } from "@prisma/client";

export class BilibiliRegistrationRequestEventDTO {
  protected constructor(protected readonly event: BilibiliRegistrationRequestEvent) {}

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

export class BilibiliRegistrationRequestRequestEventDTO extends BilibiliRegistrationRequestEventDTO {
  constructor(event: BilibiliRegistrationRequestEvent) {
    super(event);
  }
}

export class BilibiliRegistrationRequestAcceptEventDTO extends BilibiliRegistrationRequestEventDTO {
  constructor(event: BilibiliRegistrationRequestEvent) {
    super(event);
  }
}

export class BilibiliRegistrationRequestRejectEventDTO extends BilibiliRegistrationRequestEventDTO {
  constructor(event: BilibiliRegistrationRequestEvent) {
    super(event);
  }
}
