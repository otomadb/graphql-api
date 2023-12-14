export class YoutubeRegistrationRequestEventDTO {
  protected constructor(
    protected readonly event: {
      requestId: string;
      firedBy: string;
      createdAt: Date;
    },
  ) {}

  get id() {
    return this.createdAt.getTime();
  }

  get series() {
    return this.createdAt.getTime();
  }

  get createdAt() {
    return this.event.createdAt;
  }

  get userId() {
    return this.event.firedBy;
  }

  get requestId() {
    return this.event.requestId;
  }
}

export class YoutubeRegistrationRequestRequestEventDTO extends YoutubeRegistrationRequestEventDTO {
  constructor(event: { createdAt: Date; firedBy: string; requestId: string }) {
    super(event);
  }
}
