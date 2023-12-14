import { YoutubeRegistrationRequestChecking } from "@prisma/client";

export class YoutubeRegistrationRequestCheckingDTO {
  private constructor(
    private readonly p: {
      id: string;
      requestId: string;
    },
  ) {}

  static fromPrisma(p: YoutubeRegistrationRequestChecking) {
    return new YoutubeRegistrationRequestCheckingDTO(p);
  }

  get id() {
    return this.p.id;
  }

  get requestId() {
    return this.p.requestId;
  }
}
