import { CreateDateColumn, Entity, ManyToOne, PrimaryColumn, Unique, UpdateDateColumn } from "typeorm";
import { Tag } from "./tags.js";
import { Video } from "./videos.js";

@Entity("video_tags")
@Unique(["tag", "video"])
export class VideoTag {
  @PrimaryColumn("varchar", { length: 26 })
  id!: string;

  @ManyToOne((type) => Tag, { nullable: false })
  tag!: Tag;

  @ManyToOne((type) => Video, { nullable: false })
  video!: Video;

  @CreateDateColumn({ type: "timestamptz" })
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  readonly updatedAt!: Date;
}
