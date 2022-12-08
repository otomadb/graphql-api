import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { type Relation } from "typeorm";

import { Tag } from "./tags.js";

@Entity("tag_names")
export class TagName {
  @PrimaryColumn("varchar", { length: 26 })
  id!: string;

  @Column("text", { nullable: false })
  name!: string;

  @Column("boolean", { nullable: false, default: false })
  primary!: boolean;

  @ManyToOne(() => Tag)
  tag!: Relation<Tag>;

  @CreateDateColumn({ type: "timestamptz" })
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  readonly updatedAt!: Date;
}
