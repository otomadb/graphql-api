import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { type Relation } from "typeorm";

import { User } from "./users.js";

@Entity("sessions")
export class Session {
  @PrimaryColumn("varchar", { length: 26 })
  id!: string;

  @ManyToOne(() => User, { nullable: false })
  user!: Relation<User>;

  @Column("varchar", { length: 64 })
  secret!: string;

  @Column("timestamptz")
  expiredAt!: Date;

  @CreateDateColumn({ type: "timestamptz" })
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  readonly updatedAt!: Date;
}
