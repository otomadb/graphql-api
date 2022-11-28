import { CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity("videos")
export class Video {
  @PrimaryColumn("varchar", { length: 26 })
  id!: string;

  @CreateDateColumn({ type: "timestamptz" })
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  readonly updatedAt!: Date;
}
