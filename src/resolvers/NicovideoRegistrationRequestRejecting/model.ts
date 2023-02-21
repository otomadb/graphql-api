import { NicovideoRegistrationRequestChecking } from "@prisma/client";

export class NicovideoRegistrationRequestRejectingModel {
  constructor(private readonly request: NicovideoRegistrationRequestChecking) {}

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
