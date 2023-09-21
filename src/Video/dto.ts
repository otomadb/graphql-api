import { Connection, Edge, PageInfo } from "@devoxa/prisma-relay-cursor-connection";
import {
  Video,
  VideoEvent,
  VideoTag,
  VideoTagEvent,
  VideoThumbnail,
  VideoThumbnailEvent,
  VideoTitle,
  VideoTitleEvent,
} from "@prisma/client";

import { GraphQLNotExistsInDBError } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";

export class VideoDTO {
  constructor(private readonly video: Video) {}

  get id() {
    return this.video.id;
  }

  get serial() {
    return this.video.serial;
  }

  public static getPrismaClientById(prisma: ResolverDeps["prisma"], videoId: string) {
    return prisma.video
      .findUniqueOrThrow({ where: { id: videoId } })
      .then((v) => new VideoDTO(v))
      .catch(() => {
        throw new GraphQLNotExistsInDBError("Video", videoId);
      });
  }
}

export class VideoEventDTO {
  constructor(protected readonly event: VideoEvent) {}

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

  get videoId() {
    return this.event.videoId;
  }

  get type() {
    return this.event.type;
  }

  get payload() {
    return this.event.payload;
  }
}

export class VideoConnectionDTO {
  constructor(
    private readonly conn: {
      nodes: Video[];
      edges: Edge<Video>[];
      pageInfo: PageInfo;
      totalCount: number;
    },
  ) {}

  static fromPrisma(conn: Connection<Video, Edge<Video>>) {
    return new VideoConnectionDTO(conn);
  }

  get nodes() {
    return this.conn.nodes;
  }

  get edges() {
    return this.conn.edges;
  }

  get pageInfo() {
    return this.conn.pageInfo;
  }

  get totalCount() {
    return this.conn.totalCount;
  }
}

export class VideoSimilarityDTO {
  constructor(
    private readonly entity: {
      score: number;
      originId: string;
      toId: string;
    },
  ) {}

  get score() {
    return this.entity.score;
  }

  get originId() {
    return this.entity.originId;
  }

  get toId() {
    return this.entity.toId;
  }
}

export class VideoTagDTO {
  constructor(protected readonly videoThumbnail: VideoTag) {}

  public static fromPrisma(videoThumbnail: VideoTag) {
    return new VideoTagDTO(videoThumbnail);
  }

  get id() {
    return this.videoThumbnail.id;
  }

  get videoId() {
    return this.videoThumbnail.videoId;
  }

  get tagId() {
    return this.videoThumbnail.tagId;
  }
}

export class VideoTagConnectionDTO {
  constructor(
    private readonly conn: {
      nodes: VideoTag[];
      edges: Edge<VideoTag>[];
      pageInfo: PageInfo;
      totalCount: number;
    },
  ) {}

  static fromPrisma(conn: Connection<VideoTag, Edge<VideoTag>>) {
    return new VideoTagConnectionDTO(conn);
  }

  get nodes() {
    return this.conn.nodes;
  }

  get edges() {
    return this.conn.edges;
  }

  get pageInfo() {
    return this.conn.pageInfo;
  }

  get totalCount() {
    return this.conn.totalCount;
  }
}

export class VideoTagEventDTO {
  constructor(protected readonly event: VideoTagEvent) {}

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

  get videoTagId() {
    return this.event.videoTagId;
  }

  get type() {
    return this.event.type;
  }
}

export class VideoThumbnailDTO {
  constructor(protected readonly videoThumbnail: VideoThumbnail) {}

  get id() {
    return this.videoThumbnail.id;
  }

  get imageUrl() {
    return this.videoThumbnail.imageUrl;
  }

  get primary() {
    return this.videoThumbnail.isPrimary;
  }

  get videoId() {
    return this.videoThumbnail.videoId;
  }
}

export class VideoThumbnailEventDTO {
  constructor(protected readonly event: VideoThumbnailEvent) {}

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

  get videoThumbnailId() {
    return this.event.videoThumbnailId;
  }

  get type() {
    return this.event.type;
  }
}

export class VideoTitleDTO {
  constructor(protected readonly videoTitle: VideoTitle) {}

  get id() {
    return this.videoTitle.id;
  }

  get title() {
    return this.videoTitle.title;
  }

  get primary() {
    return this.videoTitle.isPrimary;
  }

  get videoId() {
    return this.videoTitle.videoId;
  }
}

export class VideoTitleEventDTO {
  constructor(protected readonly event: VideoTitleEvent) {}

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

  get videoTitleId() {
    return this.event.videoTitleId;
  }

  get type() {
    return this.event.type;
  }
}

export class VideoSearchItemByTitleDTO {
  private constructor(private readonly entity: { titleId: string; videoId: string }) {}

  static make(entity: { titleId: string; videoId: string }) {
    return new VideoSearchItemByTitleDTO(entity);
  }

  get titleId() {
    return this.entity.titleId;
  }

  get videoId() {
    return this.entity.videoId;
  }
}
