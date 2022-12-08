import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { type Relation } from "typeorm";

import { Video } from "./videos.js";

@Entity("video_titles")
@Index(["video"], { where: '"isPrimary" = TRUE', unique: true })
export class VideoTitle {
  @PrimaryColumn("varchar", { length: 26 })
  id!: string;

  @Column("text", { nullable: false })
  title!: string;

  @Column("boolean", { nullable: false, default: false })
  isPrimary!: boolean;

  @ManyToOne(() => Video, { nullable: false })
  video!: Relation<Video>;

  @CreateDateColumn({ type: "timestamptz" })
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  readonly updatedAt!: Date;
}
