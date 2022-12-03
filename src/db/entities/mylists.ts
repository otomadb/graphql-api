import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryColumn, Unique, UpdateDateColumn } from "typeorm";
import { User } from "./users.js";

// 項目を変更する時は TypeORM が生成するマイグレーションコードをちゃんと読むこと！
// なんかうまく追加してくれず一旦全消去からの再追加みたいなコードを吐かれたことがあったような気がする
// PostgreSQL の ENUM に追加するには ALTER TYPE type_name ADD VALUE を使う (削除は面倒)
// https://www.postgresql.jp/document/14/html/sql-altertype.html
export enum MylistShareRange {
  PUBLIC = "PUBLIC",
  KNOW_LINK = "KNOW_LINK",
  PRIVATE = "PRIVATE",
}

@Entity("mylists")
export class Mylist {
  @PrimaryColumn("varchar", { length: 26 })
  id!: string;

  @CreateDateColumn({ type: "timestamptz" })
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  readonly updatedAt!: Date;

  @Column("text", { nullable: false })
  title!: string;

  @ManyToOne((type) => User, { nullable: false })
  @Index("IDX_mylists_holder_like_list", { unique: true, where: '"isLikeList" == true' })
  @Index("IDX_mylists_holder_mylists", { where: '"isLikeList" == false' })
  holder!: User;

  @Column("enum", { enum: MylistShareRange })
  range!: MylistShareRange;

  @Column("boolean", { nullable: false })
  isLikeList!: boolean;
}
