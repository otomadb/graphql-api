import { MigrationInterface, QueryRunner } from "typeorm";

export class FixTagParentTable1670084533590 implements MigrationInterface {
  name = "FixTagParentTable1670084533590";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "tag_parents" DROP CONSTRAINT "FK_c3366628a58a2ffe51f87c02458"
        `);
    await queryRunner.query(`
            ALTER TABLE "tag_parents" DROP COLUMN "tagId"
        `);
    await queryRunner.query(`
            ALTER TABLE "tag_parents"
            ADD "parentId" character varying(26)
        `);
    await queryRunner.query(`
            ALTER TABLE "tag_parents"
            ADD "childId" character varying(26)
        `);
    await queryRunner.query(`
            ALTER TABLE "tag_parents"
            ADD CONSTRAINT "FK_f22a29123c357c414694215e018" FOREIGN KEY ("parentId") REFERENCES "tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "tag_parents"
            ADD CONSTRAINT "FK_ce25fe074ec6e65ce7e8f078a00" FOREIGN KEY ("childId") REFERENCES "tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "tag_parents" DROP CONSTRAINT "FK_ce25fe074ec6e65ce7e8f078a00"
        `);
    await queryRunner.query(`
            ALTER TABLE "tag_parents" DROP CONSTRAINT "FK_f22a29123c357c414694215e018"
        `);
    await queryRunner.query(`
            ALTER TABLE "tag_parents" DROP COLUMN "childId"
        `);
    await queryRunner.query(`
            ALTER TABLE "tag_parents" DROP COLUMN "parentId"
        `);
    await queryRunner.query(`
            ALTER TABLE "tag_parents"
            ADD "tagId" character varying(26)
        `);
    await queryRunner.query(`
            ALTER TABLE "tag_parents"
            ADD CONSTRAINT "FK_c3366628a58a2ffe51f87c02458" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
