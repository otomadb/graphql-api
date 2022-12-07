import { CreateDateColumn, Entity, ManyToOne, PrimaryColumn, Unique, UpdateDateColumn } from "typeorm";
import { type Relation } from "typeorm";

import { Tag } from "./tags.js";
import { Video } from "./videos.js";

@Entity("video_tags")
@Unique(["tag", "video"])
export class VideoTag {
  @PrimaryColumn("varchar", { length: 26 })
  id!: string;

  @ManyToOne(() => Tag, { nullable: false })
  tag!: Relation<Tag>;

  @ManyToOne(() => Video, { nullable: false })
  video!: Relation<Video>;

  @CreateDateColumn({ type: "timestamptz" })
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  readonly updatedAt!: Date;
}
