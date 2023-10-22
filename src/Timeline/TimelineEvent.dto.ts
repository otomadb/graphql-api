export class MadRegisteredTimelineEventDTO {
  createdAt: Date;
  videoId: string;

  constructor(createdAt: Date | string, payload: { videoId: string }) {
    this.createdAt = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
    this.videoId = payload.videoId;
  }
}

export class NicovideoMadRequestedTimelineEventDTO {
  createdAt: Date;
  requestId: string;

  constructor(createdAt: Date | string, payload: { requestId: string }) {
    this.createdAt = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
    this.requestId = payload.requestId;
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
