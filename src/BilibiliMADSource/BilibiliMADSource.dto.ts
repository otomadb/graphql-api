import { BilibiliMADSource } from "@prisma/client";

import { GraphQLNotExistsInDBError } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";

export class BilibiliMADSourceDTO {
  private constructor(private readonly source: { id: string; sourceId: string; videoId: string }) {}

  public static fromPrisma(source: BilibiliMADSource) {
    return new BilibiliMADSourceDTO({
      id: source.id,
      sourceId: source.sourceId,
      videoId: source.videoId,
    });
  }

  public static getBySourceId(prisma: ResolverDeps["prisma"], sourceId: string) {
    return prisma.bilibiliMADSource
      .findUniqueOrThrow({ where: { sourceId } })
      .then((v) => BilibiliMADSourceDTO.fromPrisma(v))
      .catch(() => {
        throw new GraphQLNotExistsInDBError("BilibiliMADSource", sourceId);
      });
  }

  get id() {
    return this.source.id;
  }

  get sourceId() {
    return this.source.sourceId;
  }

  get videoId() {
    return this.source.videoId;
  }
}
