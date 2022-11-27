import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity("users")
export class User {
  @PrimaryColumn("varchar", { length: 26 })
  id!: string;

  @Column("text", { nullable: false, unique: true })
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
}
