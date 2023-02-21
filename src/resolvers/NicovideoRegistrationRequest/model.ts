import { NicovideoRegistrationRequest } from "@prisma/client";

export class NicovideoRegistrationRequestModel {
  constructor(private readonly request: NicovideoRegistrationRequest) {}

  get dbId() {
    return this.request.id;
  }

  get sourceId() {
    return this.request.sourceId;
  }

  get title() {
    return this.request.title;
  }

  get checked() {
    return this.request.isChecked;
  }

  get requestedById() {
    return this.request.requestedById;
  }
}
