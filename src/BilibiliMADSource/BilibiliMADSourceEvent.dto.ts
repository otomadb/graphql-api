import { BilibiliMADSourceEvent } from "@prisma/client";

export class BilibiliMADSourceEventDTO {
  private constructor(
    private readonly event: {
      id: string;
      userId: string;
      sourceId: string;
      type: "CREATE";
      createdAt: Date;
    },
  ) {}

  public static fromPrisma(source: BilibiliMADSourceEvent) {
    return new BilibiliMADSourceEventDTO({
      id: source.id,
      userId: source.userId,
      sourceId: source.sourceId,
      type: source.type,
      createdAt: source.createdAt,
    });
  }

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

  get sourceId() {
    return this.event.sourceId;
  }

  get type() {
    return this.event.type;
  }
}
