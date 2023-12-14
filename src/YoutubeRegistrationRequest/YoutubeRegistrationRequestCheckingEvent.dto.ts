export class YoutubeRegistrationRequestCheckingEventDTO {
  protected constructor(
    protected readonly event: {
      checkingId: string;
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

  get checkingId() {
    return this.event.checkingId;
  }
}

export class YoutubeRegistrationRequestAcceptedEventDTO extends YoutubeRegistrationRequestCheckingEventDTO {
  constructor(event: { createdAt: Date; firedBy: string; checkingId: string }) {
    super(event);
  }
}

export class YoutubeRegistrationRequestRejectedEventDTO extends YoutubeRegistrationRequestCheckingEventDTO {
  constructor(event: { createdAt: Date; firedBy: string; checkingId: string }) {
    super(event);
  }
}

export class YoutubeRegistrationRequestResolvedEventDTO extends YoutubeRegistrationRequestCheckingEventDTO {
  constructor(event: { createdAt: Date; firedBy: string; checkingId: string }) {
    super(event);
  }
}
