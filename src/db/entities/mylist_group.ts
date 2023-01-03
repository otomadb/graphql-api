import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

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
}
