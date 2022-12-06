import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, Relation, UpdateDateColumn } from "typeorm";

import { Video } from "./videos.js";

@Entity("video_thumbnails")
export class VideoThumbnail {
  @PrimaryColumn("varchar", { length: 26 })
  id!: string;

  @Column("text", { nullable: false })
  imageUrl!: string;

  @Column("boolean", { nullable: false, default: false })
  primary!: boolean;

  @ManyToOne(() => Video, { nullable: false })
  video!: Relation<Video>;

  @CreateDateColumn({ type: "timestamptz" })
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  readonly updatedAt!: Date;
}
