import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Mylist } from "./mylists.js";
import { Video } from "./videos.js";

@Entity("mylist_registrations")
export class MylistRegistration {
  @PrimaryColumn("varchar", { length: 26 })
  id!: string;

  @CreateDateColumn({ type: "timestamptz" })
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  readonly updatedAt!: Date;

  @ManyToOne((type) => Video)
  video!: Video;

  @ManyToOne((type) => Mylist)
  mylist!: Mylist;

  @Column("text", { nullable: true })
  note!: string | null;
}
