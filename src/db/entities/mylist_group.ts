import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";

import { Mylist } from "./mylists.js";
import { User } from "./users.js";

@Entity("mylist_groups")
export class MylistGroup {
  @PrimaryColumn("varchar", { length: 26 })
  id!: string;

  @CreateDateColumn({ type: "timestamptz" })
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  readonly updatedAt!: Date;

  @Column("text", { nullable: false })
  title!: string;

  @ManyToOne(() => User, { nullable: false })
  holder!: User;
}

@Entity("mylist_group_mylist_inclusions")
export class MylistGroupMylistInclusion {
  @PrimaryColumn("varchar", { length: 26 })
  id!: string;

  @CreateDateColumn({ type: "timestamptz" })
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  readonly updatedAt!: Date;

  @ManyToOne(() => MylistGroup)
  group!: MylistGroup;

  @ManyToOne(() => Mylist)
  mylist!: Mylist;
}
