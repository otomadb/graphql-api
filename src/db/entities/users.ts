import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, Relation, UpdateDateColumn } from "typeorm";
import { Session } from "./sessions.js";

@Entity("users")
export class User {
  @PrimaryColumn("varchar", { length: 26 })
  id!: string;

  @Column("citext", { nullable: false, unique: true })
  name!: string;

  @Column("text", { nullable: false })
  displayName!: string;

  @Column("text", { nullable: false })
  icon!: string;

  @Column("text", { nullable: false })
  email!: string;

  @Column("boolean", { default: false, nullable: false })
  emailConfirmed!: boolean;

  @Column("text", { nullable: false })
  password!: string;

  @CreateDateColumn({ type: "timestamptz" })
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  readonly updatedAt!: Date;

  @OneToMany((_type) => Session, (session) => session.user)
  sessions!: Relation<Session[]>;
}
