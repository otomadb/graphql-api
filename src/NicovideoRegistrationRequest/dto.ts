import { Connection, Edge } from "@devoxa/prisma-relay-cursor-connection";
import { NicovideoRegistrationRequest } from "@prisma/client";
import { NicovideoRegistrationRequestChecking } from "@prisma/client";

import { AbstractConnectionModel } from "../resolvers/connection.js";

export class NicovideoRegistrationRequestDTO {
  constructor(private readonly request: NicovideoRegistrationRequest) {}

  public static fromPrisma(conn: NicovideoRegistrationRequest) {
    return new NicovideoRegistrationRequestDTO(conn);
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

export class NicovideoRegistrationRequestConnectionDTO extends AbstractConnectionModel<NicovideoRegistrationRequest> {
  static fromPrisma(conn: Connection<NicovideoRegistrationRequest, Edge<NicovideoRegistrationRequest>>) {
    return new NicovideoRegistrationRequestConnectionDTO(conn);
  }
}

export class NicovideoRegistrationRequestAcceptingDTO {
  private constructor(
    private readonly entity: {
      id: string;
      note: string | null;
      requestId: string;
      checkedById: string;
      videoId: string;
    },
  ) {}

  public static fromPrisma({ id, checkedById, requestId, note, videoId }: NicovideoRegistrationRequestChecking) {
    if (!videoId) throw new Error("videoId is null");

    return new NicovideoRegistrationRequestAcceptingDTO({
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

export class NicovideoRegistrationRequestRejectingDTO {
  private constructor(
    private readonly request: {
      id: string;
      note: string | null;
      requestId: string;
      checkedById: string;
    },
  ) {}

  public static fromPrisma({ id, checkedById, requestId, note }: NicovideoRegistrationRequestChecking) {
    return new NicovideoRegistrationRequestRejectingDTO({
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
