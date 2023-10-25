import { SoundcloudRegistrationRequest } from "@prisma/client";

export class SoundcloudRegistrationRequestDTO {
  private constructor(private readonly request: SoundcloudRegistrationRequest) {}

  public static fromPrisma(conn: SoundcloudRegistrationRequest) {
    return new SoundcloudRegistrationRequestDTO(conn);
  }

  get dbId() {
    return this.request.id;
  }

  get sourceId() {
    return this.request.sourceId;
  }

  get title() {
    return this.request.title;
  }

  get thumbnailUrl() {
    return this.request.thumbnailUrl;
  }

  get checked() {
    return this.request.isChecked;
  }

  get requestedById() {
    return this.request.requestedById;
  }
}
