import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSemitagReleation1671625212583 implements MigrationInterface {
    name = 'AddSemitagReleation1671625212583'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "semitags"
            ADD "videoId" character varying(26)
        `);
        await queryRunner.query(`
            ALTER TABLE "semitags"
            ADD CONSTRAINT "UQ_037d6465fa7dd9a195533416f63" UNIQUE ("videoId")
        `);
        await queryRunner.query(`
            ALTER TABLE "semitags"
            ADD "tagId" character varying(26)
        `);
        await queryRunner.query(`
            ALTER TABLE "semitags"
            ADD CONSTRAINT "UQ_3e324d47c1a1d957e2e6f2d9afc" UNIQUE ("tagId")
        `);
        await queryRunner.query(`
            ALTER TABLE "semitags"
            ADD CONSTRAINT "FK_037d6465fa7dd9a195533416f63" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "semitags"
            ADD CONSTRAINT "FK_3e324d47c1a1d957e2e6f2d9afc" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "semitags" DROP CONSTRAINT "FK_3e324d47c1a1d957e2e6f2d9afc"
        `);
        await queryRunner.query(`
            ALTER TABLE "semitags" DROP CONSTRAINT "FK_037d6465fa7dd9a195533416f63"
        `);
        await queryRunner.query(`
            ALTER TABLE "semitags" DROP CONSTRAINT "UQ_3e324d47c1a1d957e2e6f2d9afc"
        `);
        await queryRunner.query(`
            ALTER TABLE "semitags" DROP COLUMN "tagId"
        `);
        await queryRunner.query(`
            ALTER TABLE "semitags" DROP CONSTRAINT "UQ_037d6465fa7dd9a195533416f63"
        `);
        await queryRunner.query(`
            ALTER TABLE "semitags" DROP COLUMN "videoId"
        `);
    }

}
