export class MadRegisteredTimelineEventDTO {
  createdAt: Date;
  videoId: string;
  eventId: string;

  constructor(createdAt: Date | string, payload: { videoId: string; eventId: string }) {
    this.createdAt = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
    this.videoId = payload.videoId;
    this.eventId = payload.eventId;
  }
}

export class NicovideoMadRequestedTimelineEventDTO {
  createdAt: Date;
  requestId: string;
  eventId: string;

  constructor(createdAt: Date | string, payload: { requestId: string; eventId: string }) {
    this.createdAt = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
    this.requestId = payload.requestId;
    this.eventId = payload.eventId;
  }
}

export class YoutubeMadRequestedTimelineEventDTO {
  createdAt: Date;
  requestId: string;

  constructor(createdAt: Date | string, payload: { requestId: string }) {
    this.createdAt = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
    this.requestId = payload.requestId;
  }
}

export class YoutubeMadRequestAcceptedTimelineEventDTO {
  createdAt: Date;
  checkingId: string;

  constructor(createdAt: Date | string, payload: { checkingId: string }) {
    this.createdAt = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
    this.checkingId = payload.checkingId;
  }
}

export class YoutubeMadRequestRejectedTimelineEventDTO {
  createdAt: Date;
  checkingId: string;

  constructor(createdAt: Date | string, payload: { checkingId: string }) {
    this.createdAt = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
    this.checkingId = payload.checkingId;
  }
}

export class YoutubeMadRequestResolvedTimelineEventDTO {
  createdAt: Date;
  checkingId: string;

  constructor(createdAt: Date | string, payload: { checkingId: string }) {
    this.createdAt = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
    this.checkingId = payload.checkingId;
  }
}

export class SoundcloudMadRequestedTimelineEventDTO {
  createdAt: Date;
  requestId: string;
  eventId: string;

  constructor(createdAt: Date | string, payload: { requestId: string; eventId: string }) {
    this.createdAt = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
    this.requestId = payload.requestId;
    this.eventId = payload.eventId;
  }
}

export class BilibiliMadRequestedTimelineEventDTO {
  createdAt: Date;
  requestId: string;
  eventId: string;

  constructor(createdAt: Date | string, payload: { requestId: string; eventId: string }) {
    this.createdAt = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
    this.requestId = payload.requestId;
    this.eventId = payload.eventId;
  }
}
