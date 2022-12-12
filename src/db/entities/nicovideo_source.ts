import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, Unique, UpdateDateColumn } from "typeorm";
import { type Relation } from "typeorm";

import { Video } from "./videos.js";

@Entity("nicovideo_video_source")
@Unique(["video"])
export class NicovideoVideoSource {
  @PrimaryColumn("varchar", { length: 26 })
  id!: string;

  @Column("citext", { nullable: false, unique: true })
  sourceId!: string;

  @ManyToOne(() => Video, { nullable: false })
  video!: Relation<Video>;

  @CreateDateColumn({ type: "timestamptz" })
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  readonly updatedAt!: Date;
}
