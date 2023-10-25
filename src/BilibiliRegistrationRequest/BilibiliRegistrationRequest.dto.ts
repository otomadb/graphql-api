import { BilibiliRegistrationRequest } from "@prisma/client";

export class BilibiliRegistrationRequestDTO {
  private constructor(private readonly request: BilibiliRegistrationRequest) {}

  public static fromPrisma(conn: BilibiliRegistrationRequest) {
    return new BilibiliRegistrationRequestDTO(conn);
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
