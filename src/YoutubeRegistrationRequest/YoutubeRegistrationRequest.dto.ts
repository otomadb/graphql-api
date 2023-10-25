import { YoutubeRegistrationRequest } from "@prisma/client";

export class YoutubeRegistrationRequestDTO {
  private constructor(private readonly request: YoutubeRegistrationRequest) {}

  public static fromPrisma(conn: YoutubeRegistrationRequest) {
    return new YoutubeRegistrationRequestDTO(conn);
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
