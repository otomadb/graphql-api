import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Video } from "./videos.js";

@Entity("video_thumbnails")
export class VideoThumbnail {
  @PrimaryColumn("varchar", { length: 26 })
  id!: string;

  @Column("text", { nullable: false })
  imageUrl!: string;

  @Column("boolean", { nullable: false, default: false })
  primary!: boolean;

  @ManyToOne((type) => Video, { nullable: false })
  video!: Video;

  @CreateDateColumn({ type: "timestamptz" })
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  readonly updatedAt!: Date;
}
