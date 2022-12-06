import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, Relation, UpdateDateColumn } from "typeorm";

import { Video } from "./videos.js";

@Entity("video_sources")
export class VideoSource {
  @PrimaryColumn("varchar", { length: 26 })
  id!: string;

  @Column("text", { nullable: false })
  source!: string;

  @Column("text", { nullable: false })
  sourceVideoId!: string;

  @ManyToOne(() => Video, { nullable: false })
  video!: Relation<Video>;

  @CreateDateColumn({ type: "timestamptz" })
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  readonly updatedAt!: Date;
}
