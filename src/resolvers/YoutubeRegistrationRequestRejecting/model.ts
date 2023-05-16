import { YoutubeRegistrationRequestChecking } from "@prisma/client";

export class YoutubeRegistrationRequestRejectingModel {
  private constructor(
    private readonly request: {
      id: string;
      note: string | null;
      requestId: string;
      checkedById: string;
    }
  ) {}

  public static fromPrisma({ id, checkedById, requestId, note }: YoutubeRegistrationRequestChecking) {
    return new YoutubeRegistrationRequestRejectingModel({
      id,
      checkedById,
      requestId,
      note,
    });
  }

  get dbId() {
    return this.request.id;
  }

  get note() {
    return this.request.note;
  }

  get requestId() {
    return this.request.requestId;
  }

  get checkedById() {
    return this.request.checkedById;
  }
}
