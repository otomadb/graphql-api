import { NicovideoRegistrationRequestChecking } from "@prisma/client";

export class NicovideoRegistrationRequestAcceptingModel {
  private constructor(
    private readonly entity: {
      id: string;
      note: string | null;
      requestId: string;
      checkedById: string;
      videoId: string;
    }
  ) {}

  public static fromPrisma({ id, checkedById, requestId, note, videoId }: NicovideoRegistrationRequestChecking) {
    if (!videoId) throw new Error("videoId is null");

    return new NicovideoRegistrationRequestAcceptingModel({
      id,
      checkedById,
      requestId,
      note,
      videoId,
    });
  }

  get dbId() {
    return this.entity.id;
  }

  get note() {
    return this.entity.note;
  }

  get requestId() {
    return this.entity.requestId;
  }

  get checkedById() {
    return this.entity.checkedById;
  }

  get videoId() {
    return this.entity.videoId;
  }
}
