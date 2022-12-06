import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, Relation, UpdateDateColumn } from "typeorm";

import { Tag } from "./tags.js";

@Entity("tag_parents")
export class TagParent {
  @PrimaryColumn("varchar", { length: 26 })
  id!: string;

  @Column("boolean", { default: false, nullable: false })
  explicit!: boolean;

  @ManyToOne(() => Tag)
  parent!: Relation<Tag>;

  @ManyToOne(() => Tag)
  child!: Relation<Tag>;

  @CreateDateColumn({ type: "timestamptz" })
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  readonly updatedAt!: Date;
}
