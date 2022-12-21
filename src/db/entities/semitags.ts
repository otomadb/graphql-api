import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  Relation,
  UpdateDateColumn,
} from "typeorm";

import { Tag } from "./tags.js";
import { Video } from "./videos.js";

@Entity("semitags")
export class Semitag {
  @PrimaryColumn("varchar", { length: 26 })
  id!: string;

  @Column("text", { nullable: false })
  name!: string;

  @CreateDateColumn({ type: "timestamptz" })
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  readonly updatedAt!: Date;

  @Column("boolean", { nullable: false, default: false })
  resolved!: boolean;

  @OneToOne(() => Video, (source) => source.id)
  @JoinColumn()
  video!: Relation<Video>;

  @ManyToOne(() => Tag, (source) => source.id, { nullable: true })
  tag!: Relation<Tag> | null;
}
