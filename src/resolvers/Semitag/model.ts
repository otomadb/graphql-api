import { Semitag } from "@prisma/client";

export class SemitagModel {
  constructor(private readonly entity: Semitag) {}

  get dbId() {
    return this.entity.id;
  }

  get name() {
    return this.entity.name;
  }

  get resolved() {
    return this.checked;
  }

  get checked() {
    return this.entity.isChecked;
  }

  get videoId() {
    return this.entity.videoId;
  }
}

export class SemitagRejectingModel {
  constructor(
    private readonly entity: {
      semitagId: string;
      note: string | null;
    }
  ) {}

  get semitagId() {
    return this.entity.semitagId;
  }

  get note() {
    return this.entity.note;
  }
}

export class SemitagResolvingModel {
  constructor(private readonly entity: { semitagId: string; videoTagId: string; note: string | null }) {}

  get semitagId() {
    return this.entity.semitagId;
  }

  get note() {
    return this.entity.note;
  }

  get videoTagId() {
    return this.entity.videoTagId;
  }
}
