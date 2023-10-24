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
  eventId: string;

  constructor(createdAt: Date | string, payload: { requestId: string; eventId: string }) {
    this.createdAt = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
    this.requestId = payload.requestId;
    this.eventId = payload.eventId;
  }
}
