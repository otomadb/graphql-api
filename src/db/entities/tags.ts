import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { type Relation } from "typeorm";

import { TagName } from "./tag_names.js";
import { TagParent } from "./tag_parents.js";
import { VideoTag } from "./video_tags.js";

@Entity("tags")
export class Tag {
  @PrimaryColumn("varchar", { length: 26 })
  id!: string;

  @Column("boolean", { default: false, nullable: false })
  meaningless!: boolean;

  @CreateDateColumn({ type: "timestamptz" })
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  readonly updatedAt!: Date;

  @OneToMany(() => VideoTag, (videoTag) => videoTag.tag)
  videoTags!: Relation<VideoTag[]>;

  @OneToMany(() => TagName, (tagName) => tagName.tag)
  tagNames!: Relation<TagName[]>;

  @OneToMany(() => TagParent, (tagParent) => tagParent.child)
  tagParents!: Relation<TagParent[]>;

  @OneToMany(() => TagParent, (tagParent) => tagParent.parent)
  tagChildrens!: Relation<TagParent[]>;
}
