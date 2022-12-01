import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, Relation, UpdateDateColumn } from "typeorm";
import { VideoTag } from "./video_tags.js";

@Entity("tags")
export class Tag {
  @PrimaryColumn("varchar", { length: 26 })
  id!: string;

  @Column("text", { nullable: false, unique: true })
  name!: string;

  @CreateDateColumn({ type: "timestamptz" })
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  readonly updatedAt!: Date;

  @OneToMany(() => VideoTag, (videoTag) => videoTag.tag)
  videoTags!: Relation<VideoTag[]>;
}
