import { Connection, Edge } from "@devoxa/prisma-relay-cursor-connection";
import { Tag, TagEvent, TagName, TagNameEvent, TagParent, TagParentEvent } from "@prisma/client";

import { AbstractConnectionModel } from "../resolvers/connection.js";

export class TagDTO {
  constructor(private readonly tag: Tag) {}

  static fromPrisma(tag: Tag) {
    return new TagDTO(tag);
  }

  get id() {
    return this.tag.id;
  }

  get serial() {
    return this.tag.serial;
  }

  get disabled() {
    return this.tag.disabled;
  }
}

export class TagEventDTO {
  constructor(protected readonly event: TagEvent) {}

  get id() {
    return this.event.id;
  }

  get series() {
    return this.id;
  }

  get createdAt() {
    return this.event.createdAt;
  }

  get userId() {
    return this.event.userId;
  }

  get tagId() {
    return this.event.tagId;
  }

  get type() {
    return this.event.type;
  }

  get payload() {
    return this.event.payload;
  }
}

export class TagNameDTO {
  constructor(protected readonly event: TagName) {}

  get id() {
    return this.event.id;
  }

  get name() {
    return this.event.name;
  }

  get primary() {
    return this.event.isPrimary;
  }
}

export class TagNameEventDTO {
  constructor(protected readonly event: TagNameEvent) {}

  get id() {
    return this.event.id;
  }

  get series() {
    return this.id;
  }

  get createdAt() {
    return this.event.createdAt;
  }

  get userId() {
    return this.event.userId;
  }

  get tagNameId() {
    return this.event.tagNameId;
  }

  get type() {
    return this.event.type;
  }
}

export class TagParentDTO {
  constructor(protected readonly event: TagParent) {}

  static fromPrisma(e: TagParent) {
    return new TagParentDTO(e);
  }

  get id() {
    return this.event.id;
  }

  get explicit() {
    return this.event.isExplicit;
  }

  get parentId() {
    return this.event.parentId;
  }

  get childId() {
    return this.event.childId;
  }
}

export class TagParentConnectionDTO extends AbstractConnectionModel<TagParent> {
  static fromPrisma(conn: Connection<TagParent, Edge<TagParent>>) {
    return new TagParentConnectionDTO(conn);
  }
}

export class TagParentEventDTO {
  constructor(protected readonly event: TagParentEvent) {}

  get id() {
    return this.event.id;
  }

  get series() {
    return this.id;
  }

  get createdAt() {
    return this.event.createdAt;
  }

  get userId() {
    return this.event.userId;
  }

  get tagParentId() {
    return this.event.tagParentId;
  }

  get type() {
    return this.event.type;
  }
}
export class TagSearchItemByNameDTO {
  private constructor(private readonly entity: { nameId: string; tagId: string }) {}

  static make(entity: { nameId: string; tagId: string }) {
    return new TagSearchItemByNameDTO(entity);
  }

  get tagId() {
    return this.entity.tagId;
  }

  get nameId() {
    return this.entity.nameId;
  }
}
