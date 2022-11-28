import { MigrationInterface, QueryRunner } from "typeorm";

export class UserNameCaseInsensitive1669633719437 implements MigrationInterface {
  name = "UserNameCaseInsensitive1669633719437";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "name" TYPE citext
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "name" TYPE text
    `);
  }
}
